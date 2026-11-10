import React from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Tag,
  ShieldCheck,
  Info,
  PackageX,
  Receipt,
  RotateCcw
} from 'lucide-react';
import { calculateAuthoritativeCart } from '../server/authoritativePricing.js';

export default function BasketTracker({
  cartItems = [],
  onUpdateQuantity,
  onClearCart,
  selectedStore,
  onGoToScanner,
  linkedCardNumber = '231791'
}) {
  // Authoritative server-side calculations
  const authoritativePricing = calculateAuthoritativeCart(cartItems, {
    storeName: selectedStore?.name
  });

  const subtotal = authoritativePricing.subtotal;
  const totalItemCount = authoritativePricing.totalItemCount;
  const totalWholesaleSavings = authoritativePricing.totalWholesaleSavings;
  const pointsToEarn = authoritativePricing.pointsToEarn;

  const getItemUnitPrice = (item) => {
    const authItem = authoritativePricing.items.find((i) => i.barcode === item.product?.barcode);
    return authItem ? authItem.unitPrice : item.product?.price;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="cart-dashboard-view">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <ShoppingCart size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Running Basket Estimator</h3>
            <p className="text-xs text-slate-500">Live in-store total calculator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-mono" id="basket-item-count-chip">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
          </span>
          {cartItems.length > 0 && onClearCart && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-[11px] text-slate-400 hover:text-rose-600 font-medium transition-colors"
              title="Clear all items in basket"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Itemized List */}
      <div className="p-5">
        {cartItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400" id="empty-cart-state">
            <PackageX size={36} className="mx-auto mb-3 text-slate-300 opacity-60" />
            <h3 className="text-sm font-bold text-slate-700">Your Cart is Empty</h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Scan product barcodes or select weekly specials to calculate your running total
            </p>
            {onGoToScanner && (
              <button
                type="button"
                onClick={onGoToScanner}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
              >
                <span>Check Prices</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1" id="basket-items-list">
            {cartItems.map((item) => {
              const unitPrice = getItemUnitPrice(item);
              const lineTotal = unitPrice * item.quantity;
              const isWholesale = item.quantity >= 3 && item.product?.wholesaleCost != null;
              const emoji = item.product?.imageEmoji || '🛒';

              return (
                <div
                  key={item.product?.barcode}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all"
                  id={`basket-item-${item.product?.barcode}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50/70 border border-emerald-100/60 flex items-center justify-center text-lg flex-shrink-0">
                      {emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate" title={item.product?.name}>
                        {item.product?.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-500 font-medium">
                          ${unitPrice.toFixed(2)} JMD each
                        </span>
                        {isWholesale && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                            <Tag size={9} />
                            <span>⚡ Wholesale (3+)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right quantity stepper & line total */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product?.barcode, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                        aria-label={`Decrease quantity of ${item.product?.name}`}
                      >
                        {item.quantity === 1 ? <Trash2 size={12} className="text-rose-500" /> : <Minus size={12} />}
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800 font-mono">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product?.barcode, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white transition-colors"
                        aria-label={`Increase quantity of ${item.product?.name}`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right w-16">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        ${lineTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Financial Summary & Total */}
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
          {/* Wholesale Savings notification */}
          {totalWholesaleSavings > 0 && (
            <div
              className="flex items-center justify-between text-xs text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
              id="cart-wholesale-savings-banner"
            >
              <span className="flex items-center gap-1">
                <Tag size={13} />
                <span>Wholesale (3+) Savings</span>
              </span>
              <span className="font-bold">-${totalWholesaleSavings.toFixed(2)} JMD</span>
            </div>
          )}

          {/* Points to Earn */}
          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={14} className="text-yellow-500" />
              <span>Rewards Points to Earn</span>
            </span>
            <span className="font-bold text-emerald-700 font-mono" id="cart-points-to-earn-value">
              +{pointsToEarn.toLocaleString()} pts
            </span>
          </div>

          {/* Bold Estimated Total */}
          <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                Estimated Total
              </span>
              <p className="text-[10px] text-slate-400 font-medium">
                Authoritative in-store estimate
              </p>
            </div>
            <div className="text-right">
              <span
                id="estimated-total-amount"
                className="text-2xl font-black text-slate-900 tracking-tight"
              >
                ${subtotal.toFixed(2)}
              </span>
              <span id="cart-subtotal-value" className="sr-only">${subtotal.toFixed(2)} JMD</span>
              <span className="text-xs text-slate-500 ml-1 font-semibold">JMD</span>
            </div>
          </div>

          {/* Clear Microcopy */}
          <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 flex items-start gap-2">
            <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-normal font-medium" id="basket-discrepancy-microcopy">
              Final prices and promotional discounts are confirmed at the register.
            </p>
          </div>

          {/* Physical Cashier Handoff Section */}
          <div className="mt-4 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200" id="ready-for-cashier-section">
            <div className="flex items-start gap-3" id="ready-for-cashier-banner">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Receipt size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Ready for Cashier</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Take your grocery items to any cashier lane. Show your digital loyalty card (<strong>#{linkedCardNumber || '231791'}</strong>) at the register to claim your earned points.
                </p>
              </div>
            </div>
          </div>

          {/* Action Row: Clear Cart */}
          {cartItems.length > 0 && onClearCart && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                className="clear-cart-btn px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                onClick={onClearCart}
                id="clear-cart-btn"
              >
                <RotateCcw size={13} />
                <span>Clear Cart</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
