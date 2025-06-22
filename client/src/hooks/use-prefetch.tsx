import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { preloadYachtImages } from './use-optimized-images';
import { useAggressivePrefetch } from './use-request-cache';

export function usePrefetchData() {
  const queryClient = useQueryClient();
  useAggressivePrefetch();

  useEffect(() => {
    // Immediate aggressive prefetching with parallel execution
    const criticalQueries = [
      '/api/yachts',
      '/api/services', 
      '/api/events',
      '/api/media/hero/active',
      '/api/user'
    ];

    // Execute all prefetches in parallel for maximum speed
    const prefetchPromises = criticalQueries.map(queryKey =>
      queryClient.prefetchQuery({
        queryKey: [queryKey],
        queryFn: getQueryFn({ on401: "returnNull" }),
        staleTime: 15 * 60 * 1000, // Extended to 15 minutes
        gcTime: 60 * 60 * 1000, // 1 hour in memory
        networkMode: 'always' // Force network request
      })
    );

    // Fire all requests immediately
    Promise.allSettled(prefetchPromises);

    // Preload images with highest priority
    preloadYachtImages();

    // Background prefetch secondary data with minimal delay
    const backgroundPrefetch = () => {
      queryClient.prefetchQuery({
        queryKey: ['/api/trips'],
        queryFn: getQueryFn({ on401: "returnNull" }),
        staleTime: 5 * 60 * 1000
      });
    };

    // Execute background prefetch after minimal delay
    const timeoutId = setTimeout(backgroundPrefetch, 50);
    
    return () => clearTimeout(timeoutId);
  }, [queryClient]);
}