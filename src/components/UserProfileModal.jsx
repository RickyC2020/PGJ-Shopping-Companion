import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Sparkles,
  ShieldCheck,
  Store,
  X,
  BadgeCheck,
  ExternalLink,
  Award,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Trash2,
  Lock
} from 'lucide-react';
import PrivacyTermsModal from './PrivacyTermsModal';

export default function UserProfileModal({
  isOpen,
  onClose,
  mode,
  isCardLinked,
  linkedCardNumber,
  memberName = "Ricardo Campbell",
  selectedStore,
  onOpenLinkCard,
  onGoToRewards,
  onUnlinkCard
}) {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  if (!isOpen) return null;

  const handleUnlinkAndClearData = () => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.clear();
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    if (onUnlinkCard) {
      onUnlinkCard();
    }
    onClose();
  };

  // Mock profile data for linked loyalty customer
  const customerProfile = {
    name: memberName || "Ricardo Campbell",
    email: "ricardo.campbell@email.com",
    phone: "+1 (876) 555-0192",
    memberTier: "Gold Rewards Member",
    cardNum: linkedCardNumber || "231791",
    points: 25000,
    redeemableValue: "250.00"
  };

  // Mock profile data for staff associate
  const staffProfile = {
    name: "Marcus Sterling",
    staffId: "PGJ-EMP-1234",
    role: "Authorized Floor Associate",
    department: "Inventory & Wholesale Operations",
    accessLevel: "Level 2 Manager Access"
  };

  return (
    <div
      className="modal-backdrop-overlay"
      id="profile-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-modal-title"
    >
      <div className="profile-modal-container" id="user-profile-dialog">
        {/* Close Button */}
        <button
          type="button"
          className="modal-close-icon-btn"
          onClick={onClose}
          aria-label="Close profile"
          id="close-profile-modal-btn"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="profile-hero-header">
          <div className="profile-avatar-circle">
            {mode === 'employee' ? (
              <ShieldCheck size={34} className="profile-avatar-icon staff-icon" />
            ) : isCardLinked ? (
              <span className="profile-avatar-initials">RC</span>
            ) : (
              <User size={34} className="profile-avatar-icon guest-icon" />
            )}
          </div>

          <div className="profile-title-group">
            <h3 id="user-profile-modal-title" className="profile-user-name">
              {mode === 'employee'
                ? staffProfile.name
                : isCardLinked
                ? customerProfile.name
                : "Guest Shopper"}
            </h3>

            <div className="profile-status-pill-row">
              {mode === 'employee' ? (
                <span className="profile-pill staff-pill">
                  <ShieldCheck size={12} />
                  <span>Authorized Staff Member</span>
                </span>
              ) : isCardLinked ? (
                <span className="profile-pill member-pill">
                  <Sparkles size={12} />
                  <span>{customerProfile.memberTier}</span>
                </span>
              ) : (
                <span className="profile-pill unlinked-pill">
                  <AlertCircle size={12} />
                  <span>Loyalty Card Not Linked</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="profile-modal-body">
          {/* =========================================================
              CASE 1: EMPLOYEE / STAFF PROFILE
             ========================================================= */}
          {mode === 'employee' && (
            <div className="profile-details-section" id="staff-profile-details">
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-item-label">
                    <User size={14} className="profile-item-icon" />
                    <span>Staff Name</span>
                  </div>
                  <div className="profile-item-value" id="profile-staff-name">
                    {staffProfile.name}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-item-label">
                    <BadgeCheck size={14} className="profile-item-icon" />
                    <span>Staff ID</span>
                  </div>
                  <div className="profile-item-value highlight-badge" id="profile-staff-id">
                    {staffProfile.staffId}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-item-label">
                    <Award size={14} className="profile-item-icon" />
                    <span>Role & Department</span>
                  </div>
                  <div className="profile-item-value">
                    {staffProfile.role} • {staffProfile.department}
                  </div>
                </div>

                <div className="profile-info-item">
                  <div className="profile-item-label">
                    <Store size={14} className="profile-item-icon" />
                    <span>Assigned Location</span>
                  </div>
                  <div className="profile-item-value">
                    {selectedStore?.name || "Progressive Foods Portmore"}
                  </div>
                </div>
              </div>

              <div className="staff-security-card">
                <ShieldCheck size={18} style={{ color: 'var(--yellow-600)' }} />
                <div>
                  <strong>PIN Authentication Verified (1234)</strong>
                  <p>Authorized to inspect inventory count and modify store stock levels.</p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================
              CASE 2: CUSTOMER WITH LINKED LOYALTY CARD
             ========================================================= */}
          {mode === 'customer' && isCardLinked && (
            <div className="profile-details-section" id="customer-linked-profile-details">
              <div className="profile-info-grid">
                {/* 1. Name */}
                <div className="profile-info-item">
                  <div className="profile-item-label">
                    <User size={14} className="profile-item-icon" />
                    <span>Full Name</span>
                  </div>
                  <div className="profile-item-value" id="profile-customer-name">
                    {customerProfile.name}
                  </div>
                </div>

                {/* 2. Email Address */}
                <div className="profile-info-item">
                  <div className="profile-item-label">
                    <Mail size={14} className="profile-item-icon" />
                    <span>Email Address</span>
                  </div>
                  <div className="profile-item-value" id="profile-customer-email">
                    {customerProfile.email}
                  </div>
                </div>

                {/* 3. Phone Number */}
                <div className="profile-info-item">
                  <div className="profile-item-label">
                    <Phone size={14} className="profile-item-icon" />
                    <span>Phone Number</span>
                  </div>
                  <div className="profile-item-value" id="profile-customer-phone">
                    {customerProfile.phone}
                  </div>
                </div>

                {/* 4. Loyalty Card Number */}
                <div className="profile-info-item">
                  <div className="profile-item-label">
                    <CreditCard size={14} className="profile-item-icon" />
                    <span>Linked Loyalty Card</span>
                  </div>
                  <div className="profile-item-value highlight-badge" id="profile-customer-card">
                    #{customerProfile.cardNum}
                  </div>
                </div>
              </div>

              {/* Loyalty Card Points Snapshot Banner */}
              <div className="profile-loyalty-snapshot-card">
                <div className="snapshot-left">
                  <div className="snapshot-tag">
                    <Sparkles size={13} />
                    <span>Available Rewards</span>
                  </div>
                  <div className="snapshot-points">
                    {customerProfile.points.toLocaleString()} <small>pts</small>
                  </div>
                  <div className="snapshot-cash-value">
                    ≈ ${customerProfile.redeemableValue} JMD cash discount
                  </div>
                </div>

                {onGoToRewards && (
                  <button
                    type="button"
                    className="snapshot-rewards-link-btn"
                    onClick={() => {
                      onClose();
                      onGoToRewards();
                    }}
                    id="profile-view-digital-card-btn"
                  >
                    <span>View Digital Card</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>

              {/* JDPA Data Privacy & Card Unlink / Data Erasure Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-[11px] font-semibold text-slate-500">Data Minimization & Rights</span>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    id="profile-privacy-modal-btn"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <ShieldCheck size={13} />
                    <span>Privacy & Terms (JDPA)</span>
                  </button>
                </div>

                {/* Unlink Card & Clear Data Action Button */}
                <button
                  type="button"
                  onClick={handleUnlinkAndClearData}
                  id="unlink-card-clear-data-btn"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100/90 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Purges cached session tokens, unlinks loyalty card, and clears local storage"
                >
                  <Trash2 size={14} />
                  <span>Unlink Card & Clear Data</span>
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              CASE 3: CUSTOMER WITHOUT LINKED LOYALTY CARD
             ========================================================= */}
          {mode === 'customer' && !isCardLinked && (
            <div className="profile-details-section" id="customer-unlinked-profile-details">
              <div className="unlinked-notice-banner">
                <AlertCircle size={22} className="unlinked-notice-icon" />
                <div>
                  <strong>No Loyalty Card Connected</strong>
                  <p>
                    Link an existing card or register at customer service to earn 1 point per $100 spent and redeem cash savings.
                  </p>
                </div>
              </div>

              {/* Option 1: Link Existing Loyalty Card */}
              <div className="profile-action-card link-existing-card-box" id="profile-link-card-option">
                <div className="action-card-header">
                  <div className="action-card-icon-circle green-circle">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h4>Already Have a Progressive Card?</h4>
                    <p>Enter your 6-digit physical card number to load your rewards balance.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-primary-action-btn"
                  onClick={() => {
                    onClose();
                    onOpenLinkCard();
                  }}
                  id="profile-open-link-card-btn"
                >
                  <CreditCard size={16} />
                  <span>Link Your Card (Demo: #231791)</span>
                </button>
              </div>

              {/* Option 2: Sign Up at Customer Service Section */}
              <div className="profile-action-card customer-service-box" id="profile-customer-service-section">
                <div className="action-card-header">
                  <div className="action-card-icon-circle gold-circle">
                    <Store size={20} />
                  </div>
                  <div>
                    <h4>Sign Up at Customer Service</h4>
                    <p>Don't have a card yet? Registration is quick and free!</p>
                  </div>
                </div>

                <div className="customer-service-instructions">
                  <div className="instruction-step">
                    <span className="step-num">1</span>
                    <span>Visit the <strong>Customer Service section</strong> located near the main entrance at <strong>{selectedStore?.name || "Progressive Foods"}</strong>.</span>
                  </div>
                  <div className="instruction-step">
                    <span className="step-num">2</span>
                    <span>Our customer service representatives will print your free physical rewards card in under 2 minutes.</span>
                  </div>
                  <div className="instruction-step">
                    <span className="step-num">3</span>
                    <span>Return to this app, enter your new card number, and start tracking your points immediately!</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="profile-modal-footer">
          <button
            type="button"
            className="profile-modal-done-btn"
            onClick={onClose}
            id="close-profile-btn"
          >
            Done
          </button>
        </div>
      </div>

      {/* Lightweight Privacy & Data Consent Modal (JDPA Compliant) */}
      <PrivacyTermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
