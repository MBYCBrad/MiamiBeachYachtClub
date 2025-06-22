import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

// Request deduplication cache
const requestCache = new Map<string, Promise<any>>();

export function useRequestDeduplication() {
  useEffect(() => {
    // Clear old cache entries every 5 minutes
    const interval = setInterval(() => {
      requestCache.clear();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    dedupedFetch: async (url: string) => {
      if (requestCache.has(url)) {
        return requestCache.get(url);
      }

      const promise = fetch(url, { credentials: 'include' }).then(res => res.json());
      requestCache.set(url, promise);
      
      // Remove from cache after completion
      promise.finally(() => {
        setTimeout(() => requestCache.delete(url), 1000);
      });

      return promise;
    }
  };
}

// Aggressive prefetching for critical routes
export function useAggressivePrefetch() {
  useEffect(() => {
    const criticalEndpoints = [
      '/api/yachts',
      '/api/services',
      '/api/events',
      '/api/user'
    ];

    // Prefetch immediately with high priority
    criticalEndpoints.forEach(endpoint => {
      queryClient.prefetchQuery({
        queryKey: [endpoint],
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      });
    });

    // Background prefetch of secondary data
    setTimeout(() => {
      queryClient.prefetchQuery({
        queryKey: ['/api/trips'],
        staleTime: 5 * 60 * 1000
      });
    }, 500);

  }, []);
}