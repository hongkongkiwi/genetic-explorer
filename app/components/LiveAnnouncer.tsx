/**
 * Live Announcer Component
 * 
 * Provides ARIA live regions for screen reader announcements.
 * Use this for dynamic content updates that should be announced
 * to users using assistive technologies.
 * 
 * Usage:
 *   import { useAnnouncer } from '~/hooks/useAnnouncer';
 *   const { announce } = useAnnouncer();
 *   announce('Analysis complete', 'polite');
 */

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';

interface Announcement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
}

interface LiveAnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveAnnouncerContext = createContext<LiveAnnouncerContextType | null>(null);

export function useAnnouncer() {
  const context = useContext(LiveAnnouncerContext);
  if (!context) {
    throw new Error('useAnnouncer must be used within LiveAnnouncerProvider');
  }
  return context;
}

interface LiveAnnouncerProviderProps {
  children: ReactNode;
}

export function LiveAnnouncerProvider({ children }: LiveAnnouncerProviderProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const idCounter = useRef(0);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    idCounter.current += 1;
    const id = `announce-${Date.now()}-${idCounter.current}`;
    setAnnouncements(prev => [...prev, { id, message, priority }]);
    
    // Remove announcement after screen reader has had time to read it
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }, 1000);
  }, []);

  const politeAnnouncements = announcements.filter(a => a.priority === 'polite');
  const assertiveAnnouncements = announcements.filter(a => a.priority === 'assertive');

  return (
    <LiveAnnouncerContext.Provider value={{ announce }}>
      {children}
      
      {/* ARIA Live Regions - visually hidden but accessible to screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeAnnouncements.map(a => (
          <p key={a.id}>{a.message}</p>
        ))}
      </div>
      
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveAnnouncements.map(a => (
          <p key={a.id}>{a.message}</p>
        ))}
      </div>
    </LiveAnnouncerContext.Provider>
  );
}

/**
 * Hook for announcing loading states
 */
export function useLoadingAnnouncer() {
  const { announce } = useAnnouncer();

  const announceLoading = useCallback((message: string) => {
    announce(`${message}... Loading`, 'polite');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`${message} complete`, 'polite');
  }, [announce]);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  return { announceLoading, announceSuccess, announceError };
}
