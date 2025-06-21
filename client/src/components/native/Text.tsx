import React from 'react';
import { cn } from '@/lib/utils';

interface CustomTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Text: React.FC<CustomTextProps> = ({ className, children, style, ...props }) => {
  return (
    <span className={cn('text-white', className)} style={style} {...props}>
      {children}
    </span>
  );
};