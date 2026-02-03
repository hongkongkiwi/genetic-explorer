import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '~/utils/cn';

interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionItem[];
}

export function MobileActionSheet({ 
  isOpen, 
  onClose, 
  title,
  actions 
}: MobileActionSheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden"
            aria-hidden="true"
          />
          
          {/* Action Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-slate-100 dark:bg-slate-900 rounded-t-2xl z-50 sm:hidden safe-area-pb p-2"
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Actions'}
          >
            {/* Handle bar */}
            <div className="flex items-center justify-center pt-2 pb-3">
              <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
            </div>
            
            {/* Title */}
            {title && (
              <div className="px-4 py-2 text-center">
                <h2 className="text-sm font-medium text-slate-500">{title}</h2>
              </div>
            )}
            
            {/* Actions */}
            <div className="space-y-1">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  disabled={action.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-800 rounded-xl text-base font-medium transition-colors touch-target',
                    action.variant === 'destructive' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-slate-900 dark:text-white',
                    action.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                  <span className="flex-1 text-left">{action.label}</span>
                </button>
              ))}
            </div>
            
            {/* Cancel button */}
            <button
              onClick={onClose}
              className="w-full mt-2 px-4 py-3.5 bg-white dark:bg-slate-800 rounded-xl text-base font-semibold text-slate-900 dark:text-white transition-colors touch-target"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
