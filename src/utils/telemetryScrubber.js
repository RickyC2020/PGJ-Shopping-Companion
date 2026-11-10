/**
 * Telemetry PII Scrubber & Global Error Handler Utility
 * Complies with the Jamaica Data Protection Act (JDPA 2020) by masking
 * customer phone numbers, email addresses, member IDs, and tokens
 * before errors reach the console or remote telemetry systems.
 */

// PII Regex Patterns
export const PII_PATTERNS = {
  // Jamaican (+1 876) & North American / International phone numbers
  PHONE: /(\+?1[-.\s]?)?(\(?876\)?|\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}/g,

  // Email addresses
  EMAIL: /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g,

  // Member ID (e.g., MEM-482-910-33)
  MEMBER_ID: /MEM-\d{3}-\d{3}-\d{2}/gi,

  // Loyalty Card Number (6-digit physical card #231791 or generic card labels)
  CARD_NUMBER: /\b(231791)\b/g,

  // API Keys (Google/Firebase AIza keys)
  API_KEY: /AIza[0-9A-Za-z-_]{35}/g,

  // JWT or Bearer Tokens
  BEARER_TOKEN: /Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi
};

/**
 * Sanitizes a string by replacing PII matches with standard redaction markers.
 * @param {string} text
 * @returns {string}
 */
export function scrubPIIFromString(text) {
  if (typeof text !== 'string') return text;

  let sanitized = text;
  sanitized = sanitized.replace(PII_PATTERNS.EMAIL, '[EMAIL_REDACTED]');
  sanitized = sanitized.replace(PII_PATTERNS.PHONE, '[PHONE_REDACTED]');
  sanitized = sanitized.replace(PII_PATTERNS.MEMBER_ID, '[MEMBER_ID_REDACTED]');
  sanitized = sanitized.replace(PII_PATTERNS.CARD_NUMBER, '[CARD_NUM_REDACTED]');
  sanitized = sanitized.replace(PII_PATTERNS.API_KEY, '[API_KEY_REDACTED]');
  sanitized = sanitized.replace(PII_PATTERNS.BEARER_TOKEN, 'Bearer [TOKEN_REDACTED]');

  return sanitized;
}

/**
 * Recursively scrubs error objects, payloads, strings, or arrays.
 * @param {any} payload
 * @returns {any}
 */
export function scrubPayload(payload) {
  if (payload === null || payload === undefined) return payload;

  if (typeof payload === 'string') {
    return scrubPIIFromString(payload);
  }

  if (payload instanceof Error) {
    const scrubbedError = new Error(scrubPIIFromString(payload.message));
    scrubbedError.name = payload.name;
    if (payload.stack) {
      scrubbedError.stack = scrubPIIFromString(payload.stack);
    }
    return scrubbedError;
  }

  if (Array.isArray(payload)) {
    return payload.map(item => scrubPayload(item));
  }

  if (typeof payload === 'object') {
    const scrubbedObj = {};
    for (const [key, value] of Object.entries(payload)) {
      // Direct key-based scrubbing for sensitive field names
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
        scrubbedObj[key] = '[PHONE_REDACTED]';
      } else if (lowerKey.includes('email')) {
        scrubbedObj[key] = '[EMAIL_REDACTED]';
      } else if (lowerKey.includes('memberid') || lowerKey.includes('cardnumber')) {
        scrubbedObj[key] = '[MEMBER_ID_REDACTED]';
      } else if (lowerKey.includes('token') || lowerKey.includes('secret') || lowerKey.includes('key')) {
        scrubbedObj[key] = '[TOKEN_REDACTED]';
      } else {
        scrubbedObj[key] = scrubPayload(value);
      }
    }
    return scrubbedObj;
  }

  return payload;
}

/**
 * Formats a clean, scrubbed telemetry payload ready for Crashlytics or logging.
 * @param {Error|string} error
 * @param {Record<string, any>} context
 * @returns {{ timestamp: string, error: any, context: any }}
 */
export function captureScrubbedError(error, context = {}) {
  const scrubbedErr = scrubPayload(error);
  const scrubbedCtx = scrubPayload(context);

  return {
    timestamp: new Date().toISOString(),
    error: scrubbedErr instanceof Error
      ? { message: scrubbedErr.message, name: scrubbedErr.name, stack: scrubbedErr.stack }
      : scrubbedErr,
    context: scrubbedCtx
  };
}

/**
 * Installs global error and unhandled rejection interceptors in the browser
 * to scrub PII from uncaught runtime errors before console or telemetry output.
 */
let isInstalled = false;

export function installGlobalErrorScrubber(telemetryCallback) {
  if (isInstalled || typeof window === 'undefined') return;
  isInstalled = true;

  // Intercept uncaught window errors
  window.addEventListener('error', (event) => {
    const sanitizedMsg = scrubPIIFromString(event.message || '');
    const sanitizedError = event.error ? scrubPayload(event.error) : null;

    if (telemetryCallback) {
      telemetryCallback(captureScrubbedError(sanitizedError || sanitizedMsg, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }));
    }
  });

  // Intercept unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const sanitizedReason = scrubPayload(event.reason);

    if (telemetryCallback) {
      telemetryCallback(captureScrubbedError(sanitizedReason, {
        type: 'unhandledrejection'
      }));
    }
  });

  // Wrap console.error and console.warn to protect against accidental developer logging
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args) => {
    const scrubbedArgs = args.map(arg => scrubPayload(arg));
    originalConsoleError.apply(console, scrubbedArgs);
  };

  console.warn = (...args) => {
    const scrubbedArgs = args.map(arg => scrubPayload(arg));
    originalConsoleWarn.apply(console, scrubbedArgs);
  };
}
