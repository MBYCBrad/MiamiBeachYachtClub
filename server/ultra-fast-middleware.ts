import { Request, Response, NextFunction } from 'express';
import { getCachedData, invalidateRelatedCaches, ultraFastCache } from './ultra-fast-cache';

// List of endpoints to cache
const CACHED_ENDPOINTS = [
  '/api/yachts',
  '/api/services', 
  '/api/events',
  '/api/staff/stats',
  '/api/staff/yachts',
  '/api/staff/services',
  '/api/staff/events',
  '/api/staff/users',
  '/api/staff/notifications',
  '/api/staff/conversations',
  '/api/staff/bookings',
  '/api/staff/payments',
  '/api/staff/analytics',
  '/api/admin/stats',
  '/api/admin/yachts',
  '/api/admin/services',
  '/api/admin/events',
  '/api/admin/users',
  '/api/admin/bookings',
  '/api/admin/analytics',
  '/api/admin/payments',
  '/api/admin/service-bookings',
  '/api/admin/applications',
  '/api/conversations',
  '/api/notifications',
  '/api/trips',
  '/api/contact-messages',
  '/api/tour-requests',
  '/api/yacht-owner/stats',
  '/api/yacht-owner/fleet',
  '/api/service-provider/stats',
  '/api/service-provider/services'
];

// Ultra-fast cache middleware
export async function ultraFastCacheMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Check if endpoint should be cached
  const shouldCache = CACHED_ENDPOINTS.some(endpoint => req.path.startsWith(endpoint));
  if (!shouldCache) {
    return next();
  }

  // Create cache key from path and query params
  const cacheKey = `${req.path}:${JSON.stringify(req.query)}:${(req as any).user?.id || 'anonymous'}`;

  // Try to get from cache first
  const cachedData = ultraFastCache.get(cacheKey);
  if (cachedData !== undefined) {
    // Send cached response immediately
    console.log(`[CACHE HIT] ${req.path} - serving from cache`);
    return res.json(cachedData);
  }

  // Cache miss - intercept response to cache it
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    // Cache successful responses
    if (res.statusCode === 200) {
      // Determine TTL based on endpoint
      let ttl = 30; // 30 seconds default
      if (req.path.includes('/analytics') || req.path.includes('/stats')) {
        ttl = 300; // 5 minutes for analytics
      } else if (req.path.includes('/events') || req.path.includes('/bookings')) {
        ttl = 60; // 1 minute for events/bookings
      }
      
      // Store in cache
      ultraFastCache.set(cacheKey, data, ttl);
      console.log(`[CACHE MISS] ${req.path} - caching for ${ttl}s`);
    }
    return originalJson(data);
  };

  next();
}

// Invalidation middleware for mutations
export function cacheInvalidationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only handle mutation requests
  if (req.method === 'GET') {
    return next();
  }

  // Override res.json to invalidate cache after successful mutations
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    // Invalidate cache based on endpoint
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (req.path.includes('/bookings')) {
        invalidateRelatedCaches('booking');
      } else if (req.path.includes('/service-bookings')) {
        invalidateRelatedCaches('service_booking');
      } else if (req.path.includes('/users') || req.path.includes('/staff')) {
        invalidateRelatedCaches('user');
      } else if (req.path.includes('/notifications')) {
        invalidateRelatedCaches('notification');
      } else if (req.path.includes('/conversations') || req.path.includes('/messages')) {
        invalidateRelatedCaches('conversation');
      }
    }
    return originalJson(data);
  };

  next();
}