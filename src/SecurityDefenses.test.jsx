import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Defense 1: Secret & Build Sanitization imports
import {
  auditClientEnvironment,
  sanitizeClientConfig,
  SAFE_CLIENT_VARS,
  SENSITIVE_KEY_PATTERNS
} from './utils/securityConfig';

// Defense 2: Dynamic Barcode Verification imports
import {
  generateTOTP,
  verifyTOTP,
  getSecondsRemaining,
  generateDynamicBarcodeBars
} from './utils/totpVerification';
import LoyaltyRewardsTab from './components/LoyaltyRewardsTab';

// Defense 3: Authoritative Server-Side Pricing imports
import {
  calculateAuthoritativeCart,
  handleCalculateCartApi
} from './server/authoritativePricing';
import PreCheckoutCart from './components/PreCheckoutCart';

// Defense 4: Scan Rate Limiting & Bot Defense imports
import {
  checkRateLimit,
  resetRateLimits,
  verifyBotDefenseHeaders
} from './server/rateLimiter';
import { handlePriceCheckApi } from './server/priceCheckApi';

// Defense 5: Barcode Input Sanitization imports
import {
  sanitizeBarcodeInput,
  verifyBarcodeCheckDigit
} from './utils/barcodeValidator';
import BarcodeScanner from './components/BarcodeScanner';

