'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'default' | 'destructive' | 'success' | 'warning';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, children, ...props }, ref) => {
    const variants: Record<AlertVariant, string> = {
      default: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      destructive: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300',
      success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/50 dark:text-green-300',
      warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-lg border p-4',
          variants[variant],
          className
        )}
        {...props}
      >
        {title && (
          <h5 className="mb-1 font-medium leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className="text-sm [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };