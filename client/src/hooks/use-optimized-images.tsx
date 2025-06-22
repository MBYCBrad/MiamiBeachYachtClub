import { useState, useEffect } from 'react';

const imageCache = new Map<string, string>();

export function useOptimizedImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check cache first
    if (imageCache.has(src)) {
      setImageSrc(imageCache.get(src)!);
      setIsLoading(false);
      return;
    }

    // Preload image
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, src);
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
    img.src = src;
  }, [src]);

  return { imageSrc, isLoading };
}

// Preload all yacht images on app start
export function preloadYachtImages() {
  const yachtImages = [
    '/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg',
    '/api/media/pexels-goumbik-296278_1750537277229.jpg',
    '/api/media/pexels-mali-42092_1750537277229.jpg',
    '/api/media/pexels-mikebirdy-144634_1750537277230.jpg',
    '/api/media/pexels-pixabay-163236_1750537277230.jpg',
    '/api/media/pexels-mali-42091_1750537294323.jpg'
  ];

  yachtImages.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => imageCache.set(src, src);
  });
}