import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';

export default function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  mode
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop-overlay"
      id="signout-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-modal-title"
    >
      <div className="signout-modal-container" id="signout-confirm-dialog">
        <button
          type="button"
          className="modal-close-icon-btn"
          onClick={onClose}
          aria-label="Close modal"
          id="close-signout-modal-btn"
        >
          <X size={18} />
        </button>

        <div className="signout-modal-icon-wrapper">
          <div className="signout-modal-icon-circle">
            <LogOut size={26} className="signout-modal-icon" />
          </div>
        </div>

        <h3 className="signout-modal-title" id="signout-modal-title">
          Sign Out of Progressive Foods?
        </h3>

        <p className="signout-modal-description">
          {mode === 'customer'
            ? 'Are you sure you want to sign out? Your current pre-checkout cart and temporary shopping session will be cleared.'
            : 'Are you sure you want to exit the Staff Portal? You will need your employee PIN (1234) to sign back in.'}
        </p>

        <div className="signout-modal-actions">
          <button
            type="button"
            className="signout-btn-cancel"
            onClick={onClose}
            id="cancel-signout-btn"
          >
            Stay Signed In
          </button>

          <button
            type="button"
            className="signout-btn-confirm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            id="confirm-signout-btn"
          >
            <LogOut size={16} />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
