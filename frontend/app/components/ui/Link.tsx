'use client';

import NextLink from 'next/link';
import { forwardRef, AnchorHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { ButtonVariant, ButtonSize } from './Button';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  external?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ 
    href, 
    external, 
    variant = 'ghost', 
    size = 'md', 
    className, 
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl';
    
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800',
      gradient: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    if (external) {
      return (
        <a
          href={href}
          ref={ref}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    return (
      <NextLink
        href={href}
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';

export { Link };