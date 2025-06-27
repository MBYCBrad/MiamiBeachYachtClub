// Ultra-fast in-memory cache for millisecond response times
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly DEFAULT_TTL = 300000; // 5 minutes

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.DEFAULT_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
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