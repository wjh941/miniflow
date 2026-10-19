/**
 * 数据层:文章 CRUD + 设置 + 导入导出。
 * 两种模式:
 *  - 明文模式(默认):文章数组直接存 localStorage
 *  - 私密模式:开启口令锁后,文章以 AES-GCM 密文存 localStorage(见 lib/crypto.js)
 * 导出:JSON 全量备份 / 单篇 Markdown。
 */

import { encryptJSON, decryptJSON, passcodeHint } from './crypto';

const KEY_POSTS = 'miniflow_v2_posts';
const KEY_VAULT = 'miniflow_v2_vault'; // 私密模式的密文容器
const KEY_SETTINGS = 'miniflow_v2_settings';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 存储满/隐私模式:静默失败 */
  }
}

/* ---------------- 设置 ---------------- */

const DEFAULT_SETTINGS = {
  theme: 'auto', // auto | light | dark
  lockEnabled: false,
  lockHint: '', // 口令校验值(非口令本身)
  nickname: '我',
};

export function loadSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEY_SETTINGS, {}) };
}

export function saveSettings(settings) {
  write(KEY_SETTINGS, settings);
}

/* ---------------- 文章读写(明文模式) ---------------- */

export function loadPosts() {
  return read(KEY_POSTS, []);
}

export function savePosts(posts) {
  write(KEY_POSTS, posts);
}

/* ---------------- 私密模式 ---------------- */

export function vaultExists() {
  return !!localStorage.getItem(KEY_VAULT);
}

export async function createVault(posts, passcode) {
  const payload = await encryptJSON(posts, passcode);
  write(KEY_VAULT, payload);
  const hint = await passcodeHint(passcode);
  const settings = loadSettings();
  saveSettings({ ...settings, lockEnabled: true, lockHint: hint });
  localStorage.removeItem(KEY_POSTS); // 明文撤离
}

export async function unlockVault(passcode) {
  const payload = read(KEY_VAULT, null);
  if (!payload) return loadPosts();
  const settings = loadSettings();
  if (settings.lockHint && (await passcodeHint(passcode)) !== settings.lockHint) {
    throw new Error('口令不正确');
  }
  const posts = await decryptJSON(payload, passcode);
  // 会话内缓存明文(sessionStorage),刷新页面需重新解锁
  try {
    sessionStorage.setItem('miniflow_session_posts', JSON.stringify(posts));
  } catch { /* ignore */ }
  return posts;
}

export function sessionPostsCached() {
  try {
    const raw = sessionStorage.getItem('miniflow_session_posts');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function lockNow() {
  sessionStorage.removeItem('miniflow_session_posts');
}

/** 私密模式下保存文章:重加密整个数组 */
export async function savePostsEncrypted(posts, passcode) {
  await createVault(posts, passcode);
  try {
    sessionStorage.setItem('miniflow_session_posts', JSON.stringify(posts));
  } catch { /* ignore */ }
}

export function disableVault() {
  localStorage.removeItem(KEY_VAULT);
  const settings = loadSettings();
  saveSettings({ ...settings, lockEnabled: false, lockHint: '' });
  lockNow();
}

/* ---------------- 导入导出 ---------------- */

export function exportJSON(posts) {
  const payload = {
    app: 'miniflow',
    version: 2,
    exportedAt: new Date().toISOString(),
    count: posts.length,
    posts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `miniflow-backup-${stamp()}.json`);
}

export function exportPostMarkdown(post) {
  const tags = post.tags?.length ? `\n\n---\n${post.tags.map((t) => `#${t}`).join(' ')}` : '';
  const md = `# ${post.title}\n\n${post.createdAt || ''}\n\n${post.content}${tags}\n`;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${(post.title || 'untitled').slice(0, 30)}.md`);
}

export function exportAllMarkdown(posts) {
  const md = posts
    .map((p) => `---\n\n# ${p.title}\n\n${p.createdAt || ''}\n\n${p.content}${p.tags?.length ? `\n\n${p.tags.map((t) => `#${t}`).join(' ')}` : ''}\n`)
    .join('\n');
  const blob = new Blob([md || '# 空空如也\n'], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `miniflow-all-${stamp()}.md`);
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const posts = Array.isArray(data) ? data : data.posts;
        if (!Array.isArray(posts)) throw new Error('文件里没有文章数组');
        resolve(posts);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsText(file);
  });
}

/* ---------------- 工具 ---------------- */

function stamp() {
  return new Date().toISOString().slice(0, 10);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
