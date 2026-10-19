/**
 * 私密锁:用 WebCrypto 把文章以 AES-GCM 加密后落盘,密钥由口令经 PBKDF2 派生。
 * 开启后 localStorage 里只有密文——拿到设备也看不到内容。
 * 口令不可恢复(没有后端):忘记 = 数据无法解密,导出备份是唯一的保险。
 */

const ENC = new TextEncoder();
const DEC = new TextDecoder();
const PBKDF2_ITER = 150_000;

const b64 = {
  enc: (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))),
  dec: (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0)),
};

async function deriveKey(passcode, salt) {
  const base = await crypto.subtle.importKey('raw', ENC.encode(passcode), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** 加密任意可 JSON 化对象 → { v, salt, iv, data } */
export async function encryptJSON(obj, passcode) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passcode, salt);
  const data = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    ENC.encode(JSON.stringify(obj)),
  );
  return { v: 1, salt: b64.enc(salt), iv: b64.enc(iv), data: b64.enc(data) };
}

/** 解密;口令错误/数据损坏时抛错 */
export async function decryptJSON(payload, passcode) {
  const salt = b64.dec(payload.salt);
  const iv = b64.dec(payload.iv);
  const key = await deriveKey(passcode, salt);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    b64.dec(payload.data),
  );
  return JSON.parse(DEC.decode(plain));
}

/** 生成随机口令的校验值(不存口令本身,用于快速验证输入是否正确) */
export async function passcodeHint(passcode) {
  const digest = await crypto.subtle.digest('SHA-256', ENC.encode('miniflow:' + passcode));
  return b64.enc(digest).slice(0, 16);
}
