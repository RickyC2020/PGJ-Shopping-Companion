/**
 * Barcode Input Sanitization & Validation Module
 * Defense #5: Enforces strict input validation and pattern matching (UPC/EAN formats)
 * on all raw scanner inputs prior to database queries to prevent injection vulnerabilities.
 */

// Strict pattern for standard retail barcodes: 6 to 14 numeric digits
// (Covers UPC-E [6/8], EAN-8 [8], UPC-A [12], EAN-13 [13], ITF-14 [14])
export const RETAIL_BARCODE_REGEX = /^\d{6,14}$/;

// Known injection and malicious attack signatures
export const INJECTION_PATTERNS = [
  // SQL Injection signatures
  /('|"|;|--|\/\*|\*\/)/,
  /\b(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|EXEC)\b/i,
  // NoSQL Injection signatures
  /(\$where|\$gt|\$ne|\$regex|\$in|\$exists|\{|\})/i,
  // XSS / HTML Script injection signatures
  /(<|>|script|onerror|onload|javascript:|eval\()/i,
  // Command injection / Path traversal signatures
  /(\.\.\/|\.\.\\|\||&|`|\x00)/
];

/**
 * Validates UPC-A / EAN-13 check digit calculation.
 * @param {string} digits
 * @returns {boolean}
 */
export function verifyBarcodeCheckDigit(digits) {
  if (!/^\d+$/.test(digits)) return false;

  // UPC-A (12 digits) or EAN-13 (13 digits)
  if (digits.length === 12 || digits.length === 13) {
    const chars = digits.split('').map(Number);
    const checkDigit = chars[chars.length - 1];
    const dataDigits = chars.slice(0, -1);

    let sum = 0;
    // Standard mod 10 weighting: alternate 3 and 1 from right to left
    for (let i = 0; i < dataDigits.length; i++) {
      const idxFromRight = dataDigits.length - i;
      const weight = (idxFromRight % 2 === 1) ? 3 : 1;
      sum += dataDigits[i] * weight;
    }

    const calculatedCheck = (10 - (sum % 10)) % 10;
    return checkDigit === calculatedCheck;
  }

  // Other lengths (6, 8, etc.) pass basic format check
  return true;
}

/**
 * Sanitizes and validates raw scanner or manual input.
 * Blocks all SQLi, NoSQLi, XSS, and non-barcode strings before any database query.
 *
 * @param {any} rawInput Raw input from keyboard or camera scanner
 * @returns {{
 *   isValid: boolean,
 *   sanitized: string,
 *   format: string | null,
 *   error?: string
 * }}
 */
export function sanitizeBarcodeInput(rawInput) {
  if (rawInput == null) {
    return {
      isValid: false,
      sanitized: '',
      format: null,
      error: 'Barcode input cannot be empty'
    };
  }

  const inputStr = String(rawInput).trim();

  if (inputStr.length === 0) {
    return {
      isValid: false,
      sanitized: '',
      format: null,
      error: 'Barcode input cannot be empty'
    };
  }

  // 1. Guard against injection attacks
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(inputStr)) {
      return {
        isValid: false,
        sanitized: '',
        format: null,
        error: 'Security Alert: Malicious or illegal characters detected. Input rejected.'
      };
    }
  }

  // 2. Strict pattern matching (must be 6 to 14 numeric digits)
  if (!RETAIL_BARCODE_REGEX.test(inputStr)) {
    return {
      isValid: false,
      sanitized: '',
      format: null,
      error: 'Invalid barcode format. Expected 6-14 numeric digits (e.g. UPC/EAN).'
    };
  }

  // 3. Determine specific barcode format
  let format = 'Retail Code';
  if (inputStr.length === 12) format = 'UPC-A';
  else if (inputStr.length === 13) format = 'EAN-13';
  else if (inputStr.length === 8) format = 'EAN-8';
  else if (inputStr.length === 6) format = 'UPC-E';
  else if (inputStr.length === 14) format = 'ITF-14';

  // 4. Check digit verification for 12/13 digit standard retail items
  const isCheckDigitValid = verifyBarcodeCheckDigit(inputStr);
  if (!isCheckDigitValid) {
    return {
      isValid: false,
      sanitized: inputStr,
      format,
      error: `Invalid check digit for ${format} barcode. Please re-scan.`
    };
  }

  return {
    isValid: true,
    sanitized: inputStr,
    format
  };
}
