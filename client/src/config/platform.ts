import { Platform } from 'react-native-web';

export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

export const platformStyles = {
  web: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  mobile: {
    flex: 1,
  },
};

export const getResponsiveValue = (webValue: any, mobileValue: any) => {
  return isWeb ? webValue : mobileValue;
};