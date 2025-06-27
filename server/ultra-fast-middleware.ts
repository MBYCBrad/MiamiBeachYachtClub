import { Request, Response, NextFunction } from "express";
import { memoryCache } from "./memory-cache";

// Ultra-fast middleware for millisecond responses
export const ultraFastMiddleware = (cacheKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Check memory cache first
    const cached = memoryCache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${Date.now() - start}ms`);
      res.json(cached);
      return;
    }
    
    // Store original res.json to intercept response
    const originalJson = res.json.bind(res);
    
    res.json = function(data: any) {
      // Cache the response data
      memoryCache.set(cacheKey, data);
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Response-Time', `${Date.now() - start}ms`);
      
      return originalJson(data);
    };
    
    next();
  };
};