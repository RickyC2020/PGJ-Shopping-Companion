import React, { useState } from 'react';
import { 
  Barcode, 
  Search, 
  Camera, 
  X, 
  Volume2, 
  VolumeX, 
  Zap, 
  Maximize2,
  ShieldAlert 
} from 'lucide-react';
import { playScannerBeep } from '../utils/audio';
import { sanitizeBarcodeInput } from '../utils/barcodeValidator';

export default function BarcodeScanner({ 
  barcodeInput, 
  setBarcodeInput, 
  onScan, 
  products, 
  mode 
}) {
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [validationError, setValidationError] = useState(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!barcodeInput || !barcodeInput.trim()) return;
    
    // Defense #5: Barcode Input Sanitization & Pattern Validation
    const validation = sanitizeBarcodeInput(barcodeInput);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);
    if (soundEnabled) {
      playScannerBeep();
    }
    onScan(validation.sanitized);
  };

  const handleQuickSelect = (barcode) => {
    const validation = sanitizeBarcodeInput(barcode);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);
    setBarcodeInput(validation.sanitized);
    if (soundEnabled) {
      playScannerBeep();
    }
    onScan(validation.sanitized);
    if (showCameraModal) {
      setShowCameraModal(false);
    }
  };

  const handleClear = () => {
    setBarcodeInput('');
    setValidationError(null);
  };

  return (
    <div className="scanner-card">
      <div className="scanner-header">
        <div className="scanner-title">
          <Barcode size={20} style={{ color: 'var(--green-700)' }} />
          <span>Barcode Scanner</span>
        </div>
        
        <button 
          type="button" 
          className="scanner-sound-toggle"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Scanner Beep On' : 'Scanner Beep Muted'}
        >
          {soundEnabled ? <Volume2 size={13} style={{ color: 'var(--green-700)' }} /> : <VolumeX size={13} />}
          <span>{soundEnabled ? 'Beep On' : 'Muted'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="barcode-input-container">
        <div className="barcode-input-wrapper">
          <Barcode size={20} className="barcode-prefix-icon" />
          <input
            type="text"
            id="barcode-input-field"
            className="barcode-input-field"
            placeholder="Type barcode (e.g. 055270961124)..."
            value={barcodeInput}
            onChange={(e) => {
              setBarcodeInput(e.target.value);
              if (validationError) setValidationError(null);
            }}
            aria-label="Simulated Barcode Scanner Input"
            autoComplete="off"
          />
          {barcodeInput && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={handleClear}
              title="Clear barcode"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Barcode Input Sanitization Security Alert */}
        {validationError && (
          <div 
            className="barcode-validation-error-alert" 
            id="barcode-validation-error-alert" 
            role="alert"
            style={{
              color: '#b91c1c',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ShieldAlert size={15} style={{ flexShrink: 0 }} />
            <span>{validationError}</span>
          </div>
        )}

        <div className="scanner-action-row">
          <button 
            type="submit" 
            className="scan-submit-btn"
            id="scan-barcode-submit-btn"
          >
            <Search size={16} />
            <span>Scan Code</span>
          </button>

          <button 
            type="button" 
            className="camera-scan-btn"
            onClick={() => setShowCameraModal(true)}
            id="open-camera-scanner-btn"
          >
            <Camera size={16} />
            <span>Simulate Camera</span>
          </button>
        </div>
      </form>

      {/* Quick Test Shelf with All Jamaican Mock Products */}
      <div className="quick-shelf-section">
        <div className="quick-shelf-label">
          <span>Quick Test Jamaican Products (Tap to Scan):</span>
          <span style={{ fontSize: '10px', color: 'var(--green-700)' }}>9 Products</span>
        </div>
        
        <div className="quick-chips-grid">
          {products.map((p) => {
            const isCurrent = barcodeInput === p.barcode;
            return (
              <button
                key={p.barcode}
                type="button"
                className={`barcode-chip-btn ${isCurrent ? 'active-chip' : ''}`}
                onClick={() => handleQuickSelect(p.barcode)}
                title={`Scan ${p.name} (${p.barcode})`}
              >
                <span>{p.imageEmoji}</span>
                <span>{p.name.split(' ')[0]} {p.name.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Camera Viewfinder Modal */}
      {showCameraModal && (
        <div className="viewfinder-modal" onClick={() => setShowCameraModal(false)}>
          <div className="viewfinder-container" onClick={(e) => e.stopPropagation()}>
            <div className="viewfinder-topbar">
              <div className="viewfinder-title">
                <Camera size={16} style={{ color: 'var(--yellow-400)' }} />
                <span>Simulated Camera Viewfinder</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCameraModal(false)}
                style={{ color: '#fff', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="viewfinder-screen">
              {/* Corner reticles */}
              <div className="scan-target-box">
                <div className="corner corner-tl"></div>
                <div className="corner corner-tr"></div>
                <div className="corner corner-bl"></div>
                <div className="corner corner-br"></div>
                
                {/* Red Laser Scanner line */}
                <div className="laser-beam"></div>
              </div>

              <div className="viewfinder-hint">
                <Zap size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                Align barcode within target box
              </div>
            </div>

            <div className="viewfinder-actions">
              <div className="quick-scan-prompt">
                Tap any product below to simulate immediate camera optical detection:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {products.slice(0, 6).map((p) => (
                  <button
                    key={p.barcode}
                    type="button"
                    className="barcode-chip-btn"
                    style={{ fontSize: '10.5px', justifyContent: 'center' }}
                    onClick={() => handleQuickSelect(p.barcode)}
                  >
                    <span>{p.imageEmoji}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name.slice(0, 16)}...
                    </span>
                  </button>
                ))}
              </div>

              <button 
                type="button" 
                className="viewfinder-close-btn"
                onClick={() => setShowCameraModal(false)}
              >
                Close Viewfinder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
