// Ultra-fast in-memory cache for millisecond response times
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 300000; // 5 minutes

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const ttl = item.ttl || this.DEFAULT_TTL;
    if (Date.now() - item.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: any, ttlSeconds?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds ? ttlSeconds * 1000 : this.DEFAULT_TTL
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  clearByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Preload critical data on startup
  async preloadCriticalData(dbStorage: any): Promise<void> {
    console.log('⚡ Preloading critical data into memory cache...');
    
    // Preload all frequently accessed data
    const [yachts, services, events, users] = await Promise.all([
      dbStorage.getYachts(),
      dbStorage.getServices(),
      dbStorage.getEvents(),
      dbStorage.getAllUsers()
    ]);

    this.set('yachts', yachts);
    this.set('services', services);
    this.set('events', events);
    this.set('users', users);
    
    console.log('✅ Critical data preloaded');
  }
}

export const memoryCache = new MemoryCache();