import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoyaltyRewardsTab from './components/LoyaltyRewardsTab';
import ProductResultCard from './components/ProductResultCard';

describe('In-Store Operator Optical Scanning Safeguards & Cashier Fallbacks', () => {

  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    // Mock navigator.wakeLock
    Object.assign(navigator, {
      wakeLock: {
        request: vi.fn().mockResolvedValue({
          release: vi.fn().mockResolvedValue(undefined),
          addEventListener: vi.fn()
        })
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // 1. OPTICAL READABILITY & QUIET ZONE PADDING
  // ============================================================================
  describe('1. Optical Readability & Quiet Zone Padding', () => {
    it('renders barcode container on pure white background (#FFFFFF) with minimum 24px quiet zone', () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      const quietZoneContainer = document.getElementById('optical-scan-container');
      expect(quietZoneContainer).toBeInTheDocument();

      // Verify pure white background and 24px padding (quiet zone)
      expect(quietZoneContainer).toHaveStyle({ backgroundColor: '#FFFFFF' });
      expect(quietZoneContainer).toHaveStyle({ padding: '24px' });
      expect(quietZoneContainer.className).toContain('p-6'); // Tailwind 24px utility class
    });

    it('requests Screen Wake Lock on mount to keep display awake at checkout', async () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen');
      expect(document.getElementById('wake-lock-status-badge')).toBeInTheDocument();
      expect(screen.getByText(/Display Awake Active|Screen Wake Lock/i)).toBeInTheDocument();
    });

    it('toggles high-contrast brightness mode for low-light checkout lanes', () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      const toggleBtn = document.getElementById('high-contrast-toggle-btn');
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

      // Click to enable high contrast
      fireEvent.click(toggleBtn);
      expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText(/High-Contrast ON/i)).toBeInTheDocument();

      const container = document.getElementById('optical-scan-container');
      expect(container.className).toContain('border-black');
    });
  });

  // ============================================================================
  // 2. DUAL BARCODE FORMAT TOGGLE (1D & 2D QR)
  // ============================================================================
  describe('2. Dual Barcode Format Toggle (1D & 2D QR)', () => {
    it('defaults to rendering standard 1D linear barcode (Code 128)', () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      const btn1D = document.getElementById('barcode-format-1d-btn');
      const btn2D = document.getElementById('barcode-format-2d-btn');

      expect(btn1D).toHaveAttribute('aria-selected', 'true');
      expect(btn2D).toHaveAttribute('aria-selected', 'false');

      // 1D Code 128 linear barcode is rendered
      expect(document.getElementById('rendered-1d-barcode-svg')).toBeInTheDocument();
      expect(document.getElementById('rendered-2d-qr-svg')).not.toBeInTheDocument();
    });

    it('flips to 2D QR code format when 2D tab is clicked and back to 1D', () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      const btn1D = document.getElementById('barcode-format-1d-btn');
      const btn2D = document.getElementById('barcode-format-2d-btn');

      // Click 2D QR Code toggle
      fireEvent.click(btn2D);
      expect(btn2D).toHaveAttribute('aria-selected', 'true');
      expect(btn1D).toHaveAttribute('aria-selected', 'false');
      expect(document.getElementById('rendered-2d-qr-svg')).toBeInTheDocument();
      expect(document.getElementById('rendered-1d-barcode-svg')).not.toBeInTheDocument();

      // Click back to 1D Code 128
      fireEvent.click(btn1D);
      expect(btn1D).toHaveAttribute('aria-selected', 'true');
      expect(document.getElementById('rendered-1d-barcode-svg')).toBeInTheDocument();
      expect(document.getElementById('rendered-2d-qr-svg')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // 3. HIGH-LEGIBILITY MANUAL FALLBACK
  // ============================================================================
  describe('3. High-Legibility Manual Fallback', () => {
    it('displays spaced high-contrast monospace member ID directly beneath barcode', () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      const memberIdEl = document.getElementById('manual-fallback-member-id');
      expect(memberIdEl).toBeInTheDocument();
      expect(memberIdEl).toHaveTextContent('MEM-482-910-33');
      expect(memberIdEl.className).toContain('font-mono');
      expect(memberIdEl.className).toContain('tracking-');
    });

    it('provides tap-to-copy interaction with visual feedback toast', async () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      const copyBtn = document.getElementById('manual-member-id-copy-btn');
      expect(copyBtn).toBeInTheDocument();

      fireEvent.click(copyBtn);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('MEM-482-910-33');
      expect(await screen.findByText(/Copied!/i)).toBeInTheDocument();
    });

    it('provides 180° orientation flip toggle for cashier reading across counter', () => {
      render(<LoyaltyRewardsTab isLinked={true} cardNumber="231791" />);

      const flipBtn = document.getElementById('cashier-flip-btn');
      expect(flipBtn).toBeInTheDocument();
      expect(screen.getByText(/Flip for Cashier \(180°\)/i)).toBeInTheDocument();

      const fallbackSection = document.getElementById('cashier-fallback-section');
      expect(fallbackSection.className).not.toContain('rotate-180');

      // Click flip button
      fireEvent.click(flipBtn);
      expect(fallbackSection.className).toContain('rotate-180');
      expect(screen.getByText(/Normal View/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // 4. IN-STORE PRICE SYNC & DISCREPANCY NOTICES
  // ============================================================================
  describe('4. In-Store Price Sync & Discrepancy Notices', () => {
    const mockProduct = {
      barcode: '055270961124',
      name: 'Grace Mackerel in Tomato Sauce 5.5oz',
      price: 285.00,
      wholesaleCost: 210.00,
      category: 'Canned Goods',
      brand: 'Grace',
      unit: '5.5oz can'
    };

    it('renders catalog verification freshness timestamp badge on Price Check modal', () => {
      render(
        <ProductResultCard
          product={mockProduct}
          mode="customer"
          selectedStore={{ name: 'Progressive Portmore' }}
        />
      );

      const timestampBadge = document.getElementById('catalog-verified-badge');
      expect(timestampBadge).toBeInTheDocument();
      expect(timestampBadge).toHaveTextContent(/Catalog verified: Today, 8:00 AM/i);
    });

    it('renders policy microcopy stating final pricing and discounts are confirmed at the register', () => {
      render(
        <ProductResultCard
          product={mockProduct}
          mode="customer"
          selectedStore={{ name: 'Progressive Portmore' }}
        />
      );

      const notice = document.getElementById('price-discrepancy-notice');
      expect(notice).toBeInTheDocument();
      expect(screen.getByText(/Final pricing and promotional discounts are confirmed at the register\./i)).toBeInTheDocument();
    });
  });

});
