import React from 'react';
import { View as RNView, ViewProps } from 'react-native-web';
import { cn } from '@/lib/utils';

interface CustomViewProps extends ViewProps {
  className?: string;
}

export const View: React.FC<CustomViewProps> = ({ className, style, ...props }) => {
  return (
    <RNView
      style={[
        className ? { className } : {},
        style
      ]}
      {...props}
    />
  );
};