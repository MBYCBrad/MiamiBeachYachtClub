import React from 'react';
import { cn } from '@/lib/utils';

interface CustomViewProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const View: React.FC<CustomViewProps> = ({ className, children, style, ...props }) => {
  return (
    <div className={cn('flex', className)} style={style} {...props}>
      {children}
    </div>
  );
};