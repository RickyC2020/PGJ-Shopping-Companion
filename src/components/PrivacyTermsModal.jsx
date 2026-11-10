import React from 'react';
import { ShieldCheck, Lock, Phone, CreditCard, Trash2, X, CheckCircle, Info } from 'lucide-react';

export default function PrivacyTermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop-overlay"
      id="privacy-terms-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      <div className="profile-modal-container max-w-md w-full bg-white rounded-2xl shadow-2xl p-6" id="privacy-terms-dialog">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 id="privacy-modal-title" className="text-base font-bold text-slate-900 leading-tight">
                Privacy & Data Consent
              </h3>
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                JDPA 2020 Compliant
              </span>
            </div>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
            onClick={onClose}
            id="close-privacy-modal-btn"
            aria-label="Close Privacy Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-xs text-slate-600 leading-relaxed max-h-[65vh] overflow-y-auto">
          {/* Data Minimization Notice */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs mb-1.5">
              <Lock size={13} className="text-emerald-700" />
              <span>Data Minimization Standard</span>
            </div>
            <p className="text-emerald-800 text-[11px]">
              In accordance with the Jamaica Data Protection Act (JDPA), Progressive Foods collects only the minimum necessary data required to run the rewards program:
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-emerald-900 font-medium">
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-emerald-700 flex-shrink-0" />
                <span><strong>Phone Number:</strong> For member SMS lookup and 2FA verification only.</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard size={12} className="text-emerald-700 flex-shrink-0" />
                <span><strong>Loyalty Member ID:</strong> To track point accruals and cash discounts.</span>
              </li>
            </ul>
          </div>

          {/* What We Never Store */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
              <CheckCircle size={13} className="text-emerald-600" />
              <span>What We Never Collect or Store</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              No payment card information (CVV / banking details), no device GPS location tracking, no biometric scans, and no third-party advertising cookies.
            </p>
          </div>

          {/* Right to Erasure / Unlinking */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
              <Trash2 size={13} className="text-rose-600" />
              <span>Right to Erasure & Unlinking</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              You may exercise your right to disconnect at any time. Tapping <strong>"Unlink Card & Clear Data"</strong> in your profile immediately deletes your cached tokens, session history, and local credentials from this device.
            </p>
          </div>

          {/* Offline & Encryption */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10.5px] text-slate-500 flex items-start gap-2">
            <Info size={13} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              All catalog queries are encrypted in transit via TLS 1.3. Local catalog persistence is strictly sandboxed to your browser session.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            onClick={onClose}
            id="acknowledge-privacy-modal-btn"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
