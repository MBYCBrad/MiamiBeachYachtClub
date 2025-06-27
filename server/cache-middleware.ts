import { Request, Response, NextFunction } from 'express';

// In-memory cache for API responses
const responseCache = new Map<string, { data: any; timestamp: number }>();

// Cache middleware with aggressive caching
export function cacheMiddleware(duration: number = 300000) { // 5 minutes default
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cached = responseCache.get(key);

    // Return cached response if available and not expired
    if (cached && Date.now() - cached.timestamp < duration) {
      res.set({
        'X-Cache': 'HIT',
        'Cache-Control': `public, max-age=${Math.floor(duration / 1000)}, stale-while-revalidate=3600`
      });
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache the response
    res.json = function(data: any) {
      // Cache the response
      responseCache.set(key, {
        data,
        timestamp: Date.now()
      });

      // Set cache headers
      res.set({
        'X-Cache': 'MISS',
        'Cache-Control': `public, max-age=${Math.floor(duration / 1000)}, stale-while-revalidate=3600`
      });

      return originalJson(data);
    };

    next();
  };
}

// Clear old cache entries every minute
setInterval(() => {
  const now = Date.now();
  const oneHour = 3600000;
  
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > oneHour) {
      responseCache.delete(key);
    }
  }
}, 60000);