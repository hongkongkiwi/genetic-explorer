import { useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  scope?: 'global' | 'input';
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const navigate = useNavigate();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs (unless explicitly allowed)
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable;

    for (const shortcut of shortcuts) {
      const { key, ctrl, shift, alt, meta, action, scope = 'global' } = shortcut;

      // Skip global shortcuts when in input fields
      if (isInput && scope === 'global') {
        continue;
      }

      const keyMatch = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrl === undefined || event.ctrlKey === ctrl;
      const shiftMatch = shift === undefined || event.shiftKey === shift;
      const altMatch = alt === undefined || event.altKey === alt;
      const metaMatch = meta === undefined || event.metaKey === meta;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
        event.preventDefault();
        action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined shortcuts for the app
export function useAppShortcuts() {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    // Navigation
    { key: 'g', ctrl: true, action: () => navigate({ to: '/genomes' }), description: 'Go to Genomes' },
    { key: 'u', ctrl: true, action: () => navigate({ to: '/upload' }), description: 'Go to Upload' },
    { key: 'r', ctrl: true, action: () => navigate({ to: '/reports' }), description: 'Go to Reports' },
    { key: 'e', ctrl: true, action: () => navigate({ to: '/explorer' }), description: 'Go to SNP Explorer' },
    { key: 'd', ctrl: true, action: () => navigate({ to: '/dashboard' }), description: 'Go to Dashboard' },
    { key: 'h', ctrl: true, action: () => navigate({ to: '/' }), description: 'Go to Home' },
    
    // Actions
    { key: '/', action: () => focusSearch(), description: 'Focus search', scope: 'global' },
    { key: 'Escape', action: () => blurActiveElement(), description: 'Close modal / Blur input' },
    { key: '?', shift: true, action: () => showShortcutsHelp(), description: 'Show keyboard shortcuts' },
  ]);
}

function focusSearch() {
  // Find the first search input on the page
  const searchInput = document.querySelector('input[type="text"], input[type="search"]') as HTMLInputElement;
  if (searchInput) {
    searchInput.focus();
  }
}

function blurActiveElement() {
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement && activeElement.blur) {
    activeElement.blur();
  }
  
  // Close any open modals by dispatching escape key event
  const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
  document.dispatchEvent(escapeEvent);
}

function showShortcutsHelp() {
  // Dispatch custom event to show shortcuts modal
  const event = new CustomEvent('showShortcutsHelp');
  window.dispatchEvent(event);
}

// Hook for shortcuts modal visibility
export function useShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowHelp = () => setIsOpen(true);
    window.addEventListener('showShortcutsHelp', handleShowHelp);
    return () => window.removeEventListener('showShortcutsHelp', handleShowHelp);
  }, []);

  return { isOpen, setIsOpen };
}

import { useState } from 'react';
import { Modal } from '~/components/ui/Modal';
import { Keyboard } from 'lucide-react';

const ALL_SHORTCUTS: ShortcutConfig[] = [
  { key: 'g', ctrl: true, action: () => {}, description: 'Go to Genomes' },
  { key: 'u', ctrl: true, action: () => {}, description: 'Go to Upload' },
  { key: 'r', ctrl: true, action: () => {}, description: 'Go to Reports' },
  { key: 'e', ctrl: true, action: () => {}, description: 'Go to SNP Explorer' },
  { key: 'd', ctrl: true, action: () => {}, description: 'Go to Dashboard' },
  { key: 'h', ctrl: true, action: () => {}, description: 'Go to Home' },
  { key: '/', action: () => {}, description: 'Focus search' },
  { key: 'Escape', action: () => {}, description: 'Close modal / Blur input' },
  { key: '?', shift: true, action: () => {}, description: 'Show this help' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Use these keyboard shortcuts to navigate the app more quickly.
        </p>
        
        <div className="space-y-2">
          {ALL_SHORTCUTS.map((shortcut, index) => (
            <div 
              key={index}
              className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <span className="text-slate-700 dark:text-slate-300">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.ctrl && <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">Ctrl</kbd>}
                {shortcut.shift && <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">Shift</kbd>}
                {shortcut.alt && <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">Alt</kbd>}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">{shortcut.key}</kbd>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <Keyboard className="w-4 h-4" />
          <span>Press <kbd className="px-1 bg-white dark:bg-slate-700 rounded">?</kbd> anytime to show this help</span>
        </div>
      </div>
    </Modal>
  );
}
