// Persistent key/value storage. Inside the iOS app, values are mirrored to native
// UserDefaults through a WebKit message handler (and injected back on launch as
// window.__NATIVE_STORE__), so progress survives even if WebKit clears localStorage.

interface NativeHandler {
  postMessage(message: unknown): void;
}

declare global {
  interface Window {
    __NATIVE_STORE__?: Record<string, string>;
    webkit?: { messageHandlers?: Record<string, NativeHandler | undefined> };
  }
}

export const nativeHandler = (name: string): NativeHandler | undefined =>
  window.webkit?.messageHandlers?.[name];

export function readItem(key: string): string | null {
  const nativeStore = window.__NATIVE_STORE__;
  if (nativeStore && key in nativeStore) return nativeStore[key] ?? null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string): void {
  if (window.__NATIVE_STORE__) window.__NATIVE_STORE__[key] = value;
  nativeHandler('store')?.postMessage({ key, value });
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode); the native mirror still works.
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  const raw = readItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  writeItem(key, JSON.stringify(value));
}
