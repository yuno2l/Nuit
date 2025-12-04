// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setInCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function clearCache(): void {
  cache.clear();
}
