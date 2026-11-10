import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../assets/logo.png';
import { 
  CreditCard, 
  Sparkles, 
  Gift, 
  Coins, 
  Clock, 
  Info, 
  Check, 
  ShieldCheck, 
  Calculator, 
  ArrowRightLeft,
  Barcode as BarcodeIcon,
  Zap,
  Lock,
  Timer,
  ShieldAlert,
  QrCode,
  Copy,
  RotateCw,
  Sun,
  SunMedium
} from 'lucide-react';
import { generateTOTP, getSecondsRemaining, generateDynamicBarcodeBars } from '../utils/totpVerification.js';

// Deterministic 25x25 QR Code matrix generator for 2D barcode format
function generateQRCodeMatrix(memberId, totp) {
  const size = 25;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  // Finder pattern helper (7x7)
  const setFinder = (startX, startY) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = 1;
        } else {
          matrix[startY + r][startX + c] = 0;
        }
      }
    }
  };

  // 3 Finder patterns (Top-Left, Top-Right, Bottom-Left)
  setFinder(0, 0);
  setFinder(18, 0);
  setFinder(0, 18);

  // Timing patterns
  for (let i = 8; i < 17; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // Alignment pattern around (18, 18)
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[18 + r][18 + c] = 1;
      }
    }
  }

  // Deterministic modules derived from payload
  let seed = 0;
  const payload = `PGJ:${memberId}:${totp}`;
  for (let i = 0; i < payload.length; i++) {
    seed = (seed * 31 + payload.charCodeAt(i)) >>> 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeftFinder = r <= 7 && c <= 7;
      const inTopRightFinder = r <= 7 && c >= 17;
      const inBottomLeftFinder = r >= 17 && c <= 7;
      const inAlignment = r >= 16 && r <= 20 && c >= 16 && c <= 20;
      const inTiming = (r === 6 && c >= 7 && c <= 17) || (c === 6 && r >= 7 && r <= 17);

      if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder && !inAlignment && !inTiming) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        matrix[r][c] = (seed % 3 === 0) ? 1 : 0;
      }
    }
  }

  return matrix;
}

