const TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`cache_${key}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > TTL) return null;
    return data as T;
  } catch {
    return null;
  }
}

export function setCached(key: string, data: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export function bustCache(...keys: string[]) {
  if (typeof window === 'undefined') return;
  keys.forEach(k => localStorage.removeItem(`cache_${k}`));
}
