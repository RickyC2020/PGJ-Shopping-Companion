import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Utensils,
  ShoppingCart,
  Bookmark,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Lightbulb,
  Plus,
  Minus,
  ChefHat,
  Sparkles,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { RECIPE_IDEAS, STORES } from '../data/storeData';
import { generateMealIdea } from '../services/geminiService';

export default function ProductResultCard({
  product,
  allProducts = [],
  mode,
  selectedStore,
  onUpdateInventory,
  onAddToCart
}) {
  const [showRecipePreview, setShowRecipePreview] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [scanQuantity, setScanQuantity] = useState(1);

  // Reset quantity whenever the scanned item changes
  useEffect(() => {
    setScanQuantity(1);
  }, [product?.barcode]);

  const handleDecrementQuantity = () => {
    setScanQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleIncrementQuantity = () => {
    setScanQuantity((prev) => prev + 1);
  };

  // Gemini AI Meal Idea State
  const [mealIdea, setMealIdea] = useState(null);
  const [loadingMealIdea, setLoadingMealIdea] = useState(false);
  const [mealIdeaError, setMealIdeaError] = useState(null);

  // Trigger Gemini API call when in Customer Mode and a product is scanned or store changes
  useEffect(() => {
    if (mode !== 'customer' || !product) {
      setMealIdea(null);
      setLoadingMealIdea(false);
      setMealIdeaError(null);
      return;
    }

    let isCancelled = false;
    const currentBarcode = product.barcode;
    const storeName = selectedStore?.name || 'Progressive Foods Portmore';

    // Immediately clear previous product's meal idea and error so old product recipe is never displayed
    setMealIdea(null);
    setMealIdeaError(null);
    setLoadingMealIdea(true);

    generateMealIdea(product, storeName, allProducts)
      .then((data) => {
        if (!isCancelled && product.barcode === currentBarcode) {
          setMealIdea(data);
          setMealIdeaError(null);
          setLoadingMealIdea(false);
        }
      })
      .catch((err) => {
        if (!isCancelled && product.barcode === currentBarcode) {
          console.error("Gemini API Meal Idea Error:", err);
          setMealIdea(null);
          setMealIdeaError(err.message || "Unable to generate meal idea right now.");
          setLoadingMealIdea(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [product?.barcode, selectedStore?.name, mode, allProducts]);

  const handleRetryMealIdea = () => {
    if (!product) return;
    const currentBarcode = product.barcode;
    const storeName = selectedStore?.name || 'Progressive Foods Portmore';

    setMealIdea(null);
    setMealIdeaError(null);
    setLoadingMealIdea(true);

    generateMealIdea(product, storeName, allProducts)
      .then((data) => {
        if (product.barcode === currentBarcode) {
          setMealIdea(data);
          setMealIdeaError(null);
          setLoadingMealIdea(false);
        }
      })
      .catch((err) => {
        if (product.barcode === currentBarcode) {
          setMealIdea(null);
          setMealIdeaError(err.message || "Unable to generate meal idea right now.");
          setLoadingMealIdea(false);
        }
      });
  };

  if (!product) {
    return (
      <div className="not-found-card" id="product-not-found-view">
        <div className="not-found-icon">
          <AlertCircle size={28} />
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--slate-900)' }}>
          Barcode Not Found
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--slate-600)', marginTop: '4px' }}>
          No item matches this barcode in the Progressive Foods database. Please check the digits or select an item from the quick test shelf above.
        </p>
      </div>
    );
  }

  // Store-specific inventory calculation
  const storeName = selectedStore?.name || 'Progressive Foods Portmore';
  const currentStoreInventory = product.inventory ? (product.inventory[storeName] ?? 0) : 0;

  // Stock classification for employee mode
  let stockStatus = 'in-stock';
  let stockLabel = 'In Stock';
  if (currentStoreInventory === 0) {
    stockStatus = 'out-of-stock';
    stockLabel = 'Out of Stock';
  } else if (currentStoreInventory <= 10) {
    stockStatus = 'low-stock';
    stockLabel = 'Low Stock';
  }

  // Margin calculation for employee mode
  const profit = product.price - product.wholesaleCost;
  const marginPct = ((profit / product.price) * 100).toFixed(1);

  // Recipe idea from Jamaican catalogue
  const recipeData = RECIPE_IDEAS[product.barcode];

  const handleAddToCart = () => {
    if (onAddToCart && product) {
      onAddToCart(product, scanQuantity);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Wholesale calculations for Customer Mode (3+ units = wholesale price)
  const isWholesale = scanQuantity >= 3 && product?.wholesaleCost != null;
  const unitPrice = isWholesale ? product.wholesaleCost : product?.price;
  const lineTotal = unitPrice * scanQuantity;
  const savings = isWholesale ? (product.price - product.wholesaleCost) * scanQuantity : 0;

  return (
    <div className="product-result-container">
      <div className={`product-card ${mode === 'customer' ? 'customer-theme' : 'employee-theme'}`}>

        {/* Top Badges */}
        <div className="product-top-meta">
          <span className="category-pill">{product.category}</span>
          <span className="barcode-badge">UPC: {product.barcode}</span>
          <span className="price-freshness-pill" id="price-freshness-badge">
            <Clock size={11} /> Updated today
          </span>
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs" 
            id="catalog-verified-badge"
          >
            <Clock size={11} className="text-emerald-600" />
            <span>Catalog verified: Today, 8:00 AM</span>
          </span>
        </div>

        {/* Product Identity Header */}
        <div className="product-header-section">
          <div className="product-avatar" aria-hidden="true">
            {product.imageEmoji || '🥫'}
          </div>
          <div className="product-info-block">
            <span className="product-brand">{product.brand || 'Progressive Foods'}</span>
            <h2 className="product-name" id="scanned-product-name">{product.name}</h2>
            <div className="product-unit">{product.unit || 'Standard retail package'}</div>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            CUSTOMER MODE VIEW
            Requires: product name, price, and a blank placeholder card titled "Meal Idea"
           ------------------------------------------------------------------ */}
        {mode === 'customer' && (
          <div className="customer-view-content" id="customer-mode-view">
            {/* Price Box & Quantity Incrementer Row Side-by-Side to Save Vertical Space */}
            <div className="customer-price-qty-row">
              {/* Retail or Wholesale Price Card */}
              <div className={`customer-price-box ${isWholesale ? 'wholesale-active' : ''}`} id="customer-price-box">
                <div className="price-label">
                  {isWholesale ? (
                    <span className="wholesale-label-badge">⚡ Wholesale Price (3+)</span>
                  ) : (
                    'Retail Price'
                  )}
                </div>
                <div className="price-value-jmd" id="customer-product-price">
                  ${unitPrice.toFixed(2)} <span>JMD</span>
                </div>
                {isWholesale ? (
                  <div className="price-wholesale-savings" id="wholesale-savings-tag">
                    Save ${(product.price - product.wholesaleCost).toFixed(2)}/unit • ${savings.toFixed(2)} total!
                  </div>
                ) : (
                  <div className="price-tax-tag">Includes GCT</div>
                )}

                {/* In-Store Price Discrepancy Safeguard Microcopy */}
                <div className="in-store-discrepancy-notice flex items-start gap-1.5 text-left" id="price-discrepancy-notice">
                  <Info size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span id="register-policy-microcopy">
                    Estimated in-store total. Final prices and promotions are calculated at the cash register.
                  </span>
                  <span className="sr-only">Final pricing and promotional discounts are confirmed at the register.</span>
                </div>
              </div>

              {/* Quantity Incrementer Card Beside Price */}
              <div className="scan-quantity-card" id="scan-quantity-selector-card">
                <div className="scan-quantity-info">
                  <span className="scan-quantity-label">
                    Quantity {isWholesale && <span className="qty-wholesale-chip">Wholesale</span>}
                  </span>
                  <span className="scan-quantity-subtotal" id="scan-quantity-subtotal-display">
                    {scanQuantity === 1 ? '1 unit' : `${scanQuantity} units • $${lineTotal.toFixed(2)} JMD`}
                  </span>
                </div>
                <div className="scan-qty-stepper" role="group" aria-label="Product quantity selector">
                  <button
                    type="button"
                    className="scan-qty-btn scan-qty-minus"
                    onClick={handleDecrementQuantity}
                    disabled={scanQuantity <= 1}
                    id="scan-qty-minus-btn"
                    aria-label="Decrease quantity"
                    title="Decrease quantity"
                  >
                    <Minus size={14} strokeWidth={2.5} />
                  </button>
                  <span className="scan-qty-value" id="scan-qty-display" aria-live="polite">
                    {scanQuantity}
                  </span>
                  <button
                    type="button"
                    className="scan-qty-btn scan-qty-plus"
                    onClick={handleIncrementQuantity}
                    id="scan-qty-plus-btn"
                    aria-label="Increase quantity"
                    title="Increase quantity"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Wholesale Savings Alert or Incentive Teaser */}
            {isWholesale && (
              <div className="wholesale-deal-banner" id="wholesale-deal-banner">
                <Sparkles size={14} style={{ color: 'var(--green-700)', flexShrink: 0 }} />
                <span>
                  Wholesale price applied! You're saving <strong>${savings.toFixed(2)} JMD</strong> on {scanQuantity} units!
                </span>
              </div>
            )}

            {scanQuantity === 2 && product.wholesaleCost != null && (
              <div className="wholesale-deal-banner teaser" id="wholesale-deal-teaser">
                <span>💡 Add <strong>1 more</strong> to get the wholesale price (<strong>${product.wholesaleCost.toFixed(2)} JMD each</strong>, save ${(product.price - product.wholesaleCost).toFixed(2)}/unit)!</span>
              </div>
            )}

            {/* Prominent Add to Cart Action Button */}
            <div className="customer-action-bar p-5 pt-0">
              <button
                type="button"
                className="add-to-cart-btn prominent-cart-action-btn"
                onClick={handleAddToCart}
                id="add-to-cart-btn"
                aria-label={`Add ${product.name} to Cart`}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Added {scanQuantity > 1 ? `${scanQuantity} to Cart!` : 'to Cart!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>
                      {isWholesale
                        ? `Add ${scanQuantity} to Cart • $${lineTotal.toFixed(2)} JMD (Wholesale)`
                        : scanQuantity > 1
                          ? `Add ${scanQuantity} to Cart • $${lineTotal.toFixed(2)} JMD`
                          : 'Add to Cart'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* --------------------------------------------------------------
                "Meal Idea" placeholder card with Gemini API Structured Outputs
               -------------------------------------------------------------- */}
            <div className="meal-idea-placeholder-card" id="meal-idea-card">
              <div className="meal-idea-card-header">
                <div className="meal-idea-card-title">
                  <ChefHat size={18} style={{ color: 'var(--yellow-600)' }} />
                  <span>Meal Idea</span>
                </div>
                <span className="placeholder-pill-tag" id="meal-idea-tag">
                  {loadingMealIdea ? 'AI Thinking...' : mealIdea ? 'Gemini AI Recipe' : 'Placeholder Card'}
                </span>
              </div>

              {/* Loading State */}
              {loadingMealIdea && (
                <div className="meal-idea-loading-state" id="meal-idea-loading">
                  <Loader2 size={24} className="gemini-spin-loader" />
                  <div className="loading-headline">
                    Cooking up a Jamaican recipe with Gemini AI...
                  </div>
                  <div className="loading-subline">
                    Selecting ingredients in-stock at {storeName}
                  </div>
                </div>
              )}

              {/* Error State */}
              {!loadingMealIdea && mealIdeaError && (
                <div className="meal-idea-error-state" id="meal-idea-error">
                  <AlertTriangle size={18} style={{ color: 'var(--danger-500)' }} />
                  <div style={{ fontSize: '12px', color: 'var(--slate-700)' }}>
                    Unable to generate meal idea right now.
                  </div>
                  <button
                    type="button"
                    className="toggle-recipe-hint-btn"
                    onClick={handleRetryMealIdea}
                  >
                    <RefreshCw size={12} />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              {/* Success / Loaded Gemini Recipe State */}
              {!loadingMealIdea && mealIdea && (
                <div className="gemini-meal-idea-container" id="gemini-meal-idea-container">
                  <div className="gemini-recipe-top">
                    <Sparkles size={16} style={{ color: 'var(--yellow-600)', flexShrink: 0 }} />
                    <h3 className="meal-idea-recipe-name" id="meal-idea-recipe-name">
                      {mealIdea.recipe_name}
                    </h3>
                  </div>

                  <div className="gemini-ingredients-section">
                    <div className="gemini-ingredients-header">
                      <span>Ingredients or Bundle Item (In-Stock at {selectedStore?.shortName || 'Store'}):</span>
                    </div>
                    <ul className="meal-idea-ingredients-list" id="meal-idea-ingredients-list">
                      {mealIdea.ingredients && mealIdea.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="meal-idea-ingredient-item">
                          <span className="ingredient-bullet-point">✦</span>
                          <span className="ingredient-text">{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="gemini-ai-footer-note">
                    <span className="jamaica-dot"></span>
                    <span>Curated for Progressive Foods with Gemini 3.8 Flash</span>
                  </div>
                </div>
              )}

              {/* Fallback Blank Placeholder Body (when no mealIdea yet and not loading) */}
              {!loadingMealIdea && !mealIdea && !mealIdeaError && (
                <div className="meal-idea-empty-state">
                  <div className="meal-idea-empty-icon">
                    <Utensils size={20} />
                  </div>
                  <div className="meal-idea-empty-text">
                    [ Blank Placeholder ]
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--slate-500)', marginTop: '4px' }}>
                    Scan a product in Customer Mode to generate an authentic Jamaican meal idea.
                  </div>

                  {recipeData && (
                    <button
                      type="button"
                      className="toggle-recipe-hint-btn"
                      onClick={() => setShowRecipePreview(!showRecipePreview)}
                      id="toggle-recipe-preview-btn"
                    >
                      <Lightbulb size={13} />
                      <span>{showRecipePreview ? 'Hide Sample Recipe' : 'Preview Sample Recipe Idea'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Collapsible Sample Jamaican Recipe Preview */}
              {showRecipePreview && recipeData && !mealIdea && (
                <div className="revealed-recipe-box" id="revealed-recipe-content">
                  <div className="revealed-dish-name">{recipeData.dish}</div>
                  <div className="revealed-recipe-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={11} /> {recipeData.time}
                    </span>
                    <span>•</span>
                    <span>{recipeData.difficulty}</span>
                  </div>
                  <p className="revealed-instructions">
                    {recipeData.instructions}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            EMPLOYEE MODE VIEW
            Requires: product name, wholesale cost, and specific inventory level for currently selected store
           ------------------------------------------------------------------ */}
        {mode === 'employee' && (
          <div className="employee-view-content" id="employee-mode-view">
            <div className="employee-badge-header">
              <ShieldCheck size={14} />
              <span>Staff Internal Access • Restricted View</span>
            </div>

            {/* Wholesale Cost & Retail Margin Matrix */}
            <div className="employee-metrics-grid">
              <div className="employee-metric-card highlight-wholesale">
                <div className="metric-label">Wholesale Cost</div>
                <div className="metric-value-large wholesale-color" id="employee-wholesale-cost">
                  ${product.wholesaleCost.toFixed(2)}
                </div>
                <div className="metric-subtext">Base supplier cost (JMD)</div>
              </div>

              <div className="employee-metric-card">
                <div className="metric-label">Retail & Margin</div>
                <div className="metric-value-large" style={{ color: 'var(--green-700)' }}>
                  {marginPct}%
                </div>
                <div className="metric-subtext">Retail: ${product.price.toFixed(2)} JMD</div>
              </div>
            </div>

            {/* Specific Inventory Level for Currently Selected Store */}
            <div className="employee-store-inventory-box" id="employee-inventory-box">
              <div className="inventory-header-row">
                <div className="inventory-store-title">
                  <Building2 size={16} style={{ color: 'var(--green-700)' }} />
                  <span id="selected-store-inventory-label">{storeName}</span>
                </div>
                <span className={`stock-pill ${stockStatus}`} id="stock-status-badge">
                  {stockLabel}
                </span>
              </div>

              <div className="inventory-count-display">
                <span className="count-number" id="store-inventory-count">{currentStoreInventory}</span>
                <span className="count-units">units in stock at this branch</span>
              </div>

              {/* Visual Stock Level Progress Bar */}
              <div className="inventory-progress-track">
                <div
                  className={`inventory-progress-fill ${stockStatus}`}
                  style={{ width: `${Math.min(100, Math.max(5, (currentStoreInventory / 100) * 100))}%` }}
                ></div>
              </div>

              {/* Stock Quick Adjustment (Staff terminal simulation) */}
              <div className="employee-adjust-row">
                <span className="adjust-label">Quick Adjust Stock:</span>
                <div className="adjust-controls">
                  <button
                    type="button"
                    className="adjust-btn"
                    onClick={() => onUpdateInventory(product.barcode, storeName, Math.max(0, currentStoreInventory - 1))}
                    title="Deduct 1 unit (damaged/sold)"
                    disabled={currentStoreInventory <= 0}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '13px', minWidth: '24px', textAlign: 'center' }}>
                    {currentStoreInventory}
                  </span>
                  <button
                    type="button"
                    className="adjust-btn"
                    onClick={() => onUpdateInventory(product.barcode, storeName, currentStoreInventory + 1)}
                    title="Add 1 unit received"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* All-Stores Inventory Breakdown Matrix */}
            <div className="all-stores-matrix">
              <div className="matrix-title">
                <span>Branch Inventory Comparison:</span>
                <span style={{ fontSize: '10.5px', color: 'var(--slate-500)', fontWeight: 600 }}>5 Branches</span>
              </div>

              {STORES.map((st) => {
                const isSelected = st.name === storeName;
                const qty = product.inventory ? (product.inventory[st.name] ?? 0) : 0;
                let statusColor = 'var(--green-600)';
                if (qty === 0) statusColor = 'var(--danger-500)';
                else if (qty <= 10) statusColor = 'var(--yellow-600)';

                return (
                  <div
                    key={st.id}
                    className={`store-row-item ${isSelected ? 'current-selected-row' : ''}`}
                  >
                    <span className="store-row-name">
                      {isSelected && <CheckCircle2 size={12} style={{ color: 'var(--yellow-700)' }} />}
                      {st.shortName}
                    </span>
                    <span className="store-row-qty" style={{ color: statusColor }}>
                      {qty} units {qty === 0 ? '(Out)' : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