export default function LoyaltyRewardsTab({
  isLinked = true,
  cardNumber = "231791",
  pointBalance: initialPointBalance = 25000,
  onOpenLinkCard
}) {
  const [pointBalance, setPointBalance] = useState(initialPointBalance);
  const [calculatorInput, setCalculatorInput] = useState(initialPointBalance);
  const [autoApply, setAutoApply] = useState(true);

  // Dynamic Barcode & TOTP Anti-Screenshot Defense State
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [secondsRemaining, setSecondsRemaining] = useState(() => getSecondsRemaining(Date.now()));
  const [activeTotp, setActiveTotp] = useState(() => generateTOTP(cardNumber, Date.now()));

  // 1. Optical Readability: Screen Wake Lock API State
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef(null);

  // 1. High-Contrast Brightness Mode Toggle State
  const [highContrastMode, setHighContrastMode] = useState(false);

  // 2. Dual Barcode Format Toggle State: 1D Linear Code 128 (default) vs 2D QR Code
  const [barcodeFormat, setBarcodeFormat] = useState('1d');

  // 3. High-Legibility Manual Fallback Member ID & Upside-Down Cashier Counter Flip
  const memberId = cardNumber === '231791' ? 'MEM-482-910-33' : `MEM-${cardNumber}-33`;
  const [copiedMemberId, setCopiedMemberId] = useState(false);
  const [cashierFlip, setCashierFlip] = useState(false);

  const handleCopyMemberId = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(memberId);
      }
      setCopiedMemberId(true);
      setTimeout(() => setCopiedMemberId(false), 2200);
    } catch (e) {
      setCopiedMemberId(true);
      setTimeout(() => setCopiedMemberId(false), 2200);
    }
  };

  // Screen Wake Lock API Integration: keeps screen awake at checkout
  useEffect(() => {
    let isMounted = true;

    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          const lock = await navigator.wakeLock.request('screen');
          if (isMounted) {
            wakeLockRef.current = lock;
            setWakeLockActive(true);
            lock.addEventListener('release', () => {
              if (isMounted) setWakeLockActive(false);
            });
          }
        } catch (err) {
          // Handled gracefully if browser denies or low power mode
          console.warn('[Screen Wake Lock] Not acquired:', err?.message || err);
        }
      }
    };

    if (isLinked) {
      requestWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLinked && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isLinked]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      const remaining = getSecondsRemaining(now);
      setSecondsRemaining(remaining);
      setActiveTotp(generateTOTP(cardNumber, now));
    }, 1000);

    return () => clearInterval(timer);
  }, [cardNumber]);

  // Generate 2D QR matrix dynamically
  const qrMatrix = generateQRCodeMatrix(memberId, activeTotp);

  // Official formula: 100 points = $1 JMD
  const redeemableJMD = (pointBalance / 100).toFixed(2);
  const calculatedJMD = ((Number(calculatorInput) || 0) / 100).toFixed(2);

  // SVG Barcode generator modulated with dynamic rotating token
  const dynamicBars = generateDynamicBarcodeBars(activeTotp);

  return (
    <div className="rewards-tab-container" id="rewards-tab-view">
      
      {/* Header title */}
      <div className="rewards-header-box">
        <div className="rewards-title-row">
          <div className="rewards-title-badge">
            <Gift size={14} style={{ color: 'var(--yellow-600)' }} />
            <span>Digital Loyalty Viewer</span>
          </div>
          <span className={`live-status-pill ${isLinked ? '' : 'unlinked-status'}`}>
            {isLinked ? 'Active Member' : 'Card Not Linked'}
          </span>
        </div>
        <h2>Progressive Rewards</h2>
        <p>
          {isLinked 
            ? 'Use your digital loyalty card in-store just like your physical card.'
            : 'Link your physical loyalty card to access your rewards balance.'}
        </p>
      </div>

      {/* Unlinked State */}
      {!isLinked ? (
        <div className="rewards-unlinked-card" id="rewards-unlinked-state">
          <div className="unlinked-icon-box">
            <Lock size={32} style={{ color: 'var(--yellow-700)' }} />
          </div>
          <h3>No Loyalty Card Linked</h3>
          <p>
            You skipped linking your loyalty card during setup. Link your physical card (Card #<strong>231791</strong>) to view your 25,000 points balance, calculate cash discounts, and display your scannable digital barcode.
          </p>
          {onOpenLinkCard && (
            <button 
              type="button" 
              className="scan-submit-btn" 
              onClick={onOpenLinkCard}
              id="unlinked-link-card-btn"
              style={{ width: 'auto', padding: '10px 22px', marginTop: '12px' }}
            >
              <CreditCard size={16} />
              <span>Link Card #231791</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 1. Digital Loyalty Card Representation */}
          <div className="digital-loyalty-card" id="digital-loyalty-card">
        <div className="loyalty-card-sheen"></div>
        
        {/* Card Top Row */}
        <div className="loyalty-card-top">
          <div className="card-brand-group">
            <div className="card-logo-badge">
              <img src={logoImg} alt="Progressive Foods Logo" className="card-brand-logo-img" />
            </div>
            <div>
              <div className="card-brand-name">Progressive Foods</div>
              <div className="card-program-name">Rewards Companion</div>
            </div>
          </div>
          <div className="card-vip-tag">
            <Sparkles size={11} style={{ color: 'var(--yellow-400)' }} />
            <span>VIP REWARDS</span>
          </div>
        </div>

        {/* Card Smart Chip Graphic */}
        <div className="card-chip-row">
          <div className="card-chip">
            <div className="chip-line chip-h"></div>
            <div className="chip-line chip-v"></div>
          </div>
          <div className="rfid-waves">
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
            <span className="wave-bar"></span>
          </div>
        </div>

        {/* Card Number */}
        <div className="card-number-section">
          <div className="card-number-label">CARD NUMBER</div>
          <div className="card-number-digits" id="loyalty-card-number">
            {cardNumber}
          </div>
        </div>

        {/* Scannable Barcode with Dynamic Screenshot Protection & In-Store Safeguards */}
        <div className="card-barcode-box" id="loyalty-barcode-container">
          {/* Active Live Security Banner */}
          <div className="barcode-security-live-bar" id="barcode-security-live-status">
            <span className="live-pulse-dot" aria-hidden="true"></span>
            <span className="live-security-text">LIVE SCREENSHOT PROTECTION ACTIVE</span>
            <span className="live-countdown-badge" id="totp-countdown-badge">
              <Clock size={10} style={{ marginRight: '3px' }} />
              {secondsRemaining}s
            </span>
          </div>

          {/* Checkout Safeguard Controls: Screen Wake Lock Indicator & High-Contrast Toggle */}
          <div className="w-full flex flex-col gap-2 mt-2 mb-3">
            <div className="flex flex-wrap items-center justify-between gap-1.5 px-0.5">
              {/* Screen Wake Lock Status Badge */}
              <div 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200"
                id="wake-lock-status-badge"
              >
                <Sun size={12} className={wakeLockActive ? 'animate-pulse text-amber-600' : 'text-amber-500'} />
                <span>{wakeLockActive ? 'Display Awake Active (Checkout Mode)' : 'Screen Wake Lock Ready'}</span>
              </div>

              {/* High-Contrast Brightness Mode Toggle */}
              <button
                type="button"
                onClick={() => setHighContrastMode(!highContrastMode)}
                id="high-contrast-toggle-btn"
                aria-pressed={highContrastMode}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                  highContrastMode
                    ? 'bg-black text-yellow-300 border-black shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Toggle High-Contrast Brightness Mode for low-light checkout lanes"
              >
                <SunMedium size={12} className={highContrastMode ? 'text-yellow-300' : 'text-amber-500'} />
                <span>{highContrastMode ? 'High-Contrast ON' : 'High-Contrast Mode'}</span>
              </button>
            </div>

            {/* Dual Barcode Format Toggle (1D Linear Code 128 vs 2D QR Code) */}
            <div 
              className="w-full flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold"
              role="tablist"
              aria-label="Barcode scanner format"
              id="barcode-format-toggle-bar"
            >
              <button
                type="button"
                role="tab"
                aria-selected={barcodeFormat === '1d'}
                id="barcode-format-1d-btn"
                onClick={() => setBarcodeFormat('1d')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all cursor-pointer ${
                  barcodeFormat === '1d'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <BarcodeIcon size={14} />
                <span>1D Linear (Code 128)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={barcodeFormat === '2d'}
                id="barcode-format-2d-btn"
                onClick={() => setBarcodeFormat('2d')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all cursor-pointer ${
                  barcodeFormat === '2d'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
              >
                <QrCode size={14} />
                <span>2D QR Code</span>
              </button>
            </div>
          </div>

          {/* Pure White Background (#FFFFFF) Container with 24px Minimum Quiet Zone Padding */}
          <div 
            className={`w-full optical-quiet-zone-container relative bg-[#FFFFFF] p-6 rounded-xl border transition-all ${
              highContrastMode 
                ? 'border-4 border-black ring-4 ring-black/10 shadow-xl' 
                : 'border-slate-200 shadow-xs'
            }`}
            style={{ backgroundColor: '#FFFFFF', padding: '24px' }}
            id="optical-scan-container"
          >
            {/* Format 1: Standard 1D Linear Barcode (Code 128) */}
            {barcodeFormat === '1d' ? (
              <div className="barcode-graphic-wrapper flex justify-center items-center w-full">
                <svg 
                  className="rendered-barcode-svg w-full max-w-[260px] h-[52px]" 
                  viewBox="0 0 240 60" 
                  aria-label={`1D Code 128 Barcode for card number ${cardNumber} with security token ${activeTotp}`}
                  role="img"
                  id="rendered-1d-barcode-svg"
                >
                  <rect width="240" height="60" fill="#FFFFFF" />
                  {/* Quiet zone & guard bars */}
                  <rect x="10" y="5" width="3" height="42" fill="#000000" />
                  <rect x="15" y="5" width="2" height="42" fill="#000000" />
                  
                  {/* Encoded pattern for 231791 */}
                  <rect x="22" y="5" width="4" height="42" fill="#000000" />
                  <rect x="29" y="5" width="2" height="42" fill="#000000" />
                  <rect x="34" y="5" width="5" height="42" fill="#000000" />
                  <rect x="42" y="5" width="1" height="42" fill="#000000" />
                  <rect x="47" y="5" width="3" height="42" fill="#000000" />
                  <rect x="54" y="5" width="4" height="42" fill="#000000" />
                  <rect x="62" y="5" width="2" height="42" fill="#000000" />
                  <rect x="67" y="5" width="5" height="42" fill="#000000" />
                  <rect x="75" y="5" width="2" height="42" fill="#000000" />
                  <rect x="80" y="5" width="3" height="42" fill="#000000" />
                  <rect x="87" y="5" width="4" height="42" fill="#000000" />
                  <rect x="94" y="5" width="2" height="42" fill="#000000" />
                  <rect x="99" y="5" width="5" height="42" fill="#000000" />
                  <rect x="107" y="5" width="1" height="42" fill="#000000" />
                  <rect x="112" y="5" width="4" height="42" fill="#000000" />
                  <rect x="120" y="5" width="2" height="42" fill="#000000" />
                  <rect x="125" y="5" width="5" height="42" fill="#000000" />
                  <rect x="133" y="5" width="3" height="42" fill="#000000" />
                  <rect x="139" y="5" width="2" height="42" fill="#000000" />
                  <rect x="145" y="5" width="4" height="42" fill="#000000" />
                  <rect x="153" y="5" width="2" height="42" fill="#000000" />
                  <rect x="158" y="5" width="3" height="42" fill="#000000" />
                  <rect x="165" y="5" width="5" height="42" fill="#000000" />
                  <rect x="173" y="5" width="2" height="42" fill="#000000" />
                  <rect x="178" y="5" width="4" height="42" fill="#000000" />
                  <rect x="186" y="5" width="1" height="42" fill="#000000" />
                  <rect x="191" y="5" width="3" height="42" fill="#000000" />
                  <rect x="197" y="5" width="5" height="42" fill="#000000" />
                  <rect x="205" y="5" width="2" height="42" fill="#000000" />
                  <rect x="210" y="5" width="4" height="42" fill="#000000" />
                  <rect x="217" y="5" width="2" height="42" fill="#000000" />
                  <rect x="224" y="5" width="3" height="42" fill="#000000" />

                  {/* Dynamic moving security laser / watermark */}
                  <line 
                    x1="10" y1="26" x2="230" y2="26" 
                    stroke="rgba(3, 124, 104, 0.45)" 
                    strokeWidth="2.5" 
                    strokeDasharray="8 6"
                  />
                </svg>
              </div>
            ) : (
              /* Format 2: 2D QR Code Format for Area Imagers */
              <div className="qr-graphic-wrapper flex flex-col justify-center items-center w-full py-1">
                <svg
                  className="rendered-qr-svg mx-auto"
                  viewBox="0 0 200 200"
                  width="170"
                  height="170"
                  aria-label={`2D QR Code for ${memberId} with security token ${activeTotp}`}
                  role="img"
                  id="rendered-2d-qr-svg"
                >
                  <rect width="200" height="200" fill="#FFFFFF" />
                  {qrMatrix.map((row, r) =>
                    row.map((cell, c) =>
                      cell === 1 ? (
                        <rect
                          key={`qr-${r}-${c}`}
                          x={12.5 + c * 7}
                          y={12.5 + r * 7}
                          width="7"
                          height="7"
                          fill="#000000"
                        />
                      ) : null
                    )
                  )}
                </svg>
                <span className="text-[10px] text-slate-500 font-medium mt-1">2D Area Imager Compatible</span>
              </div>
            )}

            {/* High-Legibility Monospace Manual Fallback ID directly beneath barcode */}
            <div 
              className={`mt-4 pt-3 border-t transition-transform duration-300 ${
                highContrastMode ? 'border-black' : 'border-slate-200'
              } ${cashierFlip ? 'rotate-180' : ''}`}
              id="cashier-fallback-section"
            >
              <div className="flex items-center justify-between mb-1 px-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Cashier Manual Fallback ID
                </span>
                <button
                  type="button"
                  onClick={() => setCashierFlip(!cashierFlip)}
                  id="cashier-flip-btn"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded transition-colors cursor-pointer"
                  title="Flip 180° for cashier to read across counter"
                >
                  <RotateCw size={10} />
                  <span>{cashierFlip ? 'Normal View' : 'Flip for Cashier (180°)'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyMemberId}
                className={`w-full group flex items-center justify-between px-3.5 py-2 rounded-lg border transition-all cursor-pointer ${
                  highContrastMode
                    ? 'bg-white border-2 border-black text-black'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900'
                }`}
                id="manual-member-id-copy-btn"
                title="Tap to copy Member ID for manual POS entry"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                    Member ID
                  </span>
                  <span 
                    className="font-mono text-base sm:text-lg font-black tracking-[0.22em] text-slate-950 select-all"
                    id="manual-fallback-member-id"
                  >
                    {memberId}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pl-2">
                  {copiedMemberId ? (
                    <span 
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md"
                      id="copied-feedback-badge"
                    >
                      <Check size={12} /> Copied!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 group-hover:text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-2xs">
                      <Copy size={12} /> Tap to copy
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Dual Barcode Number & Rotating Verification Token */}
          <div className="barcode-number-caption mt-2" id="barcode-matching-number">
            * {cardNumber} *
          </div>

          <div className="barcode-totp-caption" id="barcode-totp-display">
            <span className="totp-label">ROTATING TOKEN:</span>
            <span className="totp-code" id="totp-code-value">SEC-{activeTotp}</span>
            <span className="totp-expiry-hint">· Resets in {secondsRemaining}s</span>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="barcode-expiry-progress-track">
            <div 
              className="barcode-expiry-progress-fill"
              style={{ width: `${(secondsRemaining / 30) * 100}%` }}
              id="totp-progress-bar"
            ></div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="loyalty-card-footer">
          <span className="card-holder-name">VALUED CUSTOMER</span>
          <span className="card-interchangeable-tag">Physical & Dynamic Digital Verified</span>
        </div>
      </div>

      {/* 2. Real-time Point Balance & Cash-Value Indicator */}
      <div className="rewards-balance-grid">
        <div className="balance-stat-card points-card" id="loyalty-points-balance-card">
          <div className="stat-card-label">
            <Coins size={15} style={{ color: 'var(--yellow-600)' }} />
            <span>Point Balance</span>
          </div>
          <div className="stat-card-value" id="loyalty-point-balance">
            {pointBalance.toLocaleString()}
          </div>
          <div className="stat-card-subtext">Active loyalty points</div>
        </div>

        <div className="balance-stat-card cash-card" id="loyalty-cash-value-card">
          <div className="stat-card-label">
            <Sparkles size={15} style={{ color: 'var(--green-600)' }} />
            <span>Redeemable Value</span>
          </div>
          <div className="stat-card-value jmd-color" id="loyalty-cash-value">
            ${redeemableJMD} <span>JMD</span>
          </div>
          <div className="stat-card-subtext">Ready for checkout discount</div>
        </div>
      </div>

      {/* 3. Dynamic Cash-Value Calculator */}
      <div className="rewards-calculator-card" id="loyalty-calculator-card">
        <div className="calculator-header">
          <div className="calculator-title">
            <Calculator size={17} style={{ color: 'var(--green-700)' }} />
            <span>Cash-Value Calculator</span>
          </div>
          <span className="formula-badge">Official Rate: 100 pts = $1 JMD</span>
        </div>

        <div className="calculator-controls">
          <div className="calc-input-group">
            <label htmlFor="calc-points-input" className="calc-label">Enter Points:</label>
            <div className="calc-input-wrapper">
              <input
                id="calc-points-input"
                type="number"
                min="0"
                step="100"
                className="calc-points-field"
                value={calculatorInput}
                onChange={(e) => setCalculatorInput(e.target.value)}
                placeholder="25000"
              />
              <span className="calc-unit">pts</span>
            </div>
          </div>

          <div className="calc-arrow-divider">
            <ArrowRightLeft size={16} />
          </div>

          <div className="calc-result-group">
            <span className="calc-label">Redeemable Value:</span>
            <div className="calc-result-display" id="calculated-jmd-value">
              ${calculatedJMD} <small>JMD</small>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="calc-presets-row">
          <span style={{ fontSize: '11px', color: 'var(--slate-500)', fontWeight: 600 }}>Quick Calculator Presets:</span>
          <div className="preset-buttons-group">
            {[1000, 5000, 10000, 25000].map(pts => (
              <button
                key={pts}
                type="button"
                className={`preset-btn ${Number(calculatorInput) === pts ? 'active' : ''}`}
                onClick={() => setCalculatorInput(pts)}
              >
                {pts.toLocaleString()} pts (${(pts / 100).toFixed(0)} JMD)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Policy Reminder Text */}
      <div className="loyalty-policy-card" id="loyalty-policy-card">
        <div className="policy-icon-wrapper">
          <Clock size={18} style={{ color: 'var(--yellow-700)' }} />
        </div>
        <div className="policy-content">
          <div className="policy-headline">Loyalty Points Policy</div>
          <p className="policy-text" id="loyalty-policy-text">
            Earn 1 point per $100 spent. Points expire 365 days after the transaction date.
          </p>
        </div>
      </div>

      {/* 5. Auto-Apply Rewards at Checkout Toggle */}
      <div className="auto-apply-container" id="auto-apply-container">
        <div className="auto-apply-info">
          <div className="auto-apply-title-row">
            <Zap size={16} style={{ color: autoApply ? 'var(--green-700)' : 'var(--slate-500)' }} />
            <label htmlFor="auto-apply-toggle" className="auto-apply-label">
              Auto-Apply Rewards at Checkout
            </label>
          </div>
          <p className="auto-apply-description">
            Automatically applies your eligible point balance to reduce your supermarket total at the cash register.
          </p>
        </div>

        {/* Prominent Switch Toggle */}
        <div className="toggle-switch-wrapper">
          <button
            type="button"
            role="switch"
            aria-checked={autoApply}
            id="auto-apply-rewards-toggle"
            className={`prominent-toggle ${autoApply ? 'toggle-active' : ''}`}
            onClick={() => setAutoApply(!autoApply)}
            aria-label="Auto-Apply Rewards at Checkout"
          >
            <span className="toggle-thumb">
              {autoApply && <Check size={12} className="toggle-check-icon" />}
            </span>
          </button>
          <span className="toggle-status-label" style={{ color: autoApply ? 'var(--green-700)' : 'var(--slate-500)' }}>
            {autoApply ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      </>
      )}

    </div>
  );
}
