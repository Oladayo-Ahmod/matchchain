'use client';

import { ElementType, forwardRef, HTMLAttributes,JSX } from 'react';
import { cn } from '../../lib/utils';
import { PolymorphicComponentProps } from './types';

type CardVariant = 'elevated' | 'outlined' | 'filled';

type CardProps<T extends ElementType = 'div'> = PolymorphicComponentProps<
  T,
  {
    variant?: CardVariant;
  }
>;

const CardInner = <T extends ElementType = 'div'>(
  { as, variant = 'elevated', className, children, ...props }: CardProps<T>,
  ref: any
) => {
  const Component = as || 'div';

  const baseStyles = 'rounded-xl transition-all duration-200';
  
  const variants: Record<CardVariant, string> = {
    elevated: 'bg-white shadow-sm border border-gray-100 hover:shadow-md dark:bg-gray-800 dark:border-gray-700',
    outlined: 'border border-gray-200 bg-transparent dark:border-gray-700',
    filled: 'bg-gray-50 dark:bg-gray-800'
  };

  return (
    <Component
      ref={ref}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
};

const Card = forwardRef(CardInner) as <T extends ElementType = 'div'>(
  props: CardProps<T> & { ref?: any }
) => JSX.Element;

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('flex flex-col space-y-1.5 p-6', className)} 
      {...props} 
    />
  )
);

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('p-6 pt-0', className)} 
      {...props} 
    />
  )
);

export { Card, CardHeader, CardContent };
export type { CardProps };