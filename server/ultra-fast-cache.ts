import NodeCache from 'node-cache';
import { db } from './db';
import { users, yachts, services, events, bookings, serviceBookings, notifications, conversations, staff, messages, tourRequests, contactMessages, eventRegistrations } from '@shared/schema';
import { eq, desc, and, or, isNull, gte } from 'drizzle-orm';

// Ultra-fast cache with 5-minute TTL and aggressive cleanup
export const ultraFastCache = new NodeCache({ 
  stdTTL: 300, // 5 minutes
  checkperiod: 60, // Check for expired keys every minute
  useClones: false, // Don't clone objects for speed
  maxKeys: 10000 // Limit cache size
});

// Cache key prefixes
const CACHE_KEYS = {
  YACHTS: 'yachts:',
  SERVICES: 'services:',
  EVENTS: 'events:',
  BOOKINGS: 'bookings:',
  SERVICE_BOOKINGS: 'service_bookings:',
  NOTIFICATIONS: 'notifications:',
  CONVERSATIONS: 'conversations:',
  STAFF: 'staff:',
  USERS: 'users:',
  ANALYTICS: 'analytics:',
  PAYMENTS: 'payments:',
  CONTACT_MESSAGES: 'contact_messages:',
  TOUR_REQUESTS: 'tour_requests:'
};

// Pre-warm critical data into cache
export async function prewarmCache() {
  console.log('⚡ Pre-warming ultra-fast cache...');
  
  try {
    // Pre-load yachts
    const allYachts = await db.select().from(yachts);
    ultraFastCache.set(`${CACHE_KEYS.YACHTS}all`, allYachts);
    
    // Pre-load services
    const allServices = await db.select().from(services);
    ultraFastCache.set(`${CACHE_KEYS.SERVICES}all`, allServices);
    
    // Pre-load events
    const upcomingEvents = await db.select().from(events)
      .orderBy(desc(events.createdAt));
    ultraFastCache.set(`${CACHE_KEYS.EVENTS}upcoming`, upcomingEvents);
    
    // Pre-load staff
    const allStaff = await db.select().from(staff).where(eq(staff.status, 'active'));
    ultraFastCache.set(`${CACHE_KEYS.STAFF}all`, allStaff);
    
    console.log('✅ Ultra-fast cache pre-warmed successfully');
  } catch (error) {
    console.error('❌ Failed to pre-warm cache:', error);
  }
}

// Invalidate related cache keys
export function invalidateCache(pattern: string) {
  const keys = ultraFastCache.keys();
  const keysToDelete = keys.filter((key: string) => key.startsWith(pattern));
  keysToDelete.forEach((key: string) => ultraFastCache.del(key));
}

// Get or set cache with callback
export async function getCachedData<T>(
  key: string, 
  fetchFn: () => Promise<T>, 
  ttl?: number
): Promise<T> {
  const cached = ultraFastCache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }
  
  const data = await fetchFn();
  ultraFastCache.set(key, data, ttl || 300);
  return data;
}

// Batch invalidation for related data
export function invalidateRelatedCaches(entityType: string, entityId?: number | string) {
  switch (entityType) {
    case 'booking':
      invalidateCache(CACHE_KEYS.BOOKINGS);
      invalidateCache(CACHE_KEYS.ANALYTICS);
      invalidateCache(CACHE_KEYS.YACHTS);
      break;
    case 'service_booking':
      invalidateCache(CACHE_KEYS.SERVICE_BOOKINGS);
      invalidateCache(CACHE_KEYS.ANALYTICS);
      invalidateCache(CACHE_KEYS.SERVICES);
      break;
    case 'user':
      invalidateCache(CACHE_KEYS.USERS);
      invalidateCache(CACHE_KEYS.ANALYTICS);
      break;
    case 'notification':
      invalidateCache(CACHE_KEYS.NOTIFICATIONS);
      break;
    case 'conversation':
      invalidateCache(CACHE_KEYS.CONVERSATIONS);
      invalidateCache(CACHE_KEYS.MESSAGES);
      break;
  }
}

// Performance monitoring
export function getCacheStats() {
  return {
    keys: ultraFastCache.keys().length,
    hits: ultraFastCache.getStats().hits,
    misses: ultraFastCache.getStats().misses,
    hitRate: ultraFastCache.getStats().hits / (ultraFastCache.getStats().hits + ultraFastCache.getStats().misses) * 100
  };
}