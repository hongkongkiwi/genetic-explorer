/**
 * Toast Notification System
 * 
 * Provides non-blocking user feedback for actions
 * Uses Radix UI Toast primitives for accessibility
 */

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '~/utils/shared/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Hook for convenient toast methods
export function useToastActions() {
  const { addToast } = useToast();
  
  return {
    success: (title: string, description?: string) => 
      addToast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) => 
      addToast({ title, description, variant: 'error' }),
    warning: (title: string, description?: string) => 
      addToast({ title, description, variant: 'warning' }),
    info: (title: string, description?: string) => 
      addToast({ title, description, variant: 'info' }),
  };
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idCounter = React.useRef(0);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    idCounter.current += 1;
    const id = `toast-${Date.now()}-${idCounter.current}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        <ToastViewport />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onDismiss={() => removeToast(toast.id)} 
          />
        ))}
      </AnimatePresence>
    </>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { title, description, variant, duration = 5000 } = toast;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  };

  return (
    <ToastPrimitive.Root
      duration={duration}
      className={cn(
        'fixed z-50 flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
        'data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full',
        styles[variant]
      )}
      style={{
        bottom: '1rem',
        right: '1rem',
        maxWidth: '400px',
        width: 'calc(100vw - 2rem)',
      }}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="flex items-start gap-3 w-full"
      >
        <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>
        <div className="flex-1 min-w-0">
          <ToastPrimitive.Title className="font-medium text-slate-900 dark:text-white">
            {title}
          </ToastPrimitive.Title>
          {description && (
            <ToastPrimitive.Description className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close 
          className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </ToastPrimitive.Close>
      </motion.div>
    </ToastPrimitive.Root>
  );
}