describe('Security Defenses for Retail Mobile Application', () => {

  // ============================================================================
  // 1. SECRET & BUILD SANITIZATION TESTS
  // ============================================================================
  describe('Defense 1: Secret & Build Sanitization', () => {
    it('detects and flags sensitive administrative keys in client environment', () => {
      const leakedEnv = {
        VITE_PUBLIC_API_URL: 'https://api.progressivefoods.com.jm/v1',
        VITE_ADMIN_MASTER_SECRET: 'super_secret_admin_key_9988',
        VITE_DATABASE_URL: 'postgres://admin:pass@db.internal:5432/retail',
        VITE_STAGING_CREDENTIAL: 'admin_staging_pass'
      };

      const audit = auditClientEnvironment(leakedEnv);
      expect(audit.isSafe).toBe(false);
      expect(audit.violations.length).toBeGreaterThanOrEqual(3);
      expect(audit.violations.some(v => v.includes('VITE_ADMIN_MASTER_SECRET'))).toBe(true);
      expect(audit.violations.some(v => v.includes('VITE_DATABASE_URL'))).toBe(true);
    });

    it('detects and flags internal staging/cluster URLs', () => {
      const leakedUrls = {
        VITE_API_ENDPOINT: 'http://staging.internal:8080/api',
        VITE_CLUSTER_URL: 'http://service.default.svc.cluster.local'
      };

      const audit = auditClientEnvironment(leakedUrls);
      expect(audit.isSafe).toBe(false);
      expect(audit.violations.some(v => v.includes('internal or staging URL'))).toBe(true);
    });

    it('sanitizes client configuration to only expose explicitly safe public variables', () => {
      const mixedEnv = {
        VITE_PUBLIC_API_URL: 'https://api.progressivefoods.com.jm/v1',
        VITE_PUBLIC_STORE_NAME: 'Portmore Branch',
        VITE_ADMIN_PASSWORD: 'leaked_password_123',
        INTERNAL_BACKEND_KEY: 'secret_jwt_key',
        DEV: true
      };

      const sanitized = sanitizeClientConfig(mixedEnv);

      // Safe variables preserved
      expect(sanitized.VITE_PUBLIC_API_URL).toBe('https://api.progressivefoods.com.jm/v1');
      expect(sanitized.VITE_PUBLIC_STORE_NAME).toBe('Portmore Branch');
      expect(sanitized.DEV).toBe(true);

      // Unsafe variables stripped
      expect(sanitized.VITE_ADMIN_PASSWORD).toBeUndefined();
      expect(sanitized.INTERNAL_BACKEND_KEY).toBeUndefined();
    });

    it('passes audit cleanly when only safe public variables are present', () => {
      const cleanEnv = {
        VITE_PUBLIC_API_URL: 'https://api.progressivefoods.com.jm/v1',
        VITE_PUBLIC_STORE_NAME: 'Progressive Foods Jamaica',
        MODE: 'production'
      };

      const audit = auditClientEnvironment(cleanEnv);
      expect(audit.isSafe).toBe(true);
      expect(audit.violations).toEqual([]);
    });
  });

  // ============================================================================
  // 2. DYNAMIC BARCODE VERIFICATION TESTS
  // ============================================================================
  describe('Defense 2: Dynamic Barcode Verification', () => {
    it('generates a 6-digit TOTP token that rotates across expiration intervals', () => {
      const cardNumber = '231791';
      // Align to start of a 30-second window
      const baseTime = Math.floor(1700000000000 / 30000) * 30000;

      const token1 = generateTOTP(cardNumber, baseTime, 30);
      expect(token1).toMatch(/^\d{6}$/);

      // Token within the same 30s window is identical
      const tokenSameWindow = generateTOTP(cardNumber, baseTime + 10000, 30);
      expect(tokenSameWindow).toBe(token1);

      // Token in next 30s window rotates
      const tokenNextWindow = generateTOTP(cardNumber, baseTime + 31000, 30);
      expect(tokenNextWindow).not.toBe(token1);
      expect(tokenNextWindow).toMatch(/^\d{6}$/);
    });

    it('verifies valid TOTP tokens and rejects expired/stale tokens', () => {
      const cardNumber = '231791';
      const now = Date.now();
      const currentToken = generateTOTP(cardNumber, now, 30);

      // Valid current token
      const checkValid = verifyTOTP(cardNumber, currentToken, now, 30);
      expect(checkValid.isValid).toBe(true);

      // Invalid token for different card
      const checkWrongCard = verifyTOTP('999999', currentToken, now, 30);
      expect(checkWrongCard.isValid).toBe(false);

      // Stale token from 5 minutes ago (far outside allowed window)
      const staleTime = now - (300 * 1000);
      const staleToken = generateTOTP(cardNumber, staleTime, 30);
      const checkStale = verifyTOTP(cardNumber, staleToken, now, 30, 0);
      expect(checkStale.isValid).toBe(false);
      expect(checkStale.reason).toContain('Expired or invalid');
    });

    it('calculates accurate countdown seconds remaining in current token window', () => {
      const testTimestamp = 30000; // Exactly on window boundary
      expect(getSecondsRemaining(testTimestamp, 30)).toBe(30);

      const midWindow = 45000; // 15 seconds in
      expect(getSecondsRemaining(midWindow, 30)).toBe(15);
    });

    it('renders active screenshot protection indicators and dynamic token in LoyaltyRewardsTab', () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      // Live Screenshot Protection indicator banner
      expect(screen.getByText(/LIVE SCREENSHOT PROTECTION ACTIVE/i)).toBeInTheDocument();

      // Rotating Token display
      expect(screen.getByText(/ROTATING TOKEN:/i)).toBeInTheDocument();
      expect(document.getElementById('totp-code-value')).toBeInTheDocument();
      expect(document.getElementById('totp-countdown-badge')).toBeInTheDocument();

      // Barcode container with scannable element preserved
      expect(document.getElementById('loyalty-barcode-container')).toBeInTheDocument();
      expect(document.getElementById('barcode-matching-number')).toHaveTextContent(/231791/);
    });
  });

  // ============================================================================
  // 3. AUTHORITATIVE SERVER-SIDE PRICING TESTS
  // ============================================================================
  describe('Defense 3: Authoritative Server-Side Pricing', () => {
    it('discards client-submitted prices and enforces authoritative server prices', () => {
      // Malicious client payload attempting to forge price to $0.01
      const tamperedClientItems = [
        {
          barcode: '055270961124', // Grace Mackerel (Authoritative price: 285.00)
          quantity: 2,
          price: 0.01,              // Tampered price
          wholesaleCost: 0.001,     // Tampered wholesale
          subtotal: 0.02            // Tampered subtotal
        }
      ];

      const calculation = calculateAuthoritativeCart(tamperedClientItems);

      // Server strictly ignored client-submitted 0.01 and applied authoritative 285.00
      expect(calculation.isServerAuthoritative).toBe(true);
      expect(calculation.items[0].unitPrice).toBe(285.00);
      expect(calculation.items[0].lineTotal).toBe(570.00); // 285.00 * 2
      expect(calculation.subtotal).toBe(570.00);
    });

    it('strictly applies server wholesale discount rules when quantity >= 3', () => {
      // Grace Mackerel (Regular: 285.00, Wholesale: 210.00)
      const wholesaleEligibleItems = [
        {
          barcode: '055270961124',
          quantity: 3
        }
      ];

      const calculation = calculateAuthoritativeCart(wholesaleEligibleItems);
      const item = calculation.items[0];

      expect(item.wholesaleApplied).toBe(true);
      expect(item.unitPrice).toBe(210.00);
      expect(item.lineTotal).toBe(630.00); // 210.00 * 3
      expect(item.lineSavings).toBe(225.00); // (285.00 - 210.00) * 3 = 225.00
      expect(calculation.totalWholesaleSavings).toBe(225.00);
      expect(calculation.subtotal).toBe(630.00);
      expect(calculation.pointsToEarn).toBe(6); // 630 / 100 = 6
    });

    it('calculates authoritative totals for multiple basket items', () => {
      const basket = [
        { barcode: '055270961124', quantity: 1 }, // Grace Mackerel: 285.00
        { barcode: '040055531586', quantity: 1 }  // Eve Black Pepper: 300.00
      ];

      const calculation = calculateAuthoritativeCart(basket);
      expect(calculation.items.length).toBe(2);
      expect(calculation.subtotal).toBe(585.00); // 285.00 + 300.00
      expect(calculation.totalItemCount).toBe(2);
      expect(calculation.pointsToEarn).toBe(5); // 585 / 100 = 5
    });

    it('displays server-authoritative badge and calculated totals in PreCheckoutCart', () => {
      const mockItems = [
        {
          product: {
            barcode: '055270961124',
            name: 'Grace Mackerel in Tomato Sauce 5.5oz',
            price: 285.00,
            wholesaleCost: 210.00
          },
          quantity: 2
        }
      ];

      render(<PreCheckoutCart cartItems={mockItems} isCardLinked={true} />);

      // Authoritative pricing indicator is present
      expect(document.getElementById('server-verified-pricing-badge')).toBeInTheDocument();
      expect(screen.getByText(/Authoritative Pricing/i)).toBeInTheDocument();

      // Displays authoritative subtotal ($570.00)
      expect(document.getElementById('cart-subtotal-value')).toHaveTextContent(/570\.00/);
      expect(screen.getAllByText(/570\.00/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================================
  // 4. SCAN RATE LIMITING & BOT DEFENSE TESTS
  // ============================================================================
  describe('Defense 4: Scan Rate Limiting & Bot Defense', () => {
    beforeEach(() => {
      resetRateLimits();
    });

    it('allows requests within rate limits and triggers 429 when threshold exceeded', () => {
      const clientId = 'user_session_abc';
      const config = { maxRequests: 3, windowMs: 10000 };
      const startTime = 100000;

      // 3 legitimate requests succeed
      expect(checkRateLimit(clientId, config, startTime).allowed).toBe(true);
      expect(checkRateLimit(clientId, config, startTime + 1000).allowed).toBe(true);
      expect(checkRateLimit(clientId, config, startTime + 2000).allowed).toBe(true);

      // 4th request exceeds limit
      const exceeded = checkRateLimit(clientId, config, startTime + 3000);
      expect(exceeded.allowed).toBe(false);
      expect(exceeded.remaining).toBe(0);
      expect(exceeded.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('resets rate limit window after expiration duration', () => {
      const clientId = 'user_session_xyz';
      const config = { maxRequests: 2, windowMs: 5000 };
      const startTime = 100000;

      // Max out
      checkRateLimit(clientId, config, startTime);
      checkRateLimit(clientId, config, startTime + 1000);
      expect(checkRateLimit(clientId, config, startTime + 2000).allowed).toBe(false);

      // After window passes (startTime + 6000ms), requests are allowed again
      const refreshed = checkRateLimit(clientId, config, startTime + 6000);
      expect(refreshed.allowed).toBe(true);
    });

    it('blocks automated price scrapers based on User-Agent and missing app headers', () => {
      // 1. Missing User-Agent
      const missingUA = verifyBotDefenseHeaders({
        'X-Requested-With': 'PGJ-Mobile-App',
        'X-Client-Session': 'sess_123'
      });
      expect(missingUA.isAuthorized).toBe(false);
      expect(missingUA.reason).toContain('Missing User-Agent');

      // 2. Scraping tool: python-requests
      const pythonBot = verifyBotDefenseHeaders({
        'User-Agent': 'python-requests/2.28.1',
        'X-Requested-With': 'PGJ-Mobile-App',
        'X-Client-Session': 'sess_123'
      });
      expect(pythonBot.isAuthorized).toBe(false);
      expect(pythonBot.reason).toContain('Scraping bot detected');

      // 3. Scraping tool: curl
      const curlBot = verifyBotDefenseHeaders({
        'User-Agent': 'curl/7.88.1',
        'X-Requested-With': 'PGJ-Mobile-App',
        'X-Client-Session': 'sess_123'
      });
      expect(curlBot.isAuthorized).toBe(false);

      // 4. Missing X-Requested-With app header
      const missingAppHeader = verifyBotDefenseHeaders({
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        'X-Client-Session': 'sess_123'
      });
      expect(missingAppHeader.isAuthorized).toBe(false);
      expect(missingAppHeader.reason).toContain('X-Requested-With');

      // 5. Genuine Mobile App Headers
      const genuineMobile = verifyBotDefenseHeaders({
        'User-Agent': 'PGJ-Mobile/1.0 (iOS; Progressive Supermarket)',
        'X-Requested-With': 'PGJ-Mobile-App',
        'X-Client-Session': 'sess_valid_shopper_456'
      });
      expect(genuineMobile.isAuthorized).toBe(true);
    });

    it('enforces bot defense and rate limiting on the price-check endpoint', () => {
      // Bot attempt to scrape
      const botResponse = handlePriceCheckApi({
        barcode: '055270961124',
        headers: {
          'User-Agent': 'curl/8.1.2'
        }
      });
      expect(botResponse.status).toBe(403);
      expect(botResponse.body.success).toBe(false);

      // Valid mobile price check
      const validResponse = handlePriceCheckApi({
        barcode: '055270961124',
        clientId: 'unique_shopper_99',
        headers: {
          'User-Agent': 'PGJ-Mobile/1.0 (iPhone)',
          'X-Requested-With': 'PGJ-Mobile-App',
          'X-Client-Session': 'sess_live_99'
        }
      });
      expect(validResponse.status).toBe(200);
      expect(validResponse.body.success).toBe(true);
      expect(validResponse.body.data.price).toBe(285.00);
    });
  });

  // ============================================================================
  // 5. BARCODE INPUT SANITIZATION TESTS
  // ============================================================================
  describe('Defense 5: Barcode Input Sanitization', () => {
    it('validates standard retail barcode formats (UPC-A, EAN-13, EAN-8)', () => {
      // 12-digit UPC-A (Grace Mackerel)
      const upcResult = sanitizeBarcodeInput('055270961124');
      expect(upcResult.isValid).toBe(true);
      expect(upcResult.sanitized).toBe('055270961124');
      expect(upcResult.format).toBe('UPC-A');

      // 12-digit UPC-A (Eve Black Pepper)
      const pepperResult = sanitizeBarcodeInput('040055531586');
      expect(pepperResult.isValid).toBe(true);
      expect(pepperResult.format).toBe('UPC-A');

      // 12-digit UPC-A (Grace Coconut Milk)
      const coconutResult = sanitizeBarcodeInput('050196110717');
      expect(coconutResult.isValid).toBe(true);
      expect(coconutResult.format).toBe('UPC-A');
    });

    it('detects and blocks SQL Injection payloads prior to database lookup', () => {
      const sqliPayloads = [
        "' OR '1'='1",
        "055270961124'; DROP TABLE products;--",
        "1' UNION SELECT * FROM users--",
        "admin'--"
      ];

      for (const payload of sqliPayloads) {
        const result = sanitizeBarcodeInput(payload);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Security Alert: Malicious or illegal characters detected');
      }
    });

    it('detects and blocks NoSQL Injection payloads prior to database lookup', () => {
      const nosqlPayloads = [
        '{"$gt": ""}',
        '{"$ne": null}',
        '$where: this.price > 0'
      ];

      for (const payload of nosqlPayloads) {
        const result = sanitizeBarcodeInput(payload);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Security Alert');
      }
    });

    it('detects and blocks XSS / HTML script tags', () => {
      const xssPayloads = [
        '<script>alert(1)</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:fetch("/steal")'
      ];

      for (const payload of xssPayloads) {
        const result = sanitizeBarcodeInput(payload);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('Security Alert');
      }
    });

    it('rejects non-numeric characters and out-of-bounds lengths', () => {
      // Alphabetic characters
      const alphaResult = sanitizeBarcodeInput('INVALIDCODE12');
      expect(alphaResult.isValid).toBe(false);
      expect(alphaResult.error).toContain('Invalid barcode format');

      // Too short (< 6 digits)
      const shortResult = sanitizeBarcodeInput('123');
      expect(shortResult.isValid).toBe(false);

      // Too long (> 14 digits)
      const longResult = sanitizeBarcodeInput('1234567890123456789');
      expect(longResult.isValid).toBe(false);
    });

    it('displays validation alert on BarcodeScanner component when malicious input submitted', () => {
      const mockScan = vi.fn();
      render(
        <BarcodeScanner
          barcodeInput="' OR '1'='1"
          setBarcodeInput={vi.fn()}
          onScan={mockScan}
          products={[]}
          mode="customer"
        />
      );

      const submitBtn = document.getElementById('scan-barcode-submit-btn');
      fireEvent.click(submitBtn);

      // onScan was NOT called (database query prevented)
      expect(mockScan).not.toHaveBeenCalled();

      // Security alert is rendered in the UI
      expect(document.getElementById('barcode-validation-error-alert')).toBeInTheDocument();
      expect(screen.getByText(/Security Alert: Malicious or illegal characters detected/i)).toBeInTheDocument();
    });
  });

});
