'use client';

import { forwardRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { Button } from './Button';
import { Card, CardContent, CardHeader } from './Card';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }, ref) => {
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div 
          className={cn(
            'relative z-10 w-full mx-auto max-h-[90vh] overflow-auto',
            sizeClasses[size]
          )}
          ref={ref}
        >
          <Card variant="elevated" className="max-h-full overflow-auto">
            {(title || showCloseButton) && (
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                {title && <h2 className="text-lg font-semibold">{title}</h2>}
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                )}
              </CardHeader>
            )}
            <CardContent className={!title ? 'p-6' : undefined}>
              {children}
            </CardContent>
          </Card>
        </div>
      </div>,
      document.body
    );
  }
);

Modal.displayName = 'Modal';

export { Modal };