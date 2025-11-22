import { ComponentPropsWithoutRef, ElementType } from 'react';

export type PolymorphicComponentProps<
  T extends ElementType,
  P = {}
> = P & Omit<ComponentPropsWithoutRef<T>, keyof P> & {
  as?: T;
};

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';