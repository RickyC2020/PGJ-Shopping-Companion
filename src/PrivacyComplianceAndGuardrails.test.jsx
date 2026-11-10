import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import PrivacyTermsModal from './components/PrivacyTermsModal';
import UserProfileModal from './components/UserProfileModal';
import LoyaltyOnboardingScreen from './components/LoyaltyOnboardingScreen';
import { auditEnvFile } from '../scripts/auditBuildEnv.js';
import { 
  scrubPIIFromString, 
  scrubPayload, 
  captureScrubbedError 
} from './utils/telemetryScrubber.js';
import { createConfiguredFirestore, app, db } from './services/firebase.js';

describe('Systems Hardening, Data Privacy (JDPA), and Cloud Guardrails', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ============================================================================
  // 1. PRODUCTION KEY SCOPING & BUILD HYGIENE
  // ============================================================================
  describe('1. Production Key Scoping & Build Hygiene Audit', () => {
    it('detects un-prefixed sensitive variables and rejects them', () => {
      // Mock an unsafe .env scenario
      const tempPath = '/tmp/test_unsafe.env';
      const fs = require('fs');
      fs.writeFileSync(tempPath, 'DATABASE_URL=postgres://user:pass@db:5432/db\nADMIN_SECRET=123456');

      const audit = auditEnvFile(tempPath);
      expect(audit.isSafe).toBe(false);
      expect(audit.violations.length).toBe(2);
      expect(audit.violations[0].reason).toContain('High-risk un-prefixed variable');

      fs.unlinkSync(tempPath);
    });

    it('rejects VITE_ prefixed variables that expose administrative secrets', () => {
      const tempPath = '/tmp/test_vite_admin.env';
      const fs = require('fs');
      fs.writeFileSync(tempPath, 'VITE_ADMIN_SECRET_KEY=leaked_master_admin_token');

      const audit = auditEnvFile(tempPath);
      expect(audit.isSafe).toBe(false);
      expect(audit.violations[0].reason).toContain('exposes administrative secret');

      fs.unlinkSync(tempPath);
    });

    it('approves clean safe client variables with VITE_ prefix', () => {
      const tempPath = '/tmp/test_safe.env';
      const fs = require('fs');
      fs.writeFileSync(
        tempPath, 
        'VITE_FIREBASE_API_KEY=AIzaSyA_samplePublic1234567\nVITE_FIREBASE_PROJECT_ID=progressive-foods\nVITE_PUBLIC_STORE_NAME=Progressive'
      );

      const audit = auditEnvFile(tempPath);
      expect(audit.isSafe).toBe(true);
      expect(audit.violations.length).toBe(0);

      fs.unlinkSync(tempPath);
    });
  });

  // ============================================================================
  // 2. DATA PRIVACY & CONSENT UI (JDPA READY)
  // ============================================================================
  describe('2. Data Privacy & Consent UI (JDPA Ready)', () => {
    it('renders lightweight Privacy & Terms modal highlighting data minimization', () => {
      render(<PrivacyTermsModal isOpen={true} onClose={vi.fn()} />);

      // Verify JDPA Compliance badge and Data Minimization heading
      expect(screen.getByText(/JDPA 2020 Compliant/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Minimization Standard/i)).toBeInTheDocument();

      // Verify explicit data minimization disclosures (Phone & Loyalty ID only)
      expect(screen.getByText(/Phone Number:/i)).toBeInTheDocument();
      expect(screen.getByText(/Loyalty Member ID:/i)).toBeInTheDocument();

      // Verify what is never collected
      expect(screen.getByText(/What We Never Collect or Store/i)).toBeInTheDocument();
      expect(screen.getByText(/No payment card information/i)).toBeInTheDocument();
      expect(screen.getByText(/no device GPS location tracking/i)).toBeInTheDocument();
    });

    it('provides Privacy & Terms modal trigger from LoyaltyOnboardingScreen', () => {
      render(
        <LoyaltyOnboardingScreen
          selectedStore={{ name: 'Progressive Portmore' }}
          onSelectStore={vi.fn()}
          onLinkSuccess={vi.fn()}
          onSkip={vi.fn()}
        />
      );

      const privacyBtn = document.getElementById('onboarding-privacy-btn');
      expect(privacyBtn).toBeInTheDocument();

      fireEvent.click(privacyBtn);
      expect(screen.getByText(/Privacy & Data Consent/i)).toBeInTheDocument();
      expect(screen.getByText(/Data Minimization Standard/i)).toBeInTheDocument();
    });

    it('provides Privacy & Terms modal trigger and Unlink Card & Clear Data in UserProfileModal', () => {
      const mockUnlink = vi.fn();
      localStorage.setItem('cached_token', 'jwt_sample_token_xyz');
      sessionStorage.setItem('session_scan_history', 'barcode_123');

      render(
        <UserProfileModal
          isOpen={true}
          onClose={vi.fn()}
          mode="customer"
          isCardLinked={true}
          linkedCardNumber="231791"
          memberName="Ricardo Campbell"
          onUnlinkCard={mockUnlink}
        />
      );

      // Verify Privacy & Terms trigger in profile settings
      const privacyBtn = document.getElementById('profile-privacy-modal-btn');
      expect(privacyBtn).toBeInTheDocument();

      // Verify Unlink Card & Clear Data action button
      const unlinkBtn = document.getElementById('unlink-card-clear-data-btn');
      expect(unlinkBtn).toBeInTheDocument();

      // Execute Unlink Card & Clear Data action
      fireEvent.click(unlinkBtn);

      // Verify local and session storage are wiped (JDPA data erasure right)
      expect(localStorage.getItem('cached_token')).toBeNull();
      expect(sessionStorage.getItem('session_scan_history')).toBeNull();
      expect(mockUnlink).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================================
  // 3. OFFLINE CACHING & QUERY OPTIMIZATION
  // ============================================================================
  describe('3. Offline Caching & Query Optimization', () => {
    it('initializes Firestore with persistent local cache support', () => {
      expect(db).toBeDefined();
      const firestoreInstance = createConfiguredFirestore(app);
      expect(firestoreInstance).toBeDefined();
    });
  });

  // ============================================================================
  // 4. TELEMETRY PII SCRUBBING
  // ============================================================================
  describe('4. Telemetry PII Scrubbing', () => {
    it('masks Jamaican and international phone numbers from error strings', () => {
      const input = 'Failed to send SMS OTP to +1 (876) 555-0192 during checkout';
      const scrubbed = scrubPIIFromString(input);
      expect(scrubbed).not.toContain('+1 (876) 555-0192');
      expect(scrubbed).toContain('[PHONE_REDACTED]');
    });

    it('masks customer email addresses from error strings', () => {
      const input = 'User authentication rejected for ricardo.campbell@email.com at Portmore';
      const scrubbed = scrubPIIFromString(input);
      expect(scrubbed).not.toContain('ricardo.campbell@email.com');
      expect(scrubbed).toContain('[EMAIL_REDACTED]');
    });

    it('masks loyalty Member IDs and Card Numbers from error strings', () => {
      const input = 'Barcode scanner lookup timeout for member MEM-482-910-33 on card 231791';
      const scrubbed = scrubPIIFromString(input);
      expect(scrubbed).not.toContain('MEM-482-910-33');
      expect(scrubbed).not.toContain('231791');
      expect(scrubbed).toContain('[MEMBER_ID_REDACTED]');
      expect(scrubbed).toContain('[CARD_NUM_REDACTED]');
    });

    it('recursively scrubs complex Error objects and context metadata', () => {
      const err = new Error('Database write denied for ricardo.campbell@email.com (+1 876 555 0192)');
      const context = {
        userPhone: '+1 (876) 555-0192',
        userEmail: 'customer@progressive.com.jm',
        memberId: 'MEM-482-910-33',
        authSecretKey: 'AIzaSyA_secretKeyExample123456789'
      };

      const telemetryReport = captureScrubbedError(err, context);

      expect(telemetryReport.error.message).toContain('[EMAIL_REDACTED]');
      expect(telemetryReport.error.message).toContain('[PHONE_REDACTED]');
      expect(telemetryReport.context.userPhone).toBe('[PHONE_REDACTED]');
      expect(telemetryReport.context.userEmail).toBe('[EMAIL_REDACTED]');
      expect(telemetryReport.context.memberId).toBe('[MEMBER_ID_REDACTED]');
      expect(telemetryReport.context.authSecretKey).toBe('[TOKEN_REDACTED]');
    });
  });

});
