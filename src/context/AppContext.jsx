import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loadPosts, savePosts, loadSettings, saveSettings,
  vaultExists, createVault, unlockVault, sessionPostsCached,
  savePostsEncrypted, lockNow, disableVault,
} from '../lib/store';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // URL ?theme=light|dark 可临时覆盖设置(便于分享确定主题的链接/截图)
  const urlTheme = new URLSearchParams(window.location.search).get('theme');
  const [settings, setSettings] = useState(() => {
    const s = loadSettings();
    if (urlTheme === 'light' || urlTheme === 'dark') return { ...s, theme: urlTheme };
    return s;
  });
  // locked 只在"已开启私密锁"时有意义;会话缓存命中则自动解锁
  const [locked, setLocked] = useState(() => settings.lockEnabled && !sessionPostsCached());
  const [posts, setPosts] = useState(() => {
    if (settings.lockEnabled) return sessionPostsCached() || [];
    return loadPosts();
  });

  /* ---------- 主题 ---------- */
  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode) => root.setAttribute('data-theme', mode);
    if (settings.theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const onChange = (e) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    apply(settings.theme);
  }, [settings.theme]);

  /* ---------- 文章 CRUD(自动适配明文/加密两种模式) ---------- */
  const persist = async (next) => {
    setPosts(next);
    if (settings.lockEnabled) {
      const passcode = sessionStorage.getItem('miniflow_session_pc');
      if (passcode) await savePostsEncrypted(next, passcode);
    } else {
      savePosts(next);
    }
  };

  const publish = ({ title, tags, content }) => {
    const post = {
      id: `p_${Date.now()}`,
      title: title.trim() || '无标题',
      tags: (tags || []).map((t) => t.trim()).filter(Boolean),
      content,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: null,
    };
    return persist([post, ...posts]);
  };

  const update = (id, patch) =>
    persist(posts.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : p)));

  const remove = (id) => persist(posts.filter((p) => p.id !== id));

  /* ---------- 私密锁 ---------- */
  const enableLock = async (passcode) => {
    await createVault(posts, passcode);
    sessionStorage.setItem('miniflow_session_pc', passcode);
    setSettings((s) => ({ ...s, lockEnabled: true, lockHint: loadSettings().lockHint }));
    setLocked(false);
  };

  const unlock = async (passcode) => {
    const unlocked = await unlockVault(passcode);
    sessionStorage.setItem('miniflow_session_pc', passcode);
    setPosts(unlocked);
    setLocked(false);
    return unlocked.length;
  };

  const lock = () => {
    lockNow();
    setPosts([]);
    setLocked(true);
  };

  const disableLock = () => {
    if (posts.length) savePosts(posts);
    disableVault();
    sessionStorage.removeItem('miniflow_session_pc');
    setSettings((s) => ({ ...s, lockEnabled: false, lockHint: '' }));
    setLocked(false);
  };

  const replaceAll = (imported) => persist(imported);

  const value = useMemo(
    () => ({
      posts, publish, update, remove, replaceAll,
      settings, setSettings,
      locked, lockEnabled: settings.lockEnabled,
      enableLock, unlock, lock, disableLock,
      vaultExists,
    }),
    [posts, settings, locked],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp 必须在 <AppProvider> 内使用');
  return ctx;
}
