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

    // Handle authentication redirects gracefully
    if (res.status === 401 && window.location.pathname !== "/auth") {
      window.location.href = "/auth";
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 30 * 60 * 1000, // 30 minutes stale time for ultra caching
      gcTime: 2 * 60 * 60 * 1000, // 2 hours memory retention
      retry: 1, // Reduce retries for speed
      retryDelay: 500, // Faster retry
      structuralSharing: false, // Disable for performance
      networkMode: 'online'
    },
    mutations: {
      retry: false,
      networkMode: 'online'
    }
  },
});
