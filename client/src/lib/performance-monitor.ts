// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private apiCallTimes: Map<string, number[]> = new Map();
  private slowThreshold = 100; // milliseconds

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  trackAPICall(endpoint: string, duration: number) {
    if (!this.apiCallTimes.has(endpoint)) {
      this.apiCallTimes.set(endpoint, []);
    }
    
    const times = this.apiCallTimes.get(endpoint)!;
    times.push(duration);
    
    // Keep only last 100 measurements
    if (times.length > 100) {
      times.shift();
    }

    if (duration > this.slowThreshold) {
      console.warn(`Slow API call: ${endpoint} took ${duration.toFixed(2)}ms`);
    }
  }

  getAverageTime(endpoint: string): number {
    const times = this.apiCallTimes.get(endpoint);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }

  getSlowEndpoints(): { endpoint: string; avgTime: number }[] {
    const results: { endpoint: string; avgTime: number }[] = [];
    
    this.apiCallTimes.forEach((times, endpoint) => {
      const avgTime = this.getAverageTime(endpoint);
      if (avgTime > this.slowThreshold) {
        results.push({ endpoint, avgTime });
      }
    });
    
    return results.sort((a, b) => b.avgTime - a.avgTime);
  }

  clearMetrics() {
    this.apiCallTimes.clear();
  }
}

// Request deduplication to prevent duplicate API calls
export class RequestDeduplicator {
  private static instance: RequestDeduplicator;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  static getInstance(): RequestDeduplicator {
    if (!RequestDeduplicator.instance) {
      RequestDeduplicator.instance = new RequestDeduplicator();
    }
    return RequestDeduplicator.instance;
  }

  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If there's already a pending request for this key, return it
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Create new request and store it
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// Aggressive caching with stale-while-revalidate
export class AggressiveCache {
  private static instance: AggressiveCache;
  private cache: Map<string, { data: any; timestamp: number; staleTime: number }> = new Map();
  private memoryLimit = 50 * 1024 * 1024; // 50MB limit
  private currentSize = 0;

  static getInstance(): AggressiveCache {
    if (!AggressiveCache.instance) {
      AggressiveCache.instance = new AggressiveCache();
    }
    return AggressiveCache.instance;
  }

  set(key: string, data: any, staleTime: number = 15 * 60 * 1000) { // 15 minutes default
    const serialized = JSON.stringify(data);
    const size = new TextEncoder().encode(serialized).length;

    // Evict old entries if we're over the memory limit
    while (this.currentSize + size > this.memoryLimit && this.cache.size > 0) {
      const oldestKey = this.findOldestEntry();
      if (oldestKey) {
        this.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime
    });
    this.currentSize += size;
  }

  get(key: string): { data: any; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.staleTime;

    return { data: entry.data, isStale };
  }

  delete(key: string) {
    const entry = this.cache.get(key);
    if (entry) {
      const size = new TextEncoder().encode(JSON.stringify(entry.data)).length;
      this.currentSize -= size;
      this.cache.delete(key);
    }
  }

  private findOldestEntry(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    return oldestKey;
  }

  clear() {
    this.cache.clear();
    this.currentSize = 0;
  }
}

// Prefetch critical data
export async function prefetchCriticalData() {
  const criticalEndpoints = [
    '/api/yachts',
    '/api/services', 
    '/api/events',
    '/api/user',
    '/api/media/hero/active'
  ];

  // Use fetch with priority hints where supported
  const promises = criticalEndpoints.map(endpoint => 
    fetch(endpoint, { 
      priority: 'high',
      credentials: 'include'
    } as RequestInit).catch(() => null)
  );

  await Promise.all(promises);
}

// Optimized image loading
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch image preloading with concurrency control
export async function preloadImages(urls: string[], concurrency = 3): Promise<void> {
  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(url => preloadImage(url).catch(() => null)));
  }
}