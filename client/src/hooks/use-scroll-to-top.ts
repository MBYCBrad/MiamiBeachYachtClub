import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook that scrolls to top of page whenever the route changes
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Use 'auto' for instant scroll since it's navigation
    });
  }, [location]);
}