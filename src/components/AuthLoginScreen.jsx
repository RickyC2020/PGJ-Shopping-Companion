import React, { useState } from 'react';
import logoImg from '../assets/logo-transparent.png';
import {
  ShoppingBag,
  ShieldCheck,
  Store,
  MapPin,
  ChevronDown,
  Sparkles,
  KeyRound,
  ArrowRight,
  Lock,
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { STORES, STORE_NAMES } from '../data/storeData';

export default function AuthLoginScreen({
  selectedStore,
  onSelectStore,
  onContinueAsShopper,
  onStaffLogin
}) {
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [storeError, setStoreError] = useState('');

  const currentStoreInfo = STORES.find(s => s.name === selectedStore?.name);

  const handleDropdownChange = (e) => {
    const storeObj = STORES.find(s => s.name === e.target.value);
    if (storeObj) {
      onSelectStore(storeObj);
      setStoreError('');
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    let hasError = false;

    if (!selectedStore && onSelectStore) {
      onSelectStore(STORES[0]);
    }
    setStoreError('');

    if (pin.trim() !== '1234') {
      setPinError('Invalid staff PIN. Please enter 1234.');
      hasError = true;
    } else {
      setPinError('');
    }

    if (!hasError) {
      onStaffLogin();
    }
  };

  return (
    <div className="auth-login-container" id="auth-welcome-login-view">

      {/* Brand Hero Header */}
      <div className="auth-brand-hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '0 auto', paddingBottom: '52px' }}>
        <h1 className="sr-only">Progressive Foods</h1>
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={logoImg}
            alt="Progressive Foods Logo"
            style={{ width: '100%', height: 'auto', border: 'none', background: 'transparent', display: 'block', marginBottom: '8px', mixBlendMode: 'multiply' }}
          />
          <svg
            viewBox="0 0 400 28"
            style={{ width: '100%', height: 'auto', display: 'block' }}
            aria-label="Be Jamaican, Buy Jamaican"
          >
            <text
              x="15"
              y="20"
              textLength="370"
              lengthAdjust="spacing"
              fill="var(--green-950)"
              fontFamily="var(--font-display), 'Outfit', 'Plus Jakarta Sans', sans-serif"
              fontSize="19"
              fontWeight="400"
              letterSpacing="1"
            >
              SHOPPING ASSISTANT
            </text>
          </svg>
        </div>
      </div>

      {/* Main Authentication Choices */}
      {!showPinInput ? (
        <div className="auth-options-group" id="login-options-section" style={{ width: '100%', maxWidth: '400px', margin: '0 auto', boxSizing: 'border-box' }}>

          {/* 1. Continue as Shopper */}
          <button
            type="button"
            className="shopper-primary-btn"
            onClick={onContinueAsShopper}
            id="continue-shopper-btn"
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <div className="btn-icon-circle shopper-icon-bg">
              <ShoppingBag size={20} color="#ffffff" />
            </div>
            <div className="btn-text-content">
              <span className="btn-title">Continue as Shopper</span>
              <span className="btn-subtitle">Price Checks, Bundle Ideas, Cart Total, Track your Rewards</span>
            </div>
            <ChevronRight size={22} className="btn-arrow" />
          </button>

          {/* 2. Staff Portal Login */}
          <button
            type="button"
            className="staff-portal-btn"
            onClick={() => {
              setShowPinInput(true);
              setPinError('');
              setStoreError('');
            }}
            id="staff-portal-btn"
            style={{ width: '100%', boxSizing: 'border-box' }}
          >
            <div className="btn-icon-circle staff-icon-bg">
              <ShieldCheck size={20} />
            </div>
            <div className="btn-text-content">
              <span className="btn-title">Staff Portal Login</span>
              <span className="btn-subtitle">Authorized employee access & inventory management</span>
            </div>
            <Lock size={20} className="btn-arrow" />
          </button>

        </div>
      ) : (
        /* Employee Mock PIN Input Field */
        <div className="staff-pin-box" id="staff-pin-section">
          <div className="pin-header-row">
            <div className="pin-badge">
              <KeyRound size={14} style={{ color: 'var(--yellow-700)' }} />
              <span>Staff Authorization</span>
            </div>
          </div>

          <h3 className="pin-title">Enter Employee PIN</h3>
          <p className="pin-subtitle">
            Select your assigned store location and enter your 4-digit staff passcode to unlock internal wholesale pricing & inventory controls (Demo PIN: <strong>1234</strong>).
          </p>

          <form onSubmit={handlePinSubmit} className="pin-form">
            {/* Mandatory Store Selection for Staff */}
            <div className="select-store-input-wrapper">
              <Store size={22} className="dropdown-store-icon" />
              <select
                id="staff-store-select-dropdown"
                className={`select-store-dropdown has-store-icon ${!selectedStore?.name ? 'is-placeholder' : ''} ${storeError ? 'field-error-border' : ''}`}
                value={selectedStore?.name || ''}
                onChange={(e) => {
                  handleDropdownChange(e);
                  setStoreError('');
                }}
                aria-label="Which store do you work?"
              >
                <option value="" disabled>
                  Which store do you work?
                </option>
                {STORE_NAMES.map((storeName) => (
                  <option key={storeName} value={storeName}>
                    {storeName}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="dropdown-arrow-icon" />
            </div>

            {storeError && (
              <div className="pin-error-message" id="staff-store-error">
                <AlertCircle size={14} />
                <span>{storeError}</span>
              </div>
            )}

            {currentStoreInfo && (
              <div className="auth-store-pill">
                <MapPin size={16} style={{ color: 'var(--yellow-700)' }} />
                <span>{currentStoreInfo.address}</span>
              </div>
            )}

            <div className="pin-input-wrapper">
              <Lock size={18} className="pin-input-icon" />
              <input
                id="staff-pin-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                placeholder="Enter PIN (1234)"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError('');
                }}
                className={`pin-text-field ${pinError ? 'pin-error-border' : ''}`}
                autoFocus
              />
            </div>

            {pinError && (
              <div className="pin-error-message" id="staff-pin-error">
                <AlertCircle size={14} />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="scan-submit-btn staff-submit-btn"
              id="submit-staff-pin-btn"
            >
              <span>Unlock Staff Portal</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Navigation: Back (bottom left) */}
          <div className="staff-footer-nav">
            <button
              type="button"
              className="pin-cancel-btn"
              onClick={() => {
                setShowPinInput(false);
                setPin('');
                setPinError('');
                setStoreError('');
              }}
              id="cancel-pin-btn"
            >
              <ChevronLeft size={22} />
              <span>Back</span>
            </button>
          </div>
        </div>
      )}



    </div>
  );
}
