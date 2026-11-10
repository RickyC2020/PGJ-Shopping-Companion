import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import fs from 'fs';
import path from 'path';

// Services & Components to test
import {
  validateBarcodeFormat,
  getProductByBarcode,
  VALID_RETAIL_BARCODE_REGEX
} from './services/firestoreService';
import { firebaseConfig, initializeRetailAppCheck } from './services/firebase';
import { SAFE_CLIENT_VARS, auditClientEnvironment } from './utils/securityConfig';
import ProductResultCard from './components/ProductResultCard';
import PreCheckoutCart from './components/PreCheckoutCart';

describe('Firebase Firestore Security Rules & Price Safeguards', () => {

  // ============================================================================
  // 1. STRICT READ-ONLY CATALOG RULES (firestore.rules)
  // ============================================================================
  describe('1. Strict Read-Only Catalog Rules', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');

    it('verifies firestore.rules file exists and is configured for production', () => {
      expect(fs.existsSync(rulesPath)).toBe(true);
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');
      expect(rulesContent).toContain("rules_version = '2'");
      expect(rulesContent).toContain('service cloud.firestore');
    });

    it('strictly enforces allow write: if false on /products/{productId}', () => {
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');

      // Ensure /products/{productId} block exists
      expect(rulesContent).toMatch(/match\s+\/products\/\{productId\}/);

      // Verify read is allowed
      expect(rulesContent).toMatch(/allow\s+read:\s+if\s+true;/);

      // Verify write is strictly forbidden
      expect(rulesContent).toMatch(/allow\s+write:\s+if\s+false;/);
    });

    it('enforces default deny on all other collections', () => {
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');
      expect(rulesContent).toMatch(/match\s+\/\{document=\*\*\}/);
      expect(rulesContent).toMatch(/allow\s+read,\s+write:\s+if\s+false;/);
    });
  });

  // ============================================================================
  // 2. SCANNER INPUT VALIDATION (UPC-A, UPC-E, EAN-13)
  // ============================================================================
  describe('2. Scanner Input Validation & Firestore Service', () => {
    it('strictly validates standard UPC-A (12 digits), UPC-E (6-8 digits), and EAN-13 (13 digits)', () => {
      // Valid UPC-A (12 digits)
      const upcA = validateBarcodeFormat('055270961124');
      expect(upcA.isValid).toBe(true);
      expect(upcA.format).toBe('UPC-A');
      expect(upcA.sanitized).toBe('055270961124');

      // Valid EAN-13 (13 digits)
      const ean13 = validateBarcodeFormat('8857131311916');
      expect(ean13.isValid).toBe(true);
      expect(ean13.format).toBe('EAN-13');
      expect(ean13.sanitized).toBe('8857131311916');

      // Valid UPC-E (6 and 8 digits)
      const upcE6 = validateBarcodeFormat('123456');
      expect(upcE6.isValid).toBe(true);
      expect(upcE6.format).toBe('UPC-E');

      const upcE8 = validateBarcodeFormat('12345678');
      expect(upcE8.isValid).toBe(true);
      expect(upcE8.format).toBe('UPC-E');
    });

    it('rejects non-standard formats and potential injection strings prior to Firestore query', () => {
      const invalidInputs = [
        '',
        '   ',
        null,
        undefined,
        '123',                      // Too short
        '123456789012345',          // Too long (> 14 digits)
        '05527096112A',             // Non-numeric alphanumeric
        "' OR '1'='1",              // SQLi
        '{"$gt": ""}',              // NoSQLi
        '<script>alert(1)</script>' // XSS
      ];

      for (const input of invalidInputs) {
        const result = validateBarcodeFormat(input);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('returns structured error without throwing when barcode format is invalid', async () => {
      const result = await getProductByBarcode("'; DROP TABLE products;--");
      expect(result.success).toBe(false);
      expect(result.code).toBe('INVALID_BARCODE');
      expect(result.error).toContain('Invalid barcode format');
    });

    it('handles unscannable or missing barcodes gracefully without throwing', async () => {
      const result = await getProductByBarcode('999999999999'); // Valid length, not in catalog
      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
      expect(result.error).toContain('not found');
    });
  });

  // ============================================================================
  // 3. APP CHECK & SCRAPING MITIGATION
  // ============================================================================
  describe('3. App Check & Catalog Scraping Mitigation', () => {
    it('verifies only public Firebase client config values are exposed', () => {
      expect(firebaseConfig).toBeDefined();
      expect(firebaseConfig.projectId).toBeDefined();
      expect(firebaseConfig.authDomain).toBeDefined();

      // Ensure no private credentials exist in the client config object
      expect(firebaseConfig.privateKey).toBeUndefined();
      expect(firebaseConfig.clientSecret).toBeUndefined();
      expect(firebaseConfig.adminSecret).toBeUndefined();
    });

    it('verifies safe client environment whitelist includes Firebase public variables', () => {
      expect(SAFE_CLIENT_VARS.has('VITE_FIREBASE_API_KEY')).toBe(true);
      expect(SAFE_CLIENT_VARS.has('VITE_FIREBASE_PROJECT_ID')).toBe(true);
      expect(SAFE_CLIENT_VARS.has('VITE_FIREBASE_APP_CHECK_KEY')).toBe(true);

      // Verify audit catches any administrative credentials
      const audit = auditClientEnvironment({
        VITE_FIREBASE_PROJECT_ID: 'progressive-foods-retail',
        VITE_ADMIN_PRIVATE_KEY: 'secret_key_leaked'
      });
      expect(audit.isSafe).toBe(false);
      expect(audit.violations.length).toBeGreaterThanOrEqual(1);
    });

    it('provides initializeRetailAppCheck boilerplate for reCAPTCHA Enterprise', () => {
      expect(typeof initializeRetailAppCheck).toBe('function');
      const appCheck = initializeRetailAppCheck();
      // In jsdom environment, gracefully returns or handles fallback without crashing
      expect(appCheck === null || typeof appCheck === 'object').toBe(true);
    });
  });

  // ============================================================================
  // 4. IN-STORE PRICE DISCREPANCY SAFEGUARDS & FRESHNESS BADGES
  // ============================================================================
  describe('4. In-Store Price Discrepancy Safeguard', () => {
    const mockProduct = {
      barcode: '055270961124',
      name: 'Grace Mackerel in Tomato Sauce 5.5oz',
      price: 285.00,
      wholesaleCost: 210.00,
      category: 'Canned Goods',
      brand: 'Grace',
      unit: '5.5oz can'
    };

    it('renders disclaimer microcopy and freshness badge on the ProductResultCard', () => {
      render(
        <ProductResultCard
          product={mockProduct}
          mode="customer"
          selectedStore={{ name: 'Progressive Foods Portmore' }}
        />
      );

      // In-store price discrepancy microcopy
      expect(document.getElementById('price-discrepancy-notice')).toBeInTheDocument();
      expect(screen.getByText(/Estimated in-store total\. Final prices and promotions are calculated at the cash register\./i)).toBeInTheDocument();

      // Updated today freshness badge
      expect(document.getElementById('price-freshness-badge')).toBeInTheDocument();
      expect(screen.getByText(/Updated today/i)).toBeInTheDocument();
    });

    it('renders disclaimer microcopy and item freshness chips on the PreCheckoutCart estimator', () => {
      const mockCartItems = [
        {
          product: mockProduct,
          quantity: 2
        }
      ];

      render(
        <PreCheckoutCart
          cartItems={mockCartItems}
          isCardLinked={true}
          selectedStore={{ name: 'Progressive Foods Portmore' }}
        />
      );

      // In-store price discrepancy microcopy in cart estimator
      expect(document.getElementById('cart-discrepancy-notice')).toBeInTheDocument();
      expect(screen.getByText(/Estimated in-store total\. Final prices and promotions are calculated at the cash register\./i)).toBeInTheDocument();

      // Freshness chip on cart item
      expect(document.getElementById('freshness-055270961124')).toBeInTheDocument();
      expect(screen.getAllByText(/Updated today/i).length).toBeGreaterThanOrEqual(1);
    });
  });

});
