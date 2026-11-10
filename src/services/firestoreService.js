/**
 * Firestore Product Catalog Service
 * Requirement 1 & 2: Protected Firestore querying layer with strict regex validation
 * (UPC-A, UPC-E, EAN-13) before invoking getDoc(doc(db, "products", sanitizedBarcode))
 * and graceful error handling for missing/unscannable products.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import productsData from '../data/products.json' with { type: 'json' };

// Strict regex matching standard retail barcode formats:
// UPC-E (6-8 digits), UPC-A (12 digits), and EAN-13 (13 digits)
export const VALID_RETAIL_BARCODE_REGEX = /^(\d{6,8}|\d{12}|\d{13})$/;

// Authoritative local mock fallback catalog for offline resilience
const localCatalog = new Map(productsData.map(p => [p.barcode, p]));

/**
 * Validates and sanitizes a raw scanner barcode input.
 * Ensures the input matches strict standard retail patterns (UPC-A, UPC-E, EAN-13).
 *
 * @param {any} rawBarcode
 * @returns {{ isValid: boolean, sanitized: string, error?: string, format?: string }}
 */
export function validateBarcodeFormat(rawBarcode) {
  if (rawBarcode == null) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Barcode input cannot be empty'
    };
  }

  const sanitized = String(rawBarcode).trim();

  if (!sanitized) {
    return {
      isValid: false,
      sanitized: '',
      error: 'Barcode input cannot be empty'
    };
  }

  // Strict regex check for standard UPC-A, UPC-E, and EAN-13 formats
  if (!VALID_RETAIL_BARCODE_REGEX.test(sanitized)) {
    return {
      isValid: false,
      sanitized,
      error: 'Invalid barcode format. Expected standard UPC-A (12 digits), UPC-E (6-8 digits), or EAN-13 (13 digits).'
    };
  }

  let format = 'Retail Code';
  if (sanitized.length === 12) format = 'UPC-A';
  else if (sanitized.length === 13) format = 'EAN-13';
  else if (sanitized.length >= 6 && sanitized.length <= 8) format = 'UPC-E';

  return {
    isValid: true,
    sanitized,
    format
  };
}

/**
 * Fetches a product document from Cloud Firestore with strict input sanitization
 * and graceful error handling.
 *
 * @param {string} rawBarcode Raw scanner input
 * @param {Object} [options]
 * @param {string} [options.storeName] Store branch name for inventory lookup
 * @returns {Promise<{
 *   success: boolean,
 *   product?: Object,
 *   error?: string,
 *   code?: string,
 *   isOfflineFallback?: boolean
 * }>}
 */
export async function getProductByBarcode(rawBarcode, options = {}) {
  // Step 1: Strict input regex sanitization BEFORE invoking getDoc
  const validation = validateBarcodeFormat(rawBarcode);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      code: 'INVALID_BARCODE'
    };
  }

  const sanitizedBarcode = validation.sanitized;

  // Step 2: Query Firestore using sanitized barcode.
  // Quota Optimization: Strictly use one-time document read (getDoc) rather than
  // an active real-time listener (onSnapshot) to minimize read quotas and battery drain.
  try {
    const productRef = doc(db, 'products', sanitizedBarcode);
    const docSnap = await getDoc(productRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        success: true,
        product: {
          barcode: sanitizedBarcode,
          name: data.name,
          category: data.category,
          brand: data.brand,
          size: data.size,
          price: Number(data.price),
          wholesaleCost: data.wholesaleCost != null ? Number(data.wholesaleCost) : null,
          unit: data.unit,
          imageEmoji: data.imageEmoji || '📦',
          inventory: data.inventory || {},
          updatedAt: data.updatedAt || new Date().toISOString()
        }
      };
    }

    // Product document does not exist in Firestore
    // Check local fallback catalog for seamless demo / offline support
    const fallbackItem = localCatalog.get(sanitizedBarcode);
    if (fallbackItem) {
      return {
        success: true,
        isOfflineFallback: true,
        product: {
          ...fallbackItem,
          updatedAt: new Date().toISOString()
        }
      };
    }

    return {
      success: false,
      error: 'Product barcode not found in in-store catalog.',
      code: 'NOT_FOUND',
      barcode: sanitizedBarcode
    };
  } catch (err) {
    // Graceful error handling: network issues, App Check failures, or missing credentials
    console.warn(`[Firestore Catalog] Query failed for ${sanitizedBarcode}:`, err.message);

    // Fallback to local catalog if offline or in test environment
    const fallbackItem = localCatalog.get(sanitizedBarcode);
    if (fallbackItem) {
      return {
        success: true,
        isOfflineFallback: true,
        product: {
          ...fallbackItem,
          updatedAt: new Date().toISOString()
        }
      };
    }

    return {
      success: false,
      error: 'Product barcode not found in in-store catalog.',
      code: 'NOT_FOUND',
      barcode: sanitizedBarcode,
      originalError: err.message
    };
  }
}
