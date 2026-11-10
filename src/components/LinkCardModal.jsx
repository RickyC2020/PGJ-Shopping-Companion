import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, X, Sparkles, ShieldCheck } from 'lucide-react';

export default function LinkCardModal({
  isOpen,
  onClose,
  onSuccess
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (num) => {
    const val = (num || cardNumber).trim();
    if (val === '231791') {
      setError('');
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setCardNumber('');
        onSuccess('231791');
        onClose();
      }, 900);
    } else {
      setError('Card not found. Please enter valid demo card number 231791.');
    }
  };

  const handleUseDemo = () => {
    setCardNumber('231791');
    handleSubmit('231791');
  };

  return (
    <div
      className="modal-backdrop-overlay"
      id="link-card-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSuccess) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-card-modal-title"
    >
      <div className="link-card-modal-container" id="inapp-link-card-dialog">
        <button
          type="button"
          className="modal-close-icon-btn"
          onClick={onClose}
          aria-label="Close modal"
          id="close-link-card-modal-btn"
        >
          <X size={18} />
        </button>

        <div className="link-card-header">
          <div className="link-card-badge-tag">
            <Sparkles size={14} style={{ color: 'var(--yellow-600)' }} />
            <span>Progressive Rewards</span>
          </div>
          <h3 id="link-card-modal-title">Link Your Loyalty Card</h3>
          <p>
            Connect your physical Progressive Rewards card to unlock digital tracking, cash savings, and earn 1 point per $100 spent!
          </p>
        </div>

        {isSuccess ? (
          <div className="link-card-success-box" id="inapp-card-link-success">
            <CheckCircle2 size={36} className="success-icon-pulse" />
            <h4>Card #231791 Linked!</h4>
            <p>25,000 points balance loaded into your profile.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="link-card-form"
          >
            <label htmlFor="inapp-card-number-input" className="link-card-label">
              <CreditCard size={15} style={{ color: 'var(--logo-green-g, #4A9C86)' }} />
              <span>Enter 6-Digit Card Number</span>
            </label>

            <div className="link-card-input-row">
              <input
                type="text"
                id="inapp-card-number-input"
                inputMode="numeric"
                placeholder="e.g. 231791"
                value={cardNumber}
                onChange={(e) => {
                  setCardNumber(e.target.value);
                  if (error) setError('');
                }}
                className={`link-card-text-input ${error ? 'field-error-border' : ''}`}
                autoFocus
              />
              <button
                type="submit"
                className="link-card-submit-btn"
                id="inapp-verify-card-btn"
              >
                Verify & Link
              </button>
            </div>

            {error && (
              <div className="card-error-text" id="inapp-card-error">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="demo-card-hint-row">
              <span>Demo Account:</span>
              <button
                type="button"
                className="demo-card-pill-btn"
                onClick={handleUseDemo}
                id="use-demo-card-btn"
              >
                Use Card #231791 (25k pts)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
