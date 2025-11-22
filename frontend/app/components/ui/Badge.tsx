'use client';

import { ElementType, forwardRef,JSX } from 'react';
import { cn } from '../../lib/utils';
import { PolymorphicComponentProps } from './types';

type BadgeVariant = 'primary' | 'secondary' | 'outline' | 'destructive';
type BadgeSize = 'sm' | 'md' | 'lg';

type BadgeProps<T extends ElementType = 'span'> = PolymorphicComponentProps<
  T,
  {
    variant?: BadgeVariant;
    size?: BadgeSize;
  }
>;

const BadgeInner = <T extends ElementType = 'span'>(
  { as, variant = 'primary', size = 'md', className, ...props }: BadgeProps<T>,
  ref: any
) => {
  const Component = as || 'span';

  const baseStyles = 'inline-flex items-center rounded-full font-medium';
  
  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const sizes: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <Component
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};

const Badge = forwardRef(BadgeInner) as <T extends ElementType = 'span'>(
  props: BadgeProps<T> & { ref?: any }
) => JSX.Element;

export { Badge };
export type { BadgeProps };