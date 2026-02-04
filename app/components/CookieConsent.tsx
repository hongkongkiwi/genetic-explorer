/**
 * Subtle Cookie Consent Banner
 * 
 * Minimal, unobtrusive cookie consent that complies with GDPR/ePrivacy
 * Only shows for users in EU/EEA and those who haven't made a choice
 */

import React, { useEffect, useState } from 'react';
import { X, Cookie } from 'lucide-react';
import { Button } from './ui/Button';

export type CookieConsent = 'granted' | 'denied' | 'pending';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const COOKIE_CONSENT_KEY = 'cookie_consent_v1';

/**
 * Check if user is in EU/EEA based on timezone or locale
 */
function isEUUser(): boolean {
  // Check timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const euTimezones = [
    'Europe/', 'GMT', 'UTC', 'WET', 'CET', 'EET',
    'Atlantic/Canary', 'Atlantic/Madeira', 'Atlantic/Azores'
  ];
  
  if (euTimezones.some(tz => timezone.includes(tz))) {
    return true;
  }
  
  // Check browser languages
  const languages = navigator.languages || [navigator.language];
  const euLanguages = ['en-GB', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'ro', 'el', 
    'cs', 'pt', 'sv', 'hu', 'fi', 'da', 'sk', 'no', 'ga', 'hr', 'bg', 'lt', 
    'sl', 'lv', 'et', 'mt', 'cy'];
  
  return languages.some(lang => 
    euLanguages.some(euLang => lang.startsWith(euLang))
  );
}

/**
 * Get stored cookie consent
 */
export function getCookieConsent(): CookiePreferences | null {
  if (typeof document === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

/**
 * Store cookie consent
 */
export function setCookieConsent(preferences: Omit<CookiePreferences, 'timestamp'>): void {
  const data: CookiePreferences = {
    ...preferences,
    timestamp: new Date().toISOString(),
  };
  
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if analytics cookies are allowed
 */
export function analyticsAllowed(): boolean {
  const consent = getCookieConsent();
  return consent?.analytics === true;
}

/**
 * Check if marketing cookies are allowed
 */
export function marketingAllowed(): boolean {
  const consent = getCookieConsent();
  return consent?.marketing === true;
}

/**
 * Minimal Cookie Consent Banner
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if we need to show the banner
    const existingConsent = getCookieConsent();
    if (!existingConsent && isEUUser()) {
      // Small delay to not distract on initial page load
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setCookieConsent({
      essential: true,
      analytics: true,
      marketing: false, // Default to off for subtlety
    });
    setVisible(false);
  };

  const handleMinimal = () => {
    setCookieConsent({
      essential: true,
      analytics: false,
      marketing: false,
    });
    setVisible(false);
  };

  const handleClose = () => {
    // Just hide without setting - will show again on next visit
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-2 duration-300"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-3 sm:p-4">
          <div className="flex items-center gap-3">
            {/* Icon - subtle */}
            <Cookie className="w-4 h-4 text-muted-foreground flex-shrink-0 hidden sm:block" />
            
            {/* Text - minimal */}
            <p className="text-xs sm:text-sm text-muted-foreground flex-1 min-w-0">
              <span className="hidden sm:inline">We use cookies to improve your experience. </span>
              <a 
                href="/privacy#cookies" 
                className="underline hover:text-foreground transition-colors"
              >
                Learn more
              </a>
            </p>
            
            {/* Actions - compact */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-7 text-xs px-2 hidden sm:inline-flex"
                onClick={handleMinimal}
              >
                Essential only
              </Button>
              <Button 
                size="sm" 
                className="h-7 text-xs px-3"
                onClick={handleAccept}
              >
                OK
              </Button>
              <button 
                onClick={handleClose}
                className="p-1 hover:bg-muted rounded transition-colors"
                aria-label="Close"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cookie Settings Modal (for detailed preferences)
 */
export function CookieSettings() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: new Date().toISOString(),
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = getCookieConsent();
    if (stored) {
      setPreferences(stored);
    }
  }, []);

  const handleSave = () => {
    setCookieConsent({
      essential: preferences.essential,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Cookie Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Manage how we use cookies on our site
        </p>
      </div>

      <div className="space-y-4">
        {/* Essential - always on */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div>
            <p className="font-medium">Essential</p>
            <p className="text-sm text-muted-foreground">
              Required for the site to function
            </p>
          </div>
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="rounded border-gray-300"
            />
          </div>
        </div>

        {/* Analytics */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">Analytics</p>
            <p className="text-sm text-muted-foreground">
              Helps us improve our website
            </p>
          </div>
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
              className="rounded border-gray-300"
            />
          </div>
        </div>

        {/* Marketing */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">Marketing</p>
            <p className="text-sm text-muted-foreground">
              Used to deliver relevant advertisements
            </p>
          </div>
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
              className="rounded border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Preferences'}
        </Button>
        {saved && (
          <p className="text-sm text-green-600">Settings saved successfully</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Last updated: {preferences.timestamp ? new Date(preferences.timestamp).toLocaleDateString() : 'Never'}
      </p>
    </div>
  );
}

export default CookieConsentBanner;
