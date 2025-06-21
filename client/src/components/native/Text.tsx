import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CustomTextProps extends TextProps {
  className?: string;
}

export const Text: React.FC<CustomTextProps> = ({ className, style, children, ...props }) => {
  return (
    <RNText
      style={[
        {
          fontFamily: 'system',
          fontSize: 16,
          color: '#ffffff',
        },
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};