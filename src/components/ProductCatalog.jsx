import React, { useState } from 'react';
import { Search, Filter, ShoppingBag, Eye, CheckCircle2 } from 'lucide-react';

export default function ProductCatalog({ 
  products, 
  selectedStore, 
  mode, 
  onSelectProduct, 
  activeBarcode 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.barcode.includes(searchTerm) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const storeName = selectedStore?.name || 'Progressive Foods Portmore';

  return (
    <div className="catalog-section">
      <div className="catalog-header">
        <div className="catalog-title">Jamaican Grocery Catalog</div>
        <span style={{ fontSize: '11px', color: 'var(--slate-500)', fontWeight: 600 }}>
          {filteredProducts.length} items
        </span>
      </div>

      {/* Category filter pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            className="category-pill"
            style={{
              background: selectedCategory === cat ? 'var(--green-700)' : 'var(--slate-100)',
              color: selectedCategory === cat ? '#fff' : 'var(--slate-700)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="catalog-grid">
        {filteredProducts.map(product => {
          const qty = product.inventory ? (product.inventory[storeName] ?? 0) : 0;
          const isSelected = activeBarcode === product.barcode;

          return (
            <div
              key={product.barcode}
              className={`catalog-item-card ${isSelected ? 'selected-item' : ''}`}
              onClick={() => onSelectProduct(product.barcode)}
              title="Click to view details in active mode"
            >
              <div className="catalog-item-icon">
                {product.imageEmoji}
              </div>

              <div className="catalog-item-details">
                <div className="catalog-item-name">{product.name}</div>
                <div className="catalog-item-meta">
                  UPC: {product.barcode}
                </div>
              </div>

              <div className="catalog-item-right">
                {mode === 'customer' ? (
                  <>
                    <div className="catalog-item-price">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="catalog-item-stock" style={{ color: qty > 0 ? 'var(--green-700)' : 'var(--danger-500)' }}>
                      {qty > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="catalog-item-price" style={{ color: 'var(--yellow-800)' }}>
                      Cost: ${product.wholesaleCost.toFixed(2)}
                    </div>
                    <div className="catalog-item-stock" style={{ color: qty > 0 ? 'var(--slate-700)' : 'var(--danger-500)' }}>
                      Stock: {qty} units
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
