import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const startTime = performance.now();
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      "Cache-Control": "max-age=300",
      "Connection": "keep-alive"
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    keepalive: true
  });

  const endTime = performance.now();
  const duration = endTime - startTime;

  // Log any call over 50ms as slow
  if (duration > 50) {
    console.warn(`Slow API call: ${url} took ${duration.toFixed(2)}ms`);
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const startTime = performance.now();
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        "Cache-Control": "max-age=300",
        "Connection": "keep-alive"
      },
      keepalive: true
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Log any call over 50ms as slow
    if (duration > 50) {
      console.warn(`Slow API call: ${queryKey[0]} took ${duration.toFixed(2)}ms`);
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Let ProtectedRoute and auth components handle 401s gracefully
    if (res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Cache for request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Enhanced query function with deduplication
const enhancedQueryFn: QueryFunction = async (context) => {
  const key = JSON.stringify(context.queryKey);
  
  // If request is already pending, return the same promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Create the request promise
  const requestPromise = (async () => {
    try {
      const result = await getQueryFn({ on401: "returnNull" })(context);
      return result;
    } finally {
      // Clean up after request completes
      pendingRequests.delete(key);
    }
  })();
  
  // Store the promise for deduplication
  pendingRequests.set(key, requestPromise);
  
  return requestPromise;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: enhancedQueryFn,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 30 * 60 * 1000, // 30 minutes - ultra aggressive caching
      gcTime: 24 * 60 * 60 * 1000, // 24 hours memory retention - keep data for a full day
      retry: 0, // No retries for maximum speed
      structuralSharing: false, // Disable for performance
      networkMode: 'online',
      placeholderData: (previousData: any) => previousData, // Keep showing old data while fetching
    },
    mutations: {
      retry: false,
      networkMode: 'online'
    }
  },
});

// Prefetch critical data immediately on app load
if (typeof window !== 'undefined') {
  // Only prefetch if user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (response.ok) {
        const userData = await response.json();
        // User is authenticated, prefetch critical data based on role
        const criticalEndpoints = [
          '/api/yachts',
          '/api/services', 
          '/api/events',
          '/api/conversations'
        ];
        
        // Only prefetch admin endpoints for admin/staff users
        if (userData.role === 'admin' || userData.role?.startsWith('staff')) {
          criticalEndpoints.push(
            '/api/admin/notifications',
            '/api/admin/bookings',
            '/api/admin/analytics'
          );
        }
        
        criticalEndpoints.forEach(endpoint => {
          queryClient.prefetchQuery({
            queryKey: [endpoint],
            staleTime: 30 * 60 * 1000
          });
        });
      }
    } catch (error) {
      // Silently fail prefetching
    }
  };
  
  // Run prefetch after a short delay to not block initial render
  setTimeout(checkAuth, 100);
}
