/**
 * Stub for @sentry/node on the client side
 * This prevents the actual @sentry/node from being bundled for the client
 */

export const init = () => {};
export const captureException = () => '';
export const captureMessage = () => '';
export const captureEvent = () => '';
export const setUser = () => {};
export const setTag = () => {};
export const setContext = () => {};
export const addBreadcrumb = () => {};
export const isSentryConfigured = () => false;

// Default export
export default {
  init,
  captureException,
  captureMessage,
  captureEvent,
  setUser,
  setTag,
  setContext,
  addBreadcrumb,
};
