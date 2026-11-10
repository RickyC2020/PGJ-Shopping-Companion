/**
 * Secret & Build Sanitization Module
 * Defense #1: Prevents administrative credentials, private backend keys,
 * and internal staging URLs from leaking into client bundles.
 */

// Explicitly safe public variable whitelist for the client application
export const SAFE_CLIENT_VARS = new Set([
  'VITE_APP_NAME',
  'VITE_PUBLIC_API_URL',
  'VITE_PUBLIC_STORE_NAME',
  'VITE_PUBLIC_GEMINI_API_KEY',
  'VITE_GEMINI_API_KEY', // Kept for backwards compatibility with existing .env
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_APP_CHECK_KEY',
  'BASE_URL',
  'MODE',
  'DEV',
  'PROD',
  'SSR'
]);

// Patterns that identify high-risk administrative or backend secrets
export const SENSITIVE_KEY_PATTERNS = [
  /ADMIN_/i,
  /SECRET/i,
  /PASSWORD/i,
  /PRIVATE_KEY/i,
  /DATABASE_URL/i,
  /DB_PASS/i,
  /STAGING_CREDENTIAL/i,
  /INTERNAL_TOKEN/i,
  /BACKEND_KEY/i,
  /ROOT_PASS/i,
  /MASTER_KEY/i
];

// Patterns that identify internal/staging URLs that must never leak to clients
export const SENSITIVE_URL_PATTERNS = [
  /staging\.internal/i,
  /cluster\.local/i,
  /10\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
  /192\.168\.\d{1,3}\.\d{1,3}/,
  /admin\.internal/i
];

/**
 * Audits an environment object to guarantee no sensitive variables are exposed to the client.
 * @param {Record<string, string>} envObj The environment variables object (e.g. import.meta.env)
 * @returns {{ isSafe: boolean, violations: string[] }}
 */
export function auditClientEnvironment(envObj = {}) {
  const violations = [];

  for (const [key, value] of Object.entries(envObj)) {
    // Check for sensitive variable names exposed with client prefix
    const hasSensitiveName = SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));
    if (hasSensitiveName) {
      violations.push(`Sensitive variable name '${key}' exposed to client.`);
      continue;
    }

    // Check if the value contains internal credentials or staging URLs
    if (typeof value === 'string') {
      const hasSensitiveUrl = SENSITIVE_URL_PATTERNS.some(pattern => pattern.test(value));
      if (hasSensitiveUrl) {
        violations.push(`Value for '${key}' contains internal or staging URL.`);
        continue;
      }
    }
  }

  return {
    isSafe: violations.length === 0,
    violations
  };
}

/**
 * Returns a sanitized copy of client environment variables, stripping any non-whitelisted
 * or sensitive keys.
 * @param {Record<string, string>} rawEnv
 * @returns {Record<string, string>}
 */
export function sanitizeClientConfig(rawEnv = {}) {
  const sanitized = {};
  for (const [key, value] of Object.entries(rawEnv)) {
    // Exclude anything matching sensitive patterns
    const isSensitive = SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));
    if (isSensitive) continue;

    // Check if it's either in the whitelist or starts with safe client prefixes
    if (SAFE_CLIENT_VARS.has(key) || key.startsWith('VITE_PUBLIC_') || key.startsWith('VITE_FIREBASE_')) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Vite plugin to enforce Secret & Build Sanitization during Vite configuration & build.
 */
export function secretSanitizationPlugin() {
  return {
    name: 'pgj-secret-sanitization-plugin',
    configResolved(config) {
      const rawEnv = config.env || {};
      const audit = auditClientEnvironment(rawEnv);
      if (!audit.isSafe) {
        const errorMsg = `[SECURITY ALERT] Build Sanitization Failed!\n${audit.violations.join('\n')}`;
        if (config.command === 'build') {
          throw new Error(errorMsg);
        } else {
          console.warn(errorMsg);
        }
      }
    }
  };
}
