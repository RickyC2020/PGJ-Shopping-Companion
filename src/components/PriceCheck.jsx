import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  CameraOff,
  Search,
  Barcode,
  AlertCircle,
  Zap
} from 'lucide-react';
import { playScannerBeep } from '../utils/audio';
import { sanitizeBarcodeInput } from '../utils/barcodeValidator';
import ProductResultCard from './ProductResultCard';

export default function PriceCheck({
  products = [],
  scannedBarcode,
  onScan,
  onAddToCart,
  selectedStore,
  mode = 'customer',
  onUpdateInventory
}) {
  const [skuInput, setSkuInput] = useState(scannedBarcode || '');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Sync skuInput with scannedBarcode changes
  useEffect(() => {
    if (scannedBarcode) {
      setSkuInput(scannedBarcode);
    }
  }, [scannedBarcode]);

  // Handle HTML5 video stream camera scanner
  useEffect(() => {
    let isSubscribed = true;

    const startCamera = async () => {
      if (!cameraActive) return;

      setCameraError(null);

      // Verify mediaDevices capability
      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        if (isSubscribed) {
          setCameraError('Camera stream not supported by this browser. Use manual SKU lookup below.');
          setCameraActive(false);
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });

        if (!isSubscribed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            // Autoplay may be restricted in some browsers
          }
        }
      } catch (err) {
        if (isSubscribed) {
          console.warn('Camera stream error:', err);
          setCameraError('Camera access declined or unavailable. Please use manual SKU lookup below.');
          setCameraActive(false);
        }
      }
    };

    if (cameraActive) {
      startCamera();
    } else {
      stopCameraTracks();
    }

    return () => {
      isSubscribed = false;
      stopCameraTracks();
    };
  }, [cameraActive]);

  const stopCameraTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setCameraActive((prev) => !prev);
  };

  const handleLookup = (e) => {
    if (e) e.preventDefault();
    if (!skuInput || !skuInput.trim()) return;

    const validation = sanitizeBarcodeInput(skuInput);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(null);
    playScannerBeep();
    onScan(validation.sanitized);
  };

  const handleQuickSelect = (barcode) => {
    setSkuInput(barcode);
    setValidationError(null);
    playScannerBeep();
    onScan(barcode);
  };

  // Find currently selected product
  const activeProduct = products.find((p) => p.barcode === scannedBarcode) ||
    products.find((p) => p.barcode === skuInput) ||
    products[0];

  return (
    <div className="space-y-6" id="price-check-component">
      {/* 1. Camera Scanner Viewport Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">In-Store Camera Scanner</h2>
              <p className="text-xs text-slate-500">Scan barcodes directly via live camera feed</p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleCamera}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              cameraActive
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-600 text-white shadow hover:bg-emerald-700'
            }`}
            id="camera-toggle-btn"
            title={cameraActive ? 'Stop Camera' : 'Start Live Camera Stream'}
          >
            {cameraActive ? <CameraOff size={14} /> : <Camera size={14} />}
            <span>{cameraActive ? 'Stop Camera' : 'Enable Camera'}</span>
          </button>
        </div>

        {/* Viewport Box */}
        <div className="relative bg-slate-900 aspect-video max-h-72 w-full flex items-center justify-center overflow-hidden">
          {cameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
              id="camera-video-stream"
            />
          ) : (
            <div className="text-center p-6 text-slate-400">
              <Barcode size={48} className="mx-auto mb-2 opacity-50 text-slate-300" />
              <p className="text-xs font-medium text-slate-300">Camera scanner is standby</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                Click &ldquo;Enable Camera&rdquo; above or use the instant keyboard SKU search below
              </p>
            </div>
          )}

          {/* Scanner Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-32 border-2 border-emerald-400/70 rounded-xl relative">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
              {cameraActive && (
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse absolute top-1/2 -translate-y-1/2"></div>
              )}
            </div>
          </div>

          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white/80 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md">
            <span className="flex items-center gap-1">
              <Zap size={11} className="text-yellow-400" />
              Align product barcode inside frame
            </span>
            <span className="text-[10px] font-mono text-white/60">HTML5 Media Stream</span>
          </div>
        </div>

        {cameraError && (
          <div className="p-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0 text-amber-600" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* 2. Keyboard-Accessible Manual SKU / Barcode Input */}
        <div className="flex items-center gap-2 p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleLookup} className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Barcode size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="sku-input"
                name="sku-input"
                value={skuInput}
                onChange={(e) => {
                  setSkuInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter SKU or barcode (e.g. 055270961124)..."
                aria-label="Simulated Barcode Scanner Input"
                className="w-full flex-1 pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm font-mono tracking-wide placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              autoFocus
              id="scan-barcode-submit-btn"
              aria-label="Scan Code - Look Up"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
            >
              <Search size={16} />
              <span>Look Up</span>
            </button>
          </form>
        </div>

        {validationError && (
          <div className="px-4 pb-3">
            <p className="text-xs text-rose-600 font-medium flex items-center gap-1" role="alert">
              <AlertCircle size={13} />
              <span>{validationError}</span>
            </p>
          </div>
        )}

        {/* Quick SKU Lookup Chips for Instant Desktop Testing */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Instant Desktop Testing (Click to check):
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">{products.length} Products</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {products.map((p) => {
              const isSelected = activeProduct?.barcode === p.barcode;
              return (
                <button
                  key={p.barcode}
                  type="button"
                  onClick={() => handleQuickSelect(p.barcode)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-500/30'
                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-200'
                  }`}
                  title={`Lookup ${p.name} (${p.barcode})`}
                >
                  <span>{p.imageEmoji || '📦'}</span>
                  <span className="truncate max-w-[120px]">{p.name.split(' ')[0]} {p.name.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Product Result Card (Clean item title, unit price, stock status, and Add to Basket action) */}
      <ProductResultCard
        product={activeProduct}
        allProducts={products}
        mode={mode}
        selectedStore={selectedStore}
        onUpdateInventory={onUpdateInventory}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}
