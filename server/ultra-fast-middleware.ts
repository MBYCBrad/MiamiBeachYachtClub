import { Request, Response, NextFunction } from 'express';
import { getCachedData, invalidateRelatedCaches } from './ultra-fast-cache';

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
  '/api/conversations',
  '/api/notifications',
  '/api/trips',
  '/api/contact-messages',
  '/api/tour-requests'
];

// Ultra-fast cache middleware
export function ultraFastCacheMiddleware(req: Request, res: Response, next: NextFunction) {
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
  const cacheKey = `${req.path}:${JSON.stringify(req.query)}:${req.user?.id || 'anonymous'}`;

  // Override res.json to cache the response
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    // Cache the successful response
    if (res.statusCode === 200) {
      getCachedData(cacheKey, async () => data, 300); // 5 minute cache
    }
    return originalJson(data);
  };

  // Try to get from cache first
  getCachedData(cacheKey, async () => {
    // If not in cache, continue with normal request
    next();
    return null;
  }).then(cachedData => {
    if (cachedData) {
      // Send cached response
      res.json(cachedData);
    }
  }).catch(() => {
    // On error, continue with normal request
    next();
  });
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