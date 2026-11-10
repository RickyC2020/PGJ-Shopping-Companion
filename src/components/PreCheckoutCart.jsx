import React from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Sparkles, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  Receipt, 
  RotateCcw,
  ShoppingBag,
  CreditCard,
  Gift,
  Tag,
  ChevronRight,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';

import { calculateAuthoritativeCart } from '../server/authoritativePricing.js';

export default function PreCheckoutCart({ 
  cartItems = [], 
  onUpdateQuantity, 
  onClearCart, 
  onGoToScanner,
  selectedStore,
  isCardLinked = false,
  linkedCardNumber = '231791',
  onOpenLinkCard
}) {
  // Defense #3: Authoritative Server-Side Pricing
  // Treats all client-submitted prices and totals as untrusted display data.
  // Totals, line item wholesale discounts, and loyalty points are strictly executed on the server.
  const authoritativePricing = calculateAuthoritativeCart(cartItems, { storeName: selectedStore?.name });
  const subtotal = authoritativePricing.subtotal;
  const totalItemCount = authoritativePricing.totalItemCount;
  const totalWholesaleSavings = authoritativePricing.totalWholesaleSavings;
  const pointsToEarn = authoritativePricing.pointsToEarn;

  const getItemUnitPrice = (item) => {
    const authItem = authoritativePricing.items.find(i => i.barcode === item.product?.barcode);
    return authItem ? authItem.unitPrice : item.product?.price;
  };

  return (
    <div className="cart-dashboard-container" id="cart-dashboard-view">
      
      {/* 1. Sleek Modern Cart Header */}
      <div className="cart-header-card">
        <div className="cart-header-meta">
          <div className="cart-title-pill">
            <ShoppingCart size={13} className="cart-pill-icon" />
            <span>Pre-Checkout Calculator</span>
          </div>

          <div className="cart-store-pill">
            <Store size={12} className="store-pill-icon" />
            <span className="store-pill-text">{selectedStore?.name || 'Progressive Foods'}</span>
          </div>

          <div className="cart-verified-pill" id="server-verified-pricing-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--green-700)', background: 'rgba(3, 124, 104, 0.08)', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
            <ShieldCheck size={11} />
            <span>Authoritative Pricing</span>
          </div>
        </div>

        <div className="cart-header-main">
          <div className="cart-header-title-group">
            <h2 className="cart-main-title">Shopping Cart</h2>
            <p className="cart-subtitle-text">Review your basket & loyalty earnings before heading to the register</p>
          </div>
          <span className="cart-item-count-badge" id="cart-total-badge">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* 2. Empty State */}
      {cartItems.length === 0 ? (
        <div className="empty-cart-card" id="empty-cart-state">
          <div className="empty-cart-icon">
            <ShoppingBag size={40} />
          </div>
          <h3>Your Cart is Empty</h3>
          <p>Scan grocery barcodes around the store to calculate your total and preview earned loyalty points before reaching the cashier.</p>
          <button 
            type="button"
            className="empty-cart-scan-btn"
            onClick={onGoToScanner}
            id="empty-cart-scan-btn"
          >
            <span>Start Scanning Products</span>
            <ArrowRight size={16} />
          </button>

          {/* Unlinked card reminder in empty cart */}
          {!isCardLinked && onOpenLinkCard && (
            <div className="cart-empty-loyalty-tip" id="cart-empty-unlinked-tip">
              <Sparkles size={15} className="tip-sparkle-icon" />
              <span>
                Have a loyalty card? <button type="button" className="inline-link-btn" onClick={onOpenLinkCard}>Link it here</button> or sign up at customer service to earn points.
              </span>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 3. Organized Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-section-label">
              <span>Items in Basket ({totalItemCount})</span>
            </div>

            <div className="cart-items-list" id="cart-items-list-container">
              {cartItems.map((item) => {
                const unitPrice = getItemUnitPrice(item);
                const itemTotal = unitPrice * item.quantity;
                const isWholesaleApplied = item.quantity >= 3 && item.product.wholesaleCost != null;
                const hasWholesaleOption = item.product.wholesaleCost != null && item.product.wholesaleCost < item.product.price;
                const emoji = item.product.imageEmoji || '🛒';

                return (
                  <div 
                    key={item.product.barcode} 
                    className={`cart-item-card ${isWholesaleApplied ? 'wholesale-active' : ''}`}
                    id={`cart-item-${item.product.barcode}`}
                  >
                    {/* Item Avatar */}
                    <div className="cart-item-avatar-box">
                      <span className="cart-item-emoji">{emoji}</span>
                      {isWholesaleApplied && (
                        <span className="cart-wholesale-mini-badge" title="Wholesale 3+ tier applied">
                          <Sparkles size={10} />
                        </span>
                      )}
                    </div>

                    {/* Item Middle Info */}
                    <div className="cart-item-info">
                      <div className="cart-item-name" title={item.product.name}>
                        {item.product.name}
                      </div>

                      <div className="cart-item-pricing-row">
                        <span className="cart-item-unit-price">
                          ${unitPrice.toFixed(2)} JMD each
                        </span>
                        
                        {isWholesaleApplied ? (
                          <span className="cart-wholesale-tag">
                            <Tag size={11} />
                            <span>⚡ Wholesale (3+)</span>
                          </span>
                        ) : hasWholesaleOption && item.quantity === 2 ? (
                          <span className="cart-wholesale-hint">
                            +1 for ${item.product.wholesaleCost.toFixed(2)} wholesale
                          </span>
                        ) : null}

                        <span className="cart-item-freshness-chip" id={`freshness-${item.product?.barcode}`}>
                          <Clock size={10} style={{ marginRight: '2px' }} />
                          Updated today
                        </span>
                      </div>
                    </div>

                    {/* Item Right Stepper & Total */}
                    <div className="cart-item-actions-col">
                      <div className="cart-item-total-price">
                        ${itemTotal.toFixed(2)}
                      </div>

                      <div className="cart-qty-pill">
                        <button 
                          type="button" 
                          className="cart-qty-btn minus"
                          onClick={() => onUpdateQuantity(item.product.barcode, -1)}
                          aria-label={`Decrease quantity of ${item.product.name}`}
                          id={`cart-minus-${item.product.barcode}`}
                          title={`Decrease quantity of ${item.product.name}`}
                        >
                          {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                        </button>

                        <span className="cart-qty-display" id={`cart-qty-${item.product.barcode}`}>
                          {item.quantity}
                        </span>

                        <button 
                          type="button" 
                          className="cart-qty-btn plus"
                          onClick={() => onUpdateQuantity(item.product.barcode, 1)}
                          aria-label={`Increase quantity of ${item.product.name}`}
                          id={`cart-plus-${item.product.barcode}`}
                          title={`Increase quantity of ${item.product.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Financial & Rewards Summary Card */}
          <div className="cart-summary-card" id="cart-summary-section">
            
            {/* Wholesale Savings Banner (if applicable) */}
            {totalWholesaleSavings > 0 && (
              <div className="cart-wholesale-savings-banner" id="cart-wholesale-savings-banner">
                <div className="wholesale-savings-banner-left">
                  <CheckCircle2 size={16} />
                  <span>Wholesale 3+ Savings</span>
                </div>
                <div className="wholesale-savings-banner-amount">
                  -${totalWholesaleSavings.toFixed(2)} JMD
                </div>
              </div>
            )}

            {/* Estimated Subtotal Row */}
            <div className="cart-summary-row subtotal-row">
              <span className="summary-label">Estimated Subtotal</span>
              <span className="summary-value" id="cart-subtotal-value">
                ${subtotal.toFixed(2)} JMD
              </span>
            </div>

            {/* In-Store Price Discrepancy Safeguard Notice */}
            <div className="cart-discrepancy-notice" id="cart-discrepancy-notice">
              <Info size={12} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>Estimated in-store total. Final prices and promotions are calculated at the cash register.</span>
            </div>

            <div className="cart-summary-divider" />

            {/* Total Points to Earn Box */}
            <div className="points-earned-indicator-box" id="cart-points-to-earn-box">
              <div className="points-indicator-left">
                <div className="points-coin-icon">
                  <Sparkles size={16} />
                </div>
                <div className="points-text-group">
                  <div className="points-indicator-title">Total Points to Earn</div>
                  <div className="points-indicator-formula">
                    Calculated at 1 point per $100 JMD of subtotal
                  </div>
                </div>
              </div>

              <div className="points-indicator-value" id="cart-points-to-earn-value">
                +{pointsToEarn.toLocaleString()} <small>pts</small>
              </div>
            </div>
          </div>

          {/* 5. LOYALTY CARD STATUS & OPTIONS SECTION
              If user did NOT link a loyalty card, present clear option to link card or sign up at customer service */}
          {!isCardLinked && (
            <div className="cart-loyalty-unlinked-card" id="cart-unlinked-loyalty-card">
              <div className="cart-loyalty-unlinked-header">
                <div className="cart-loyalty-tag">
                  <Gift size={13} />
                  <span>Claim +{pointsToEarn.toLocaleString()} Points on this Order</span>
                </div>
                <h4 className="cart-loyalty-unlinked-title">Earn Loyalty Rewards at Checkout</h4>
                <p className="cart-loyalty-unlinked-desc">
                  You haven't connected a Progressive Rewards card to this shopping session. Choose an option below to ensure you receive your points:
                </p>
              </div>

              <div className="cart-loyalty-options-grid">
                {/* Option 1: Link Existing Card */}
                <div className="cart-loyalty-option-box" id="cart-option-link-card">
                  <div className="cart-option-top-row">
                    <div className="cart-option-badge">
                      <CreditCard size={14} />
                      <span>Already a Member?</span>
                    </div>
                  </div>
                  <p className="cart-option-text">
                    Link your physical card (Card Number: <strong>231791</strong>) now to show your digital barcode at the register.
                  </p>
                  {onOpenLinkCard && (
                    <button
                      type="button"
                      className="cart-link-card-action-btn"
                      onClick={onOpenLinkCard}
                      id="cart-link-loyalty-btn"
                    >
                      <CreditCard size={15} />
                      <span>Link Your Card</span>
                    </button>
                  )}
                </div>

                {/* Option 2: Sign Up at Customer Service Section */}
                <div className="cart-loyalty-option-box customer-service-highlight" id="cart-option-customer-service">
                  <div className="cart-option-top-row">
                    <div className="cart-option-badge service-badge">
                      <Store size={14} />
                      <span>Need a Free Card?</span>
                    </div>
                  </div>
                  <h5 className="cart-service-headline">Sign Up at Customer Service</h5>
                  <p className="cart-option-text">
                    Visit the <strong>Customer Service section</strong> near the entrance at <strong>{selectedStore?.name || "our store"}</strong> before checking out. Registration is free and takes under 2 minutes!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. Physical Cashier Handoff Section */}
          <div className="physical-checkout-handoff-card" id="ready-for-cashier-section">
            <div className="handoff-banner" id="ready-for-cashier-banner">
              <div className="handoff-icon-wrapper">
                <Receipt size={22} className="handoff-receipt-icon" />
              </div>
              <div className="handoff-text-box">
                <div className="handoff-title">Ready for Cashier</div>
                <p className="handoff-description">
                  Take your grocery items to any cashier lane. Show your digital loyalty card (<strong>#{linkedCardNumber || '231791'}</strong>) at the register to claim your earned points.
                </p>
              </div>
            </div>
          </div>

          {/* 7. Action Row: Clear Cart */}
          <div className="cart-actions-row">
            <button 
              type="button" 
              className="clear-cart-btn"
              onClick={onClearCart}
              id="clear-cart-btn"
            >
              <RotateCcw size={14} />
              <span>Clear Cart</span>
            </button>
          </div>
        </>
      )}

    </div>
  );
}
