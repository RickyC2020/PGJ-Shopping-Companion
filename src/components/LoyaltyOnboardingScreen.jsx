import React, { useState } from 'react';
import logoImg from '../assets/logo.png';
import {
  CreditCard,
  Camera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  Scan,
  ShieldCheck,
  Gift,
  Store,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { STORES, STORE_NAMES } from '../data/storeData';
import PrivacyTermsModal from './PrivacyTermsModal';

export default function LoyaltyOnboardingScreen({
  selectedStore,
  onSelectStore,
  onLinkSuccess,
  onSkip,
  onBack
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [storeError, setStoreError] = useState('');
  const [successState, setSuccessState] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const currentStoreInfo = STORES.find(s => s.name === selectedStore?.name);

  const handleStoreChange = (e) => {
    const storeObj = STORES.find(s => s.name === e.target.value);
    if (storeObj) {
      onSelectStore(storeObj);
      setStoreError('');
    }
  };

  const validateStore = () => {
    if (!selectedStore) {
      setStoreError('Please select which store you are shopping at.');
      return false;
    }
    setStoreError('');
    return true;
  };

  const handleVerify = (numberToVerify) => {
    if (!selectedStore && onSelectStore) {
      onSelectStore(STORES[0]);
    }
    const trimmed = (numberToVerify || cardNumber).trim();
    if (trimmed === '231791') {
      setErrorMessage('');
      setSuccessState(true);
      setTimeout(() => {
        onLinkSuccess('231791');
      }, 1200);
    } else {
      setErrorMessage('Card not found. Please try again.');
    }
  };

  const handleSimulateCameraScan = () => {
    setShowCameraModal(false);
    handleVerify('231791');
  };

  const handleSkip = () => {
    if (!selectedStore && onSelectStore) {
      onSelectStore(STORES[0]);
    }
    onSkip();
  };

  return (
    <div className="loyalty-onboarding-container" id="loyalty-onboarding-screen">

      {/* Onboarding Card */}
      <div className="loyalty-onboarding-card">


        <img src={logoImg} alt="Progressive Foods Logo" className="onboarding-hero-logo" />

        {/* Header Icon & Tag */}
        <div className="onboarding-top-badge">
          <Gift size={20} style={{ color: 'var(--yellow-600)' }} />
          <span>Rewards Program</span>
        </div>

        <h2 className="onboarding-title" id="loyalty-onboarding-title">Link Your Loyalty Card</h2>

        {/* Welcoming Message */}
        <p className="onboarding-welcome-msg">
          Are you an existing loyalty member? Link your physical card to unlock digital tracking. Eearn 1 point per $100 spent on every shopping trip!
        </p>

        {/* Mandatory Store Selection */}
        <div className="onboarding-store-wrapper" id="shopper-store-selector-box">
          <label htmlFor="shopper-store-select-dropdown" className="sr-only">
            Which store are you shopping at?
          </label>

          <div className="select-store-input-wrapper">
            <Store size={22} className="dropdown-store-icon" />
            <select
              id="shopper-store-select-dropdown"
              className={`select-store-dropdown has-store-icon ${!selectedStore?.name ? 'is-placeholder' : ''} ${storeError ? 'field-error-border' : ''}`}
              value={selectedStore?.name || ''}
              onChange={handleStoreChange}
              aria-label="Which store are you shopping at?"
            >
              <option value="" disabled>
                Which store are you shopping at?
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
            <div className="card-error-text" style={{ marginTop: '4px' }} id="shopper-store-error">
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
        </div>

        {/* Success State Notification */}
        {successState ? (
          <div className="linking-success-banner" id="card-linked-success-state">
            <CheckCircle2 size={32} className="success-icon-pulse" />
            <div className="success-banner-content">
              <h3>Card Successfully Linked!</h3>
              <p>Card #<strong>231791</strong> is connected with 25,000 points. Loading your dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Primary Action: Scan Card Barcode */}
            <div className="onboarding-scan-section">
              <button
                type="button"
                className="scan-card-barcode-btn"
                onClick={() => {
                  if (!selectedStore && onSelectStore) {
                    onSelectStore(STORES[0]);
                  }
                  setErrorMessage('');
                  setShowCameraModal(true);
                }}
                id="scan-card-barcode-btn"
              >
                <Camera size={20} />
                <span>Scan Card Barcode</span>
              </button>
            </div>

            {/* Divider */}
            <div className="onboarding-divider-row">
              <span className="divider-line"></span>
              <span className="divider-text">OR ENTER DIGITS</span>
              <span className="divider-line"></span>
            </div>

            {/* Secondary Option: Manual Card Number Input */}
            <div className="onboarding-manual-form">
              <label htmlFor="manual-card-input" className="manual-card-label">
                <CreditCard size={15} style={{ color: 'var(--green-700)' }} />
                <span>Enter Card Number Manually</span>
              </label>

              <div className="manual-input-action-row">
                <input
                  id="manual-card-input"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 231791"
                  value={cardNumber}
                  onChange={(e) => {
                    setCardNumber(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className={`manual-card-field ${errorMessage ? 'field-error-border' : ''}`}
                />

                <button
                  type="button"
                  className="verify-card-btn"
                  onClick={() => handleVerify(cardNumber)}
                  id="verify-card-btn"
                >
                  Verify
                </button>
              </div>

              {/* Red Error Message */}
              {errorMessage && (
                <div className="card-error-text" id="card-error-text">
                  <AlertCircle size={14} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Helper Hint */}
            <div className="onboarding-hint-box">
              <Sparkles size={13} style={{ color: 'var(--yellow-600)', flexShrink: 0 }} />
              <span>Demo Card: Enter <strong>231791</strong> or use camera scan to test your 25,000 pts balance.</span>
            </div>

            {/* Footer Navigation: Back (bottom left) & Skip (far right) */}
            <div className="onboarding-nav-footer">
              {onBack ? (
                <button
                  type="button"
                  className="onboarding-back-btn"
                  onClick={onBack}
                  id="back-to-login-btn"
                >
                  <ChevronLeft size={22} />
                  <span>Back</span>
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                className="skip-loyalty-link"
                onClick={handleSkip}
                id="skip-loyalty-btn"
              >
                <span>Skip for Now</span>
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Privacy & Data Consent (JDPA Notice) */}
            <div className="flex justify-center items-center pt-3 pb-1">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                id="onboarding-privacy-btn"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
              >
                <ShieldCheck size={13} className="text-emerald-700" />
                <span>Privacy Notice & Data Consent (JDPA)</span>
              </button>
            </div>
          </>
        )}

      </div>

      {/* Dummy Camera Modal */}
      {showCameraModal && (
        <div className="camera-modal-backdrop" id="dummy-camera-modal">
          <div className="camera-modal-sheet">

            <div className="camera-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} style={{ color: 'var(--green-700)' }} />
                <h4>Scan Physical Loyalty Card</h4>
              </div>
              <button
                type="button"
                className="camera-close-btn"
                onClick={() => setShowCameraModal(false)}
                id="close-camera-modal-btn"
                aria-label="Close Camera"
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewfinder UI */}
            <div className="camera-viewfinder-box">
              <div className="viewfinder-frame">
                <div className="viewfinder-corner corner-tl"></div>
                <div className="viewfinder-corner corner-tr"></div>
                <div className="viewfinder-corner corner-bl"></div>
                <div className="viewfinder-corner corner-br"></div>
                <div className="viewfinder-laser-line"></div>
              </div>
              <p className="viewfinder-instruction">
                Align the barcode on the back of your Progressive card within the frame
              </p>
            </div>

            {/* Simulated Action */}
            <div className="camera-modal-actions">
              <button
                type="button"
                className="scan-submit-btn"
                onClick={handleSimulateCameraScan}
                id="simulate-camera-scan-btn"
                style={{ width: '100%', padding: '12px' }}
              >
                <Scan size={16} />
                <span>Simulate Scan (Card #231791)</span>
              </button>

              <button
                type="button"
                className="cancel-camera-btn"
                onClick={() => setShowCameraModal(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightweight Privacy & Data Consent Modal (JDPA Compliant) */}
      <PrivacyTermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

    </div>
  );
}
