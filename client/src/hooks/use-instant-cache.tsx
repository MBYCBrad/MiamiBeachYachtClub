import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

// Instant cache for frequently accessed data
const instantCache = new Map<string, any>();
const CACHE_DURATION = 30000; // 30 seconds

export function useInstantCache() {
  useEffect(() => {
    // Pre-populate instant cache with critical data
    const criticalEndpoints = ['/api/yachts', '/api/services', '/api/events'];
    
    criticalEndpoints.forEach(async (endpoint) => {
      try {
        const cachedData = queryClient.getQueryData([endpoint]);
        if (cachedData) {
          instantCache.set(endpoint, {
            data: cachedData,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.warn(`Failed to populate instant cache for ${endpoint}`);
      }
    });

    // Clean expired cache entries
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      instantCache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION) {
          instantCache.delete(key);
        }
      });
    }, 5000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    getInstant: (key: string) => {
      const cached = instantCache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }
      return null;
    },
    setInstant: (key: string, data: any) => {
      instantCache.set(key, {
        data,
        timestamp: Date.now()
      });
    }
  };
}