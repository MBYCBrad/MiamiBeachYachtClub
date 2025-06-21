// Platform configuration for React Native Web PWA
// Using web platform detection for cross-platform compatibility
const Platform = {
  OS: typeof window !== 'undefined' ? 'web' : 'web',
  select: (specifics: any) => specifics.web || specifics.default
};

export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export const platformConfig = {
  web: {
    name: 'web',
    navigationBarStyle: 'default',
    supportsPWA: true
  },
  mobile: {
    name: 'mobile',
    navigationBarStyle: 'bottom-tabs',
    supportsPWA: false
  }
};

export const getCurrentPlatform = () => {
  return isWeb ? platformConfig.web : platformConfig.mobile;
};

// PWA Service Worker Registration
export const registerServiceWorker = () => {
  if (isWeb && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  }
};