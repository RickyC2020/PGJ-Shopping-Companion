import React from 'react';
import { Sparkles, Tag, Plus, Check, ShoppingBag } from 'lucide-react';

export default function WeeklySpecials({
  products = [],
  onSelectProduct,
  onAddToCart,
  activeBarcode
}) {
  // Curate 4-6 featured weekly specials from available products
  const featuredSpecials = products.slice(0, 6).map((p, idx) => {
    const badges = [
      '🔥 Weekly Flyer Special',
      '⚡ 3+ Wholesale Tier',
      '🌟 Member Bonus Deal',
      '🏷️ Circular Feature'
    ];
    return {
      ...p,
      badge: badges[idx % badges.length],
      discountLabel: p.wholesaleCost
        ? `Wholesale $${p.wholesaleCost.toFixed(2)} ea (3+)`
        : 'In-Store Special Price'
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="weekly-specials-section">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/60 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Weekly In-Store Specials</h3>
            <p className="text-xs text-slate-500">Live circular specials & promotional price checks</p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          Circular Deals
        </span>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="weekly-specials-grid">
          {featuredSpecials.map((item) => {
            const isSelected = activeBarcode === item.barcode;
            return (
              <div
                key={item.barcode}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/30'
                    : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {item.badge}
                    </span>
                    <span className="text-xl">{item.imageEmoji || '🛒'}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1" title={item.name}>
                    Special: {item.brand} {item.unit || item.name.split(' ').slice(1, 3).join(' ')}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">SKU: {item.barcode}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      ${Number(item.price).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1">JMD</span>
                    <div className="text-[10px] text-emerald-700 font-medium">
                      {item.discountLabel}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectProduct && onSelectProduct(item.barcode)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Check price & live inventory"
                    >
                      Scan
                    </button>
                    {onAddToCart && (
                      <button
                        type="button"
                        onClick={() => onAddToCart(item, 1)}
                        className="p-1 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors cursor-pointer"
                        title="Add 1 to basket"
                        aria-label={`Add ${item.name} to basket`}
                      >
                        <Plus size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

