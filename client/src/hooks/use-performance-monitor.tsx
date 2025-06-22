import { useEffect } from 'react';

interface PerformanceMetrics {
  apiLatency: number;
  renderTime: number;
  imageLoadTime: number;
}

export function usePerformanceMonitor() {
  useEffect(() => {
    const metrics: PerformanceMetrics = {
      apiLatency: 0,
      renderTime: 0,
      imageLoadTime: 0
    };

    // Monitor API response times
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const response = await originalFetch(...args);
      const endTime = performance.now();
      
      metrics.apiLatency = endTime - startTime;
      
      // Log slow API calls (> 100ms)
      if (metrics.apiLatency > 100) {
        console.warn(`Slow API call: ${args[0]} took ${metrics.apiLatency.toFixed(2)}ms`);
      }
      
      return response;
    };

    // Monitor rendering performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          metrics.renderTime = entry.duration;
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure'] });

    // Monitor image load times
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const startTime = performance.now();
      img.addEventListener('load', () => {
        metrics.imageLoadTime = performance.now() - startTime;
      });
    });

    return () => {
      window.fetch = originalFetch;
      observer.disconnect();
    };
  }, []);
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalUrls = [
    '/api/yachts',
    '/api/services',
    '/api/events',
    '/api/user'
  ];

  criticalUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}