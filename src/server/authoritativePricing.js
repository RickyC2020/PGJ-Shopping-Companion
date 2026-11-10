/**
 * Authoritative Server-Side Pricing Engine
 * Defense #3: Guarantees that item pricing, wholesale discounts, and cart totals
 * are strictly computed on the server. Client-submitted prices and totals are
 * strictly untrusted display data and are discarded.
 */

import productsData from '../data/products.json' with { type: 'json' };

// Authoritative in-memory product catalog (server source of truth)
const AUTHORITATIVE_CATALOG = new Map(
  productsData.map(product => [
    product.barcode,
    {
      barcode: product.barcode,
      name: product.name,
      category: product.category,
      price: Number(product.price),
      wholesaleCost: product.wholesaleCost != null ? Number(product.wholesaleCost) : null,
      inventory: product.inventory || {}
    }
  ])
);

/**
 * Calculates authoritative cart pricing and discounts.
 *
 * @param {Array<{ barcode: string, quantity: number, [untrustedPrice]: any }>} rawItems
 * @param {Object} [options]
 * @param {string} [options.storeName] Store branch name for localized inventory checks
 * @returns {{
 *   items: Array<{
 *     barcode: string,
 *     name: string,
 *     quantity: number,
 *     regularPrice: number,
 *     unitPrice: number,
 *     lineTotal: number,
 *     wholesaleApplied: boolean,
 *     lineSavings: number
 *   }>,
 *   subtotal: number,
 *   totalWholesaleSavings: number,
 *   pointsToEarn: number,
 *   totalItemCount: number,
 *   isServerAuthoritative: boolean,
 *   calculatedAt: number
 * }}
 */
export function calculateAuthoritativeCart(rawItems = [], options = {}) {
  if (!Array.isArray(rawItems)) {
    throw new Error('Invalid cart payload: items must be an array');
  }

  const items = [];
  let subtotal = 0;
  let totalWholesaleSavings = 0;
  let totalItemCount = 0;

  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== 'object') continue;

    const barcode = String(rawItem.barcode || (rawItem.product && rawItem.product.barcode) || '').trim();
    if (!barcode) continue;

    // Look up authoritative item in the server catalog
    const serverProduct = AUTHORITATIVE_CATALOG.get(barcode);
    if (!serverProduct) {
      // Product not in catalog; ignore or omit
      continue;
    }

    // Sanitize quantity (strictly positive integer, minimum 1)
    const rawQty = rawItem.quantity !== undefined ? rawItem.quantity : 1;
    const quantity = Math.max(1, Math.floor(Number(rawQty) || 1));

    // CRITICAL SECURITY ENFORCEMENT:
    // IGNORE any client-submitted `rawItem.price`, `rawItem.unitPrice`, or `rawItem.wholesaleCost`.
    // ONLY use authoritative pricing from serverProduct.
    const regularPrice = serverProduct.price;
    const wholesaleCost = serverProduct.wholesaleCost;

    // Authoritative wholesale rule: 3 or more units qualifies for wholesale cost
    const wholesaleApplied = quantity >= 3 && wholesaleCost != null;
    const unitPrice = wholesaleApplied ? wholesaleCost : regularPrice;

    const lineTotal = unitPrice * quantity;
    const lineSavings = wholesaleApplied ? (regularPrice - wholesaleCost) * quantity : 0;

    subtotal += lineTotal;
    totalWholesaleSavings += lineSavings;
    totalItemCount += quantity;

    items.push({
      barcode: serverProduct.barcode,
      name: serverProduct.name,
      quantity,
      regularPrice,
      unitPrice,
      lineTotal,
      wholesaleApplied,
      lineSavings
    });
  }

  // Official loyalty formula: 1 point per $100 JMD of subtotal
  const pointsToEarn = Math.floor(subtotal / 100);

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
    totalWholesaleSavings: Number(totalWholesaleSavings.toFixed(2)),
    pointsToEarn,
    totalItemCount,
    isServerAuthoritative: true,
    calculatedAt: Date.now()
  };
}

/**
 * Server endpoint handler for /api/cart/calculate
 * @param {Object} reqBody Request body containing { items: [...] }
 * @returns {{ status: number, body: Object }}
 */
export function handleCalculateCartApi(reqBody = {}) {
  try {
    const rawItems = reqBody.items || [];
    const calculation = calculateAuthoritativeCart(rawItems, reqBody.options);
    return {
      status: 200,
      body: {
        success: true,
        data: calculation
      }
    };
  } catch (err) {
    return {
      status: 400,
      body: {
        success: false,
        error: err.message || 'Cart calculation failed'
      }
    };
  }
}
