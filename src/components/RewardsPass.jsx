import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Barcode as BarcodeIcon,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Sun,
  SunMedium,
  Sparkles,
  Zap
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
        matrix[r][c] = seed % 3 === 0 ? 1 : 0;
      }
    }
  }

  return matrix;
}

export default function RewardsPass({
  cardNumber = '231791',
  memberName = 'Ricardo Campbell',
  pointBalance = 25000,
  onOpenLinkCard
}) {
  const [barcodeFormat, setBarcodeFormat] = useState('1d'); // '1d' (Code 128) | '2d' (QR)
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [copiedMemberId, setCopiedMemberId] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  // Dynamic TOTP Token & Expiration state
  const [activeTotp, setActiveTotp] = useState(() => generateTOTP(cardNumber, Date.now()));
  const [secondsRemaining, setSecondsRemaining] = useState(() => getSecondsRemaining(Date.now()));

  const wakeLockRef = useRef(null);

  // Formatted spaced monospace Member ID fallback
  const memberId = cardNumber === '231791' ? 'MEM-482-910-33' : `MEM-${cardNumber}-33`;

  // Screen Wake Lock API: Wrapped in capability check so desktop browsers don't throw errors
  useEffect(() => {
    let isMounted = true;

    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && navigator.wakeLock) {
        try {
          const lock = await navigator.wakeLock.request('screen');
          if (isMounted) {
            wakeLockRef.current = lock;
            setWakeLockActive(true);
            lock.addEventListener('release', () => {
              if (isMounted) setWakeLockActive(false);
            });
          }
        } catch (e) {
          // Quietly handle desktop without wakeLock or permission denials
        }
      }
    };

    requestWakeLock();

    return () => {
      isMounted = false;
      if (wakeLockRef.current && wakeLockRef.current.release) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, []);

  // Timer loop for TOTP refresh
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const sec = getSecondsRemaining(now);
      setSecondsRemaining(sec);
      if (sec === 30 || sec === 0) {
        setActiveTotp(generateTOTP(cardNumber, now));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [cardNumber]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(memberId);
      }
      setCopiedMemberId(true);
      setTimeout(() => setCopiedMemberId(false), 2000);
    } catch (e) {
      setCopiedMemberId(true);
      setTimeout(() => setCopiedMemberId(false), 2000);
    }
  };

  const dynamicBars = generateDynamicBarcodeBars(activeTotp);
  const qrMatrix = generateQRCodeMatrix(memberId, activeTotp);

  return (
    <div className="space-y-4" id="rewards-pass-component">
      {/* Top Banner Card with Member Info & Controls */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-300" />
            <span className="text-xs uppercase tracking-widest font-bold text-emerald-200">
              Progressive Rewards Pass
            </span>
          </div>

          {/* Wake Lock Status Badge */}
          <div
            id="wake-lock-status-badge"
            className="flex items-center gap-1.5 text-[11px] font-medium bg-emerald-900/80 border border-emerald-700/60 text-emerald-200 px-2.5 py-0.5 rounded-full"
            title="Display stays active while viewing your rewards pass"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${wakeLockActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></div>
            <span>Screen Wake Lock</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">{memberName}</h3>
            <p className="text-xs text-emerald-200/80 font-mono">Card #<span>{cardNumber}</span></p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 justify-end text-yellow-300 text-xs font-semibold">
              <Sparkles size={12} />
              <span>Available Points</span>
            </div>
            <div className="text-xl font-black text-white">
              {Number(pointBalance).toLocaleString()} <span className="text-xs font-normal text-emerald-200">pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optical Scan Controls (Format Toggle + High Contrast) */}
      <div className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2">
        {/* Toggle 1D / 2D */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-semibold" role="tablist">
          <button
            type="button"
            id="barcode-format-1d-btn"
            role="tab"
            aria-selected={barcodeFormat === '1d'}
            aria-pressed={barcodeFormat === '1d'}
            onClick={() => setBarcodeFormat('1d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              barcodeFormat === '1d'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarcodeIcon size={14} />
            <span>1D Code 128</span>
          </button>

          <button
            type="button"
            id="barcode-format-2d-btn"
            role="tab"
            aria-selected={barcodeFormat === '2d'}
            aria-pressed={barcodeFormat === '2d'}
            onClick={() => setBarcodeFormat('2d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              barcodeFormat === '2d'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode size={14} />
            <span>2D QR Code</span>
          </button>
        </div>

        {/* High Contrast Toggle */}
        <button
          type="button"
          id="high-contrast-toggle-btn"
          aria-pressed={highContrastMode}
          onClick={() => setHighContrastMode((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
            highContrastMode
              ? 'bg-black text-white border-black shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle maximum contrast for cashier optical scanning"
        >
          {highContrastMode ? <Sun size={13} className="text-yellow-400" /> : <SunMedium size={13} />}
          <span>{highContrastMode ? 'High-Contrast ON' : 'High Contrast'}</span>
        </button>
      </div>

      {/* Pure White Container with >=24px quiet margin (p-6) for Optical Scanners */}
      <div
        id="optical-scan-container"
        className={`bg-white rounded-2xl border p-6 shadow-sm transition-all text-center ${
          highContrastMode ? 'border-black ring-2 ring-black' : 'border-slate-200'
        }`}
        style={{ backgroundColor: '#FFFFFF', padding: '24px' }}
      >
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-4 flex items-center justify-center gap-1.5">
          <Zap size={12} className="text-emerald-600" />
          <span>Present at Register for Loyalty Points</span>
        </div>

        {/* Barcode Display Area */}
        <div className="flex items-center justify-center my-2 min-h-[140px]">
          {barcodeFormat === '1d' ? (
            <div className="w-full max-w-[280px]">
              <svg
                id="rendered-1d-barcode-svg"
                viewBox="0 0 280 84"
                className="w-full h-20 mx-auto"
                preserveAspectRatio="none"
              >
                {/* Quiet zone background */}
                <rect x="0" y="0" width="280" height="84" fill="#FFFFFF" />

                {/* Render linear Code 128 bars */}
                {dynamicBars.map((bar, index) => {
                  const x = 20 + index * 18;
                  return (
                    <g key={index}>
                      <rect x={x} y="4" width={bar.w * 1.8} height="76" fill="#000000" />
                      <rect x={x + bar.w * 1.8 + bar.g * 1.2} y="4" width={Math.max(1.5, bar.w * 0.9)} height="76" fill="#000000" />
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="p-2 bg-white rounded-xl">
              <svg
                id="rendered-2d-qr-svg"
                viewBox="0 0 25 25"
                className="w-36 h-36 mx-auto"
                shapeRendering="crispEdges"
              >
                <rect width="25" height="25" fill="#FFFFFF" />
                {qrMatrix.map((row, r) =>
                  row.map((val, c) => (
                    val === 1 ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#000000" /> : null
                  ))
                )}
              </svg>
            </div>
          )}
        </div>

        {/* Bold, Spaced Monospace Member ID Fallback */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1">
            Cashier Manual Member ID
          </span>

          <div className="flex items-center gap-2">
            <span
              id="manual-member-id-display"
              className="font-mono font-bold tracking-widest text-slate-800 text-lg sm:text-xl select-all"
            >
              {memberId}
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Copy Member ID"
              aria-label="Copy Member ID"
            >
              {copiedMemberId ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Anti-Screenshot Rotating Token: <strong className="font-mono text-slate-700">{activeTotp}</strong> ({secondsRemaining}s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

