/**
 * Dynamic Barcode & TOTP Verification Module
 * Defense #2: Prevents static screenshot sharing of loyalty rewards barcodes
 * by generating time-based rotating tokens and active expiring validation.
 */

const DEFAULT_SECRET = 'PGJ_REWARDS_SALT_SECURE_2026';
const DEFAULT_PERIOD_SECONDS = 30;

/**
 * Lightweight deterministic hash function for time-based token generation
 * (Ensures cross-platform standard behavior in pure JS/Node/Browser).
 */
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0);
}

/**
 * Generates a 6-digit time-based rotating token (TOTP) for a loyalty card.
 * @param {string} cardNumber The member's loyalty card number
 * @param {number} [timestamp=Date.now()]
 * @param {number} [periodSeconds=30] Token validity period in seconds
 * @param {string} [secret=DEFAULT_SECRET]
 * @returns {string} 6-digit zero-padded token
 */
export function generateTOTP(
  cardNumber = '231791',
  timestamp = Date.now(),
  periodSeconds = DEFAULT_PERIOD_SECONDS,
  secret = DEFAULT_SECRET
) {
  const timeStep = Math.floor(timestamp / (periodSeconds * 1000));
  const payload = `${cardNumber}:${secret}:${timeStep}`;
  const hashVal = hashString(payload);
  const sixDigit = (hashVal % 1000000).toString().padStart(6, '0');
  return sixDigit;
}

/**
 * Returns seconds remaining in the current TOTP cycle.
 * @param {number} [timestamp=Date.now()]
 * @param {number} [periodSeconds=30]
 * @returns {number} Seconds from 1 to periodSeconds
 */
export function getSecondsRemaining(timestamp = Date.now(), periodSeconds = DEFAULT_PERIOD_SECONDS) {
  const currentSec = Math.floor(timestamp / 1000);
  const remainder = currentSec % periodSeconds;
  return periodSeconds - remainder;
}

/**
 * Verifies a submitted TOTP token against the member's card and timestamp.
 * Allows a configurable skew window (default ±1 window) for slight clock drift.
 * @param {string} cardNumber
 * @param {string} token
 * @param {number} [timestamp=Date.now()]
 * @param {number} [periodSeconds=30]
 * @param {number} [allowedSkewWindows=1]
 * @returns {{ isValid: boolean, reason?: string }}
 */
export function verifyTOTP(
  cardNumber,
  token,
  timestamp = Date.now(),
  periodSeconds = DEFAULT_PERIOD_SECONDS,
  allowedSkewWindows = 1,
  secret = DEFAULT_SECRET
) {
  if (!cardNumber || !token) {
    return { isValid: false, reason: 'Card number and token are required' };
  }

  const cleanToken = String(token).trim();
  const currentStep = Math.floor(timestamp / (periodSeconds * 1000));

  for (let offset = -allowedSkewWindows; offset <= allowedSkewWindows; offset++) {
    const step = currentStep + offset;
    const expectedHash = hashString(`${cardNumber}:${secret}:${step}`);
    const expectedToken = (expectedHash % 1000000).toString().padStart(6, '0');
    if (expectedToken === cleanToken) {
      return { isValid: true };
    }
  }

  return { isValid: false, reason: 'Expired or invalid security token' };
}

/**
 * Generates dynamic barcode bar widths and gaps based on the rotating token.
 * This ensures that a static screenshot will have an outdated barcode pattern.
 * @param {string} token 6-digit token
 * @returns {Array<{ w: number, g: number }>}
 */
export function generateDynamicBarcodeBars(token = '000000') {
  const baseBars = [
    { w: 3, g: 2 }, { w: 1, g: 3 }, { w: 4, g: 1 }, { w: 2, g: 2 },
    { w: 1, g: 4 }, { w: 3, g: 1 }, { w: 2, g: 3 }, { w: 4, g: 2 },
    { w: 2, g: 1 }, { w: 3, g: 3 }, { w: 1, g: 2 }, { w: 4, g: 1 }
  ];

  // Modulate bars with token digits
  const modulated = baseBars.map((bar, i) => {
    const digit = parseInt(token[i % token.length], 10) || 0;
    const dynamicW = Math.max(1, ((bar.w + (digit % 3)) % 4) + 1);
    const dynamicG = Math.max(1, ((bar.g + (digit % 2)) % 3) + 1);
    return { w: dynamicW, g: dynamicG };
  });

  return modulated;
}
