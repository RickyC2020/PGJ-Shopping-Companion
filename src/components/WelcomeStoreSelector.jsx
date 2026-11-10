import React from 'react';
import logoImg from '../assets/logo.png';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { STORES, STORE_NAMES } from '../data/storeData';

export default function WelcomeStoreSelector({
  selectedStore,
  onSelectStore,
  onConfirmSelection,
  isDismissible = false
}) {
  const currentStoreInfo = STORES.find(s => s.name === selectedStore?.name) || STORES[0];

  const handleDropdownChange = (e) => {
    const storeObj = STORES.find(s => s.name === e.target.value);
    if (storeObj) {
      onSelectStore(storeObj);
    }
  };

  return (
    <div className="welcome-card" id="welcome-screen-card">
      <div className="welcome-hero">

        <p>Please select your local supermarket branch to check real-time pricing and store inventory.</p>
      </div>

      <div className="store-dropdown-group">
        <label htmlFor="store-select-dropdown" className="store-dropdown-label">
          <Store size={15} style={{ color: 'var(--green-700)' }} />
          Select Store
        </label>

        <div className="select-store-input-wrapper">
          <select
            id="store-select-dropdown"
            className="select-store-dropdown"
            value={selectedStore?.name || ''}
            onChange={handleDropdownChange}
            aria-label="Select Store"
          >
            <option value="" disabled>-- Select Store --</option>
            {STORE_NAMES.map((storeName) => (
              <option key={storeName} value={storeName}>
                {storeName}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="dropdown-arrow-icon" />
        </div>
      </div>

      {/* Selected Branch Highlight Info */}
      {currentStoreInfo && (
        <div className="current-store-card">
          <div className="store-pin-circle">
            <MapPin size={17} />
          </div>
          <div className="current-store-details">
            <div className="current-store-name">{currentStoreInfo.name}</div>
            <div className="current-store-meta">
              <span>{currentStoreInfo.address}</span>
            </div>
            <div className="current-store-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <Clock size={12} style={{ color: 'var(--green-700)' }} />
              <span>{currentStoreInfo.hours}</span>
            </div>
            <div className="current-store-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Phone size={12} style={{ color: 'var(--green-700)' }} />
              <span>{currentStoreInfo.phone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Button */}
      <button
        type="button"
        className="scan-submit-btn"
        style={{ width: '100%', marginTop: '16px', padding: '13px' }}
        onClick={onConfirmSelection}
        id="confirm-store-btn"
      >
        <span>{isDismissible ? 'Save & Return to App' : 'Enter Progressive Foods'}</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
