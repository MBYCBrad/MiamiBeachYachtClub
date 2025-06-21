import { useQuery } from '@tanstack/react-query';
import type { MediaAsset } from '@shared/schema';

export function useHeroVideo() {
  return useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}