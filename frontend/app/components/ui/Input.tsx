import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
  variant?: 'default' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Input({
  label,
  error,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: InputProps) {
  const base = 'block w-full rounded-md border bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2';

  const variantStyles: Record<string, string> = {
    default: 'border-gray-300 focus:ring-blue-500',
    ghost: 'border-transparent bg-transparent focus:ring-blue-500',
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const errorStyles = error ? 'border-red-500 focus:ring-red-500' : '';

  return (
    <div className={`space-y-1 ${className}`}>
      {label ? (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">{label}</label>
      ) : null}
      <input
        className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${errorStyles}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{typeof error === 'string' ? error : 'Error'}</p>
      ) : null}
    </div>
  );
}
