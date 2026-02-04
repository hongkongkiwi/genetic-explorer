/**
 * XSS Protection Utilities
 * 
 * Provides input sanitization and output encoding to prevent XSS attacks.
 * Uses DOMPurify for HTML sanitization and provides helper functions
 * for various contexts (HTML, JavaScript, URL, CSS).
 */

import DOMPurify from 'isomorphic-dompurify';

// Configure DOMPurify for strict sanitization
const STRICT_CONFIG = {
  ALLOWED_TAGS: [], // No HTML tags allowed (plain text only)
  ALLOWED_ATTR: [], // No attributes allowed
  KEEP_CONTENT: true, // Keep the text content
};

// Configure DOMPurify for rich text (if needed in future)
const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['href', 'title', 'target'],
  ALLOW_DATA_ATTR: false,
  SANITIZE_DOM: true,
};

/**
 * HTML entity decoder - decodes entities like &lt; to <
 * Uses DOMParser which is safer than innerHTML
 */
function decodeHtmlEntities(text: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use regex-based decoding
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
  }
  
  // Client-side: use DOMParser (safe, doesn't execute scripts)
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<!DOCTYPE html><html><body><textarea>${text}</textarea></body></html>`, 'text/html');
  const textarea = doc.querySelector('textarea');
  return textarea ? textarea.textContent || '' : text;
}

/**
 * Sanitize user input to plain text
 * Removes ALL HTML tags and attributes
 */
export function sanitizePlainText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Use DOMPurify to strip all HTML
  const sanitized = DOMPurify.sanitize(input, STRICT_CONFIG);
  
  // Decode HTML entities
  return decodeHtmlEntities(sanitized);
}

/**
 * Sanitize rich text input
 * Allows safe HTML tags, removes dangerous ones
 */
export function sanitizeRichText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(input, RICH_TEXT_CONFIG);
}

/**
 * Escape HTML special characters
 * Use when inserting text into HTML content
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char]);
}

/**
 * Escape JavaScript string
 * Use when inserting text into JavaScript strings
 */
export function escapeJavaScript(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const jsEscapes: Record<string, string> = {
    '\\': '\\\\',
    '"': '\\"',
    "'": "\\'",
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\b': '\\b',
    '\f': '\\f',
  };

  return text.replace(/[\\"'\n\r\t\b\f]/g, (char) => jsEscapes[char]);
}

/**
 * Escape URL parameter
 * Use when inserting text into URLs
 */
export function escapeUrl(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return encodeURIComponent(text);
}

/**
 * Escape CSS string
 * Use when inserting text into CSS
 */
export function escapeCss(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // CSS escaping: \ followed by hex value
  return text.replace(/[^a-zA-Z0-9-_]/g, (char) => {
    return '\\' + char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
  });
}

/**
 * Sanitize object properties recursively
 * Useful for sanitizing entire form inputs or API responses
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: {
    allowedFields?: string[];  // Fields to skip sanitization
    richTextFields?: string[]; // Fields that allow rich text
  } = {}
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const { allowedFields = [], richTextFields = [] } = options;
  const result = { ...obj } as Record<string, unknown>;

  for (const key of Object.keys(result)) {
    const value = result[key];

    // Skip allowed fields
    if (allowedFields.includes(key)) {
      continue;
    }

    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field type
      if (richTextFields.includes(key)) {
        result[key] = sanitizeRichText(value);
      } else {
        result[key] = sanitizePlainText(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      result[key] = sanitizeObject(value as Record<string, unknown>, options);
    }
  }

  return result as T;
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Remove any HTML/JS first
  const sanitized = sanitizePlainText(email);
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized.toLowerCase().trim();
}

/**
 * Validate and sanitize display name
 */
export function sanitizeDisplayName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Remove HTML, limit length
  let sanitized = sanitizePlainText(name).trim();
  
  // Limit to reasonable length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }

  return sanitized;
}

/**
 * Check if input contains potential XSS vectors
 * Useful for validation before sanitization
 */
export function containsXssVectors(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Create a safe HTML string from template literals
 * Automatically escapes all interpolated values
 */
export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((result, string, i) => {
    const value = values[i];
    if (value === undefined || value === null) {
      return result + string;
    }
    return result + string + escapeHtml(String(value));
  }, '');
}

/**
 * Sanitize file name
 * Removes path traversal attempts and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  // Remove path components
  const basename = filename.replace(/^.*[\\\/]/, '');
  
  // Remove dangerous characters
  const sanitized = basename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.lastIndexOf('.') > 0 
      ? sanitized.substring(sanitized.lastIndexOf('.'))
      : '';
    return sanitized.substring(0, 255 - ext.length) + ext;
  }

  return sanitized;
}

// ============================================================================
// React-specific helpers
// ============================================================================

/**
 * Props to spread on elements that should not accept dangerouslySetInnerHTML
 */
export const safeHtmlProps = {
  dangerouslySetInnerHTML: undefined,
};

/**
 * Check if a URL is safe (prevent javascript: URLs)
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return true; // Empty is safe (will be handled by default)
  
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const normalized = url.trim().toLowerCase();
  
  return !dangerousProtocols.some(protocol => normalized.startsWith(protocol));
}

/**
 * Sanitize URL
 * Returns safe URL or empty string if unsafe
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  if (isSafeUrl(url)) {
    return url;
  }
  
  console.warn('Blocked dangerous URL:', url);
  return '';
}
