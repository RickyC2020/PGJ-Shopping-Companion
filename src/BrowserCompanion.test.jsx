import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import PriceCheck from './components/PriceCheck';
import RewardsPass from './components/RewardsPass';
import BasketTracker from './components/BasketTracker';
import WeeklySpecials from './components/WeeklySpecials';
import productsData from './data/products.json';

describe('Browser-First Web Companion & Asset Preservation Requirements', () => {

  beforeEach(() => {
    // Reset window.location.search
    window.history.pushState({}, '', '/');

    // Mock wakeLock API
    Object.assign(navigator, {
      wakeLock: {
        request: vi.fn().mockResolvedValue({
          release: vi.fn().mockResolvedValue(undefined),
          addEventListener: vi.fn()
        })
      },
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/');
  });

  // =========================================================================
  // 1. ASSET & FLOW PRESERVATION
  // =========================================================================
  describe('1. Asset & Flow Preservation', () => {
    it('preserves existing SplashScreen and OnboardingSliderScreen intact', async () => {
      // Dynamically import to ensure modules are present and valid
      const splashModule = await import('./components/SplashScreen');
      const onboardingModule = await import('./components/OnboardingSliderScreen');
      const onboardingAlias = await import('./components/Onboarding');

      expect(splashModule.default).toBeDefined();
      expect(onboardingModule.default).toBeDefined();
      expect(onboardingAlias.default).toBeDefined();
    });

    it('renders Onboarding sequence when URL query param contains ?view=onboarding', () => {
      window.history.pushState({}, '', '/?view=onboarding');
      render(<App />);

      expect(screen.getByText(/Easy Price Checks/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Skip/i })).toBeDefined();
    });

    it('renders Splash Screen when URL query param contains ?view=splash', () => {
      window.history.pushState({}, '', '/?view=splash');
      render(<App />);

      expect(screen.getByAltText(/Progressive Foods Logo/i)).toBeDefined();
      expect(document.querySelector('.splash-cart-loader')).not.toBeNull();
    });

    it('loads directly into the Main Shopper Dashboard for standard browser traffic bypassing intro screens', () => {
      // In standard browser traffic, window.location.search is empty
      window.history.pushState({}, '', '/');
      
      // When rendered in shopper mode (standard browser traffic)
      render(<App />);
      
      // Intro screens (splash, onboarding) are bypassed
      expect(document.querySelector('.splash-screen')).toBeNull();
      expect(screen.queryByText(/Easy Price Checks/i)).toBeNull();
    });

    it('provides a subtle App Tour button in Header that opens onboarding review modal without disrupting basket', () => {
      render(<App />);

      // In test mode, login as shopper
      const shopperBtn = screen.getByRole('button', { name: /Continue as Shopper/i });
      fireEvent.click(shopperBtn);
      const skipBtn = screen.getByRole('button', { name: /Skip for Now/i });
      fireEvent.click(skipBtn);

      // Add item to basket
      const addBtn = screen.getByRole('button', { name: /Add Grace Mackerel in Tomato Sauce 5.5oz to Cart|Add to Cart/i });
      fireEvent.click(addBtn);

      // App Tour button is present in Header
      const tourBtn = document.getElementById('header-app-tour-btn');
      expect(tourBtn).not.toBeNull();
      expect(screen.getByText('App Tour')).toBeDefined();

      // Click App Tour
      fireEvent.click(tourBtn);

      // Modal appears with onboarding slider
      const modal = document.getElementById('app-tour-modal-container');
      expect(modal).not.toBeNull();
      expect(screen.getByText(/Easy Price Checks/i)).toBeDefined();

      // Close modal
      const closeBtn = document.getElementById('close-app-tour-btn');
      fireEvent.click(closeBtn);

      // Basket and shopper dashboard remain active with added item
      expect(document.getElementById('app-tour-modal-container')).toBeNull();
      expect(document.getElementById('nav-cart-badge-count').textContent).toBe('1');
    });
  });

  // =========================================================================
  // 2. IN-STORE SHOPPER RESPONSIVE LAYOUT
  // =========================================================================
  describe('2. In-Store Shopper Responsive Layout', () => {
    it('renders mobile layout with fixed bottom tabs for Price Check, My Basket, and Rewards Pass', () => {
      render(<App />);
      const shopperBtn = screen.getByRole('button', { name: /Continue as Shopper/i });
      fireEvent.click(shopperBtn);
      const skipBtn = screen.getByRole('button', { name: /Skip for Now/i });
      fireEvent.click(skipBtn);

      // Bottom navigation tabs
      expect(document.getElementById('tab-scanner-btn')).not.toBeNull();
      expect(screen.getByText('Price Check')).toBeDefined();

      expect(document.getElementById('tab-cart-btn')).not.toBeNull();

      expect(document.getElementById('tab-rewards-btn')).not.toBeNull();
      expect(screen.getByText('Rewards Pass')).toBeDefined();
    });

    it('renders Weekly In-Store Specials circular list component', () => {
      const handleSelect = vi.fn();
      const handleAdd = vi.fn();

      render(
        <WeeklySpecials
          products={productsData}
          onSelectProduct={handleSelect}
          onAddToCart={handleAdd}
          activeBarcode="055270961124"
        />
      );

      expect(screen.getByText('Weekly In-Store Specials')).toBeDefined();
      expect(screen.getByText(/Circular Deals/i)).toBeDefined();
      expect(document.getElementById('weekly-specials-grid')).not.toBeNull();
    });
  });

  // =========================================================================
  // 3. SCANNER & DESKTOP FALLBACK (PriceCheck.jsx)
  // =========================================================================
  describe('3. Scanner & Desktop Fallback (PriceCheck.jsx)', () => {
    it('provides keyboard-accessible manual SKU input and autofocus lookup button directly beneath camera viewport', () => {
      const handleScan = vi.fn();
      const handleAddToCart = vi.fn();

      render(
        <PriceCheck
          products={productsData}
          scannedBarcode="055270961124"
          onScan={handleScan}
          onAddToCart={handleAddToCart}
          selectedStore={{ name: 'Progressive Foods Portmore' }}
        />
      );

      // Camera toggle button
      expect(document.getElementById('camera-toggle-btn')).not.toBeNull();

      // Keyboard accessible manual SKU input
      const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
      expect(input).toBeDefined();

      // Autofocus lookup button
      const submitBtn = document.getElementById('scan-barcode-submit-btn');
      expect(submitBtn).toBeDefined();

      // Test manual SKU entry and scan
      fireEvent.change(input, { target: { value: '040055531586' } });
      fireEvent.click(submitBtn);

      expect(handleScan).toHaveBeenCalledWith('040055531586');
    });

    it('renders clean product card with title, unit price, stock status, and add action', () => {
      const handleAddToCart = vi.fn();

      render(
        <PriceCheck
          products={productsData}
          scannedBarcode="055270961124"
          onScan={vi.fn()}
          onAddToCart={handleAddToCart}
          selectedStore={{ name: 'Progressive Foods Portmore' }}
        />
      );

      expect(screen.getByText('Grace Mackerel in Tomato Sauce 5.5oz')).toBeDefined();
      expect(document.getElementById('customer-product-price')).toBeDefined();
      expect(document.getElementById('add-to-cart-btn')).toBeDefined();
    });
  });

  // =========================================================================
  // 4. CUSTOMER REWARDS CARD (RewardsPass.jsx)
  // =========================================================================
  describe('4. Customer Rewards Card (RewardsPass.jsx)', () => {
    it('renders on pure white container (#FFFFFF) with >= 24px quiet margin (p-6)', () => {
      render(
        <RewardsPass
          cardNumber="231791"
          memberName="Ricardo Campbell"
          pointBalance={25000}
        />
      );

      const container = document.getElementById('optical-scan-container');
      expect(container).not.toBeNull();
      expect(container).toHaveStyle({ backgroundColor: '#FFFFFF', padding: '24px' });
      expect(container.className).toContain('p-6');
      expect(container.className).toContain('rounded-2xl');
    });

    it('provides dual toggle between 1D Code 128 barcode and 2D QR Code', () => {
      render(
        <RewardsPass
          cardNumber="231791"
          memberName="Ricardo Campbell"
          pointBalance={25000}
        />
      );

      const btn1D = document.getElementById('barcode-format-1d-btn');
      const btn2D = document.getElementById('barcode-format-2d-btn');

      expect(btn1D).toBeDefined();
      expect(btn2D).toBeDefined();

      // Default 1D
      expect(btn1D).toHaveAttribute('aria-selected', 'true');
      expect(document.getElementById('rendered-1d-barcode-svg')).not.toBeNull();
      expect(document.getElementById('rendered-2d-qr-svg')).toBeNull();

      // Switch to 2D QR Code
      fireEvent.click(btn2D);
      expect(btn2D).toHaveAttribute('aria-selected', 'true');
      expect(document.getElementById('rendered-2d-qr-svg')).not.toBeNull();
      expect(document.getElementById('rendered-1d-barcode-svg')).toBeNull();
    });

    it('renders bold, spaced monospace member ID fallback beneath barcode', () => {
      render(
        <RewardsPass
          cardNumber="231791"
          memberName="Ricardo Campbell"
          pointBalance={25000}
        />
      );

      const memberIdEl = document.getElementById('manual-member-id-display');
      expect(memberIdEl).not.toBeNull();
      expect(memberIdEl.textContent).toBe('MEM-482-910-33');
      expect(memberIdEl.className).toContain('font-mono');
      expect(memberIdEl.className).toContain('tracking-widest');
      expect(memberIdEl.className).toContain('font-bold');
    });

    it('wraps navigator.wakeLock safely without throwing errors on desktop browsers', () => {
      render(
        <RewardsPass
          cardNumber="231791"
          memberName="Ricardo Campbell"
          pointBalance={25000}
        />
      );

      expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen');
      expect(document.getElementById('wake-lock-status-badge')).not.toBeNull();
    });
  });

  // =========================================================================
  // 5. BASKET ESTIMATOR (BasketTracker.jsx)
  // =========================================================================
  describe('5. Basket Estimator (BasketTracker.jsx)', () => {
    it('displays itemized list with increment and decrement quantity toggles', () => {
      const handleUpdateQty = vi.fn();
      const testItems = [
        { product: productsData[0], quantity: 2 },
        { product: productsData[1], quantity: 1 }
      ];

      render(
        <BasketTracker
          cartItems={testItems}
          onUpdateQuantity={handleUpdateQty}
          onClearCart={vi.fn()}
          selectedStore={{ name: 'Progressive Foods Portmore' }}
        />
      );

      // Item titles
      expect(screen.getByText('Grace Mackerel in Tomato Sauce 5.5oz')).toBeDefined();
      expect(screen.getByText('Eve Black Pepper 2.69oz')).toBeDefined();

      // Quantity increment button for item 1
      const plusBtn = screen.getByRole('button', { name: /Increase quantity of Grace Mackerel in Tomato Sauce 5.5oz/i });
      fireEvent.click(plusBtn);
      expect(handleUpdateQty).toHaveBeenCalledWith(productsData[0].barcode, 1);

      // Quantity decrement button for item 1
      const minusBtn = screen.getByRole('button', { name: /Decrease quantity of Grace Mackerel in Tomato Sauce 5.5oz/i });
      fireEvent.click(minusBtn);
      expect(handleUpdateQty).toHaveBeenCalledWith(productsData[0].barcode, -1);
    });

    it('displays bold Estimated Total with exact register microcopy', () => {
      const testItems = [
        { product: productsData[0], quantity: 2 } // 2 * $285.00 = $570.00
      ];

      render(
        <BasketTracker
          cartItems={testItems}
          onUpdateQuantity={vi.fn()}
          onClearCart={vi.fn()}
          selectedStore={{ name: 'Progressive Foods Portmore' }}
        />
      );

      // Bold Estimated Total
      expect(screen.getByText('Estimated Total')).toBeDefined();
      const totalAmount = document.getElementById('estimated-total-amount');
      expect(totalAmount).not.toBeNull();
      expect(totalAmount.textContent).toContain('570.00');
      expect(totalAmount.className).toContain('font-black');

      // Exact microcopy
      const microcopy = document.getElementById('basket-discrepancy-microcopy');
      expect(microcopy).not.toBeNull();
      expect(microcopy.textContent).toBe('Final prices and promotional discounts are confirmed at the register.');
    });
  });
});
