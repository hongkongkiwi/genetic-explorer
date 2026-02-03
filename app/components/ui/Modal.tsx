import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '~/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        ref={contentRef}
        className={cn(
          'relative w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}

interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
  message: string;
}

export function ConfirmModal({
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
  message,
  title = 'Are you sure?',
  ...props
}: ConfirmModalProps) {
  const variants = {
    danger: {
      icon: 'text-red-600 bg-red-100',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: 'text-amber-600 bg-amber-100',
      button: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: 'text-blue-600 bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  return (
    <Modal {...props} title={title} onClose={onCancel} size="sm">
      <div className="text-center">
        <div className={cn('w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4', variants[variant].icon)}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn('px-4 py-2 text-white rounded-lg font-medium transition-colors', variants[variant].button)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
