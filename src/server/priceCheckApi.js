/**
 * Protected Price-Check Server Endpoint
 * Combines Defense #4 (Rate Limiting & Bot Defense) and Defense #5 (Barcode Input Sanitization)
 * to provide a secure price-check API.
 */

import { checkRateLimit, verifyBotDefenseHeaders } from './rateLimiter.js';
import { sanitizeBarcodeInput } from '../utils/barcodeValidator.js';
import productsData from '../data/products.json' with { type: 'json' };

// Authoritative product catalog
const productsCatalog = new Map(productsData.map(p => [p.barcode, p]));

/**
 * Handles price-check requests on the server.
 *
 * @param {Object} req
 * @param {string} req.barcode Raw barcode submitted by scanner
 * @param {string} [req.storeName] Selected store branch
 * @param {string} [req.clientId='shopper-session'] Client IP or session ID
 * @param {Record<string, string>} [req.headers={}] HTTP request headers
 * @returns {{ status: number, headers: Record<string, string>, body: Object }}
 */
export function handlePriceCheckApi({
  barcode,
  storeName,
  clientId = 'shopper-session-default',
  headers = {
    'User-Agent': 'PGJ-Mobile/1.0 (iOS; Supermarket)',
    'X-Requested-With': 'PGJ-Mobile-App',
    'X-Client-Session': 'sess_valid_123'
  }
} = {}) {
  // 1. Bot Defense & Header Verification
  const headerCheck = verifyBotDefenseHeaders(headers);
  if (!headerCheck.isAuthorized) {
    return {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: false,
        error: 'Forbidden: Bot or unauthorized scraping detected',
        reason: headerCheck.reason
      }
    };
  }

  // 2. Scan Rate Limiting
  const rateLimitCheck = checkRateLimit(clientId);
  if (!rateLimitCheck.allowed) {
    return {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimitCheck.retryAfterSeconds)
      },
      body: {
        success: false,
        error: 'Too Many Requests: Scan rate limit exceeded. Please wait before scanning again.',
        retryAfter: rateLimitCheck.retryAfterSeconds
      }
    };
  }

  // 3. Barcode Input Sanitization
  const validation = sanitizeBarcodeInput(barcode);
  if (!validation.isValid) {
    return {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: false,
        error: validation.error,
        format: validation.format
      }
    };
  }

  // 4. Authoritative Database Query
  const product = productsCatalog.get(validation.sanitized);
  if (!product) {
    return {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: false,
        error: 'Product not found in database',
        scannedCode: validation.sanitized
      }
    };
  }

  // Return authoritative product data
  return {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: {
      success: true,
      data: {
        barcode: product.barcode,
        name: product.name,
        category: product.category,
        brand: product.brand,
        size: product.size,
        price: Number(product.price),
        wholesaleCost: product.wholesaleCost != null ? Number(product.wholesaleCost) : null,
        inventory: storeName ? (product.inventory?.[storeName] ?? 0) : product.inventory,
        isServerAuthoritative: true,
        checkedAt: Date.now()
      }
    }
  };
}
