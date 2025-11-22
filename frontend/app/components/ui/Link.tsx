'use client';

import NextLink from 'next/link';
import { forwardRef } from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '../../lib/utils';

interface LinkProps extends Omit<ButtonProps<'a'>, 'as'> {
  href: string;
  external?: boolean;
}

const LinkInner = (
  { href, external, variant = 'ghost', size = 'md', className, children, ...props }: LinkProps,
  ref: any
) => {
  const baseStyles = 'inline-flex items-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg';
  
  return (
    <Button
      as={NextLink}
      href={href}
      ref={ref}
      variant={variant}
      size={size}
      className={cn(baseStyles, className)}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      {...props}
    >
      {children}
    </Button>
  );
};

const Link = forwardRef(LinkInner);

export { Link };
export type { LinkProps };