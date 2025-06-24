// Ultra-fast in-memory cache for millisecond response times
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class FastCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Limit cache size

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new FastCache();

// Cleanup expired entries every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);

// Cache wrapper for database queries
export function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs: number = 5 * 60 * 1000
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  return fn().then(result => {
    cache.set(key, result, ttlMs);
    return result;
  });
}