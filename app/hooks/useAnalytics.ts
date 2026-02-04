/**
 * Analytics Hook with Cookie Consent
 * 
 * Only initializes analytics if user has consented
 * Provides no-op functions if consent not given
 */

import { useEffect, useRef } from 'react';
import { analyticsAllowed, getCookieConsent } from '~/components/CookieConsent';

// Simple analytics event
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

// In-memory queue for events before consent
let preConsentQueue: AnalyticsEvent[] = [];
let analyticsInitialized = false;

/**
 * Check if analytics is allowed and initialize if needed
 */
function ensureAnalytics() {
  if (analyticsInitialized) return true;
  if (!analyticsAllowed()) return false;
  
  // Initialize analytics here
  // e.g., load Google Analytics, PostHog, etc.
  analyticsInitialized = true;
  
  // Flush queued events
  if (preConsentQueue.length > 0) {
    console.log(`Flushing ${preConsentQueue.length} queued analytics events`);
    preConsentQueue.forEach(event => sendToAnalytics(event));
    preConsentQueue = [];
  }
  
  return true;
}

/**
 * Send event to analytics provider
 */
function sendToAnalytics(event: AnalyticsEvent) {
  // Replace with actual analytics implementation
  // Example: gtag('event', event.name, event.properties);
  // Example: posthog.capture(event.name, event.properties);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event.name, event.properties);
  }
}

/**
 * Track an analytics event
 */
export function trackEvent(name: string, properties?: Record<string, any>) {
  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: Date.now(),
  };
  
  if (ensureAnalytics()) {
    sendToAnalytics(event);
  } else {
    // Queue for later if consent given
    preConsentQueue.push(event);
    // Keep only last 50 events
    if (preConsentQueue.length > 50) {
      preConsentQueue.shift();
    }
  }
}

/**
 * Identify user (only if analytics allowed)
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (!ensureAnalytics()) return;
  
  // Replace with actual implementation
  // Example: posthog.identify(userId, traits);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Identify:', userId, traits);
  }
}

/**
 * Page view tracking
 */
export function trackPageView(path: string) {
  trackEvent('page_view', { path });
}

/**
 * React hook for automatic page view tracking
 */
export function usePageTracking(path: string) {
  const previousPath = useRef<string>();
  
  useEffect(() => {
    if (path !== previousPath.current) {
      trackPageView(path);
      previousPath.current = path;
    }
  }, [path]);
}

/**
 * Hook to check if analytics is active
 */
export function useAnalyticsStatus() {
  return {
    allowed: analyticsAllowed(),
    initialized: analyticsInitialized,
  };
}

/**
 * Reset analytics (for logout)
 */
export function resetAnalytics() {
  if (!analyticsAllowed()) return;
  
  // Example: posthog.reset();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics] Reset');
  }
}

export default {
  trackEvent,
  identifyUser,
  trackPageView,
  usePageTracking,
  useAnalyticsStatus,
  resetAnalytics,
};
