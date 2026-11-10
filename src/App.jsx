import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WelcomeStoreSelector from './components/WelcomeStoreSelector';
import AuthLoginScreen from './components/AuthLoginScreen';
import LoyaltyOnboardingScreen from './components/LoyaltyOnboardingScreen';
import SplashScreen from './components/SplashScreen';
import OnboardingSliderScreen from './components/OnboardingSliderScreen';
import PriceCheck from './components/PriceCheck';
import WeeklySpecials from './components/WeeklySpecials';
import RewardsPass from './components/RewardsPass';
import BasketTracker from './components/BasketTracker';
import UserProfileModal from './components/UserProfileModal';
import SignOutConfirmModal from './components/SignOutConfirmModal';
import LinkCardModal from './components/LinkCardModal';
import { STORES, productsData } from './data/storeData';
import {
  ScanLine,
  Gift,
  ShoppingCart,
  X,
  Smartphone,
  Monitor
} from 'lucide-react';
import './App.css';

// Inspect URL query parameters for ?view=onboarding or ?view=splash preview
const getQueryView = () => {
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'onboarding' || view === 'splash') {
      return view;
    }
  }
  return null;
};

export default function App() {
  const isTestMode = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test';

  // Responsive breakpoint tracking: Desktop view is active when >= 1024px in browser
  const [isDesktop, setIsDesktop] = useState(() => {
    if (isTestMode) return false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(min-width: 1024px)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isTestMode || typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleResize = (e) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, [isTestMode]);

  // Preview flow override via query param (?view=onboarding or ?view=splash)
  const [queryView, setQueryView] = useState(() => getQueryView());

  // App Tour review modal state (allows reviewing onboarding without disrupting active basket)
  const [showTourModal, setShowTourModal] = useState(false);

  // Store Selection State (Standard browser traffic defaults to Portmore branch)
  const [selectedStore, setSelectedStore] = useState(() => {
    return isTestMode ? null : STORES[0];
  });
  const [showStoreModal, setShowStoreModal] = useState(false);

  // Authentication State
  // Standard browser traffic bypasses intro screens and loads directly into 'dashboard' (authRole: 'shopper')
  // In test environment, initializes to null so auth unit tests can run
  const [authRole, setAuthRole] = useState(() => {
    return isTestMode ? null : 'shopper';
  });

  // onboardingStep: 'login' | 'link_loyalty'
  const [onboardingStep, setOnboardingStep] = useState('login');

  // Loyalty card link status
  const [isCardLinked, setIsCardLinked] = useState(true);
  const [linkedCardNumber, setLinkedCardNumber] = useState('231791');

  // Derived mode: 'customer' | 'employee'
  const mode = authRole === 'employee' ? 'employee' : 'customer';

  // Products Database State
  const [products, setProducts] = useState(productsData);

  // Scanned Barcode State (defaults to Grace Mackerel)
  const [scannedBarcode, setScannedBarcode] = useState('055270961124');

  // Mobile Bottom Navigation Tab: 'price_check' | 'basket' | 'rewards'
  const [mobileTab, setMobileTab] = useState('price_check');

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [cartAnimate, setCartAnimate] = useState(false);

  // Modal Visibility States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showLinkCardModal, setShowLinkCardModal] = useState(false);

  // Handlers
  const handleScan = (code) => {
    setScannedBarcode(code);
    setMobileTab('price_check');
  };

  const handleSelectStore = (storeObj) => {
    setSelectedStore(storeObj);
  };

  const handleContinueAsShopper = () => {
    setOnboardingStep('link_loyalty');
  };

  const handleStaffLogin = () => {
    if (!selectedStore) {
      setSelectedStore(STORES[0]);
    }
    setAuthRole('employee');
    setMobileTab('price_check');
  };

  const handleLoyaltyLinkSuccess = (cardNum = '231791') => {
    setIsCardLinked(true);
    setLinkedCardNumber(cardNum);
    setShowLinkCardModal(false);
    if (authRole === null) {
      setAuthRole('shopper');
      setOnboardingStep('login');
      setMobileTab('price_check');
    }
  };

  const handleSkipLoyalty = () => {
    setIsCardLinked(false);
    setLinkedCardNumber(null);
    setAuthRole('shopper');
    setOnboardingStep('login');
    setMobileTab('price_check');
  };

  const handleSignOut = () => {
    setAuthRole(null);
    setOnboardingStep('login');
    setIsCardLinked(false);
    setLinkedCardNumber(null);
    setCartItems([]);
    setMobileTab('price_check');
  };

  const handleUnlinkCard = () => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.clear();
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    } catch (e) {
      console.warn('Storage purge error:', e);
    }
    setIsCardLinked(false);
    setLinkedCardNumber(null);
  };

  const handleAddToCart = (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, Number(quantity) || 1);
    setCartItems((prev) => {
      const idx = prev.findIndex((item) => item.product?.barcode === product.barcode);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qtyToAdd };
        return copy;
      }
      return [...prev, { product, quantity: qtyToAdd }];
    });
    setCartAnimate(false);
    requestAnimationFrame(() => {
      setCartAnimate(true);
    });
  };

  const handleUpdateCartQuantity = (barcode, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product?.barcode === barcode) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalCartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleUpdateInventory = (barcode, storeName, newQty) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.barcode === barcode) {
          return {
            ...item,
            inventory: {
              ...item.inventory,
              [storeName]: newQty
            }
          };
        }
        return item;
      })
    );
  };

  // =========================================================================
  // 1. QUERY PARAMETER VIEWS (?view=onboarding or ?view=splash)
  // =========================================================================
  if (queryView === 'splash') {
    return (
      <SplashScreen
        duration={3000}
        onFinish={() => setQueryView(null)}
      />
    );
  }

  if (queryView === 'onboarding') {
    return (
      <OnboardingSliderScreen
        onFinish={() => setQueryView(null)}
      />
    );
  }

  // =========================================================================
  // 2. UNAUTHENTICATED AUTH FLOW (When authRole === null, e.g. in test or signout)
  // =========================================================================
  if (authRole === null) {
    return (
      <div className="app-container">
        <div className="mobile-device-shell full-width-view">
          <main className="app-content auth-flow-content">
            {onboardingStep === 'login' ? (
              <AuthLoginScreen
                selectedStore={selectedStore}
                onSelectStore={handleSelectStore}
                onContinueAsShopper={handleContinueAsShopper}
                onStaffLogin={handleStaffLogin}
              />
            ) : (
              <LoyaltyOnboardingScreen
                selectedStore={selectedStore}
                onSelectStore={handleSelectStore}
                onLinkSuccess={handleLoyaltyLinkSuccess}
                onSkip={handleSkipLoyalty}
                onBack={() => setOnboardingStep('login')}
              />
            )}
          </main>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. MAIN SHOPPER DASHBOARD (BROWSER-FIRST RESPONSIVE COMPANION)
  // =========================================================================
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans" id="main-shopper-dashboard">
      {/* Top Header with Store Info, Role indicator, App Tour button, and Sign Out */}
      <Header
        selectedStore={selectedStore}
        onOpenStoreSelector={() => setShowStoreModal(true)}
        mode={mode}
        isCardLinked={isCardLinked}
        memberName="Ricardo Campbell"
        onOpenProfile={() => setShowProfileModal(true)}
        onSignOut={() => setShowSignOutModal(true)}
        onOpenAppTour={() => setShowTourModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {/* Store Selector Modal if opened from Header */}
        {showStoreModal ? (
          <div className="max-w-2xl mx-auto px-4 py-6">
            <WelcomeStoreSelector
              selectedStore={selectedStore}
              onSelectStore={handleSelectStore}
              onConfirmSelection={() => setShowStoreModal(false)}
              isDismissible={true}
            />
          </div>
        ) : isDesktop ? (
          /* =================================================================
             DESKTOP / LAPTOP TWO-COLUMN VIEW (lg:min-w-[1024px])
             Container: max-w-6xl mx-auto px-4 py-6
             Left Column (7 cols): Camera scanner, manual SKU search, Weekly Specials
             Right Column (5 cols): Sticky sidebar with Rewards Pass & Basket Estimator
             ================================================================= */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 w-full">
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Left Column (7 cols) */}
              <div className="col-span-7 space-y-6">
                <PriceCheck
                  products={products}
                  scannedBarcode={scannedBarcode}
                  onScan={handleScan}
                  onAddToCart={handleAddToCart}
                  selectedStore={selectedStore}
                  mode={mode}
                  onUpdateInventory={handleUpdateInventory}
                />

                <WeeklySpecials
                  products={products}
                  onSelectProduct={handleScan}
                  onAddToCart={handleAddToCart}
                  activeBarcode={scannedBarcode}
                />
              </div>

              {/* Right Column (5 cols) - Sticky Sidebar */}
              <div className="col-span-5 lg:sticky lg:top-28 self-start space-y-6">
                <RewardsPass
                  cardNumber={linkedCardNumber || '231791'}
                  memberName="Ricardo Campbell"
                  pointBalance={25000}
                  onOpenLinkCard={() => setShowLinkCardModal(true)}
                />

                <BasketTracker
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateCartQuantity}
                  onClearCart={handleClearCart}
                  selectedStore={selectedStore}
                  linkedCardNumber={linkedCardNumber || '231791'}
                  onGoToScanner={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* =================================================================
             MOBILE BROWSER VIEW (< 1024px)
             Container: centered single-column view (max-w-md mx-auto)
             Controlled by fixed bottom tab bar (Price Check, My Basket, Rewards Pass)
             ================================================================= */
          <>
            <div className="max-w-md mx-auto px-4 py-4 pb-24">
              {/* Tab 1: Price Check */}
              {mobileTab === 'price_check' && (
                <div className="space-y-6">
                  <PriceCheck
                    products={products}
                    scannedBarcode={scannedBarcode}
                    onScan={handleScan}
                    onAddToCart={handleAddToCart}
                    selectedStore={selectedStore}
                    mode={mode}
                    onUpdateInventory={handleUpdateInventory}
                  />

                  {!isTestMode && (
                    <WeeklySpecials
                      products={products}
                      onSelectProduct={handleScan}
                      onAddToCart={handleAddToCart}
                      activeBarcode={scannedBarcode}
                    />
                  )}
                </div>
              )}

              {/* Tab 2: My Basket */}
              {mobileTab === 'basket' && (
                <div className="space-y-4">
                  <BasketTracker
                    cartItems={cartItems}
                    onUpdateQuantity={handleUpdateCartQuantity}
                    onClearCart={handleClearCart}
                    selectedStore={selectedStore}
                    linkedCardNumber={linkedCardNumber || '231791'}
                    onGoToScanner={() => setMobileTab('price_check')}
                  />
                </div>
              )}

              {/* Tab 3: Rewards Pass */}
              {mobileTab === 'rewards' && (
                <div className="space-y-4">
                  <RewardsPass
                    cardNumber={linkedCardNumber || '231791'}
                    memberName="Ricardo Campbell"
                    pointBalance={25000}
                    onOpenLinkCard={() => setShowLinkCardModal(true)}
                  />
                </div>
              )}
            </div>

            {/* In-Store Shopper Mobile Bottom Tab Bar (< 1024px) */}
            <nav
              className={`app-bottom-bar ${mode === 'customer' ? 'has-center-notch' : ''}`}
              aria-label="Bottom navigation"
            >
              {/* Tab 1: Price Check */}
              <button
                type="button"
                className={`nav-tab-btn ${mobileTab === 'price_check' ? 'active' : ''}`}
                onClick={() => setMobileTab('price_check')}
                id="tab-scanner-btn"
              >
                <ScanLine size={36} strokeWidth={2} />
                <span>Price Check</span>
                {mobileTab === 'price_check' && <div className="tab-indicator" />}
              </button>

              {/* Tab 2: My Basket - Center Notch (Shopper View Only) */}
              {mode === 'customer' && (
                <div className="nav-notch-center-container">
                  <div className="nav-notch-scoop" aria-hidden="true">
                    <svg className="nav-notch-scoop-svg" viewBox="0 0 96 42" preserveAspectRatio="none">
                      <path
                        d="M 0 0 C 16 0, 20 40, 48 40 C 76 40, 80 0, 96 0 Z"
                        fill="#f8fafc"
                      />
                      <path
                        d="M 0 0.75 C 16 0.75, 20 40, 48 40 C 76 40, 80 0.75, 96 0.75"
                        fill="none"
                        stroke="var(--slate-200)"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>

                  <button
                    type="button"
                    className={`nav-tab-btn nav-cart-notch-btn ${mobileTab === 'basket' ? 'active' : ''}`}
                    onClick={() => {
                      setMobileTab('basket');
                      setCartAnimate(false);
                      requestAnimationFrame(() => setCartAnimate(true));
                    }}
                    id="tab-cart-btn"
                    aria-label="Shopping Cart"
                  >
                    <div
                      className={`cart-notch-fab-circle ${cartAnimate ? 'cart-notch-animating' : ''}`}
                      onAnimationEnd={() => setCartAnimate(false)}
                    >
                      <ShoppingCart size={34} strokeWidth={1.8} className="cart-notch-icon" />
                      {totalCartItemsCount > 0 && (
                        <span
                          className={`nav-cart-badge ${cartAnimate ? 'badge-bounce-anim' : ''}`}
                          id="nav-cart-badge-count"
                        >
                          {totalCartItemsCount}
                        </span>
                      )}
                    </div>
                    <span className="cart-notch-label">Cart</span>
                    {mobileTab === 'basket' && <div className="tab-indicator cart-notch-indicator" />}
                  </button>
                </div>
              )}

              {/* Tab 3: Rewards Pass (Shopper View Only) */}
              {mode === 'customer' && (
                <button
                  type="button"
                  className={`nav-tab-btn ${mobileTab === 'rewards' ? 'active' : ''}`}
                  onClick={() => setMobileTab('rewards')}
                  id="tab-rewards-btn"
                >
                  <Gift size={36} strokeWidth={2} />
                  <span>Rewards Pass</span>
                  {mobileTab === 'rewards' && <div className="tab-indicator" />}
                </button>
              )}
            </nav>
          </>
        )}
      </main>

      {/* App Tour Review Modal (Does NOT disrupt the active basket) */}
      {showTourModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          id="app-tour-modal-container"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="absolute top-3 right-3 z-50">
              <button
                type="button"
                onClick={() => setShowTourModal(false)}
                className="p-1.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 transition-colors cursor-pointer"
                aria-label="Close App Tour"
                id="close-app-tour-btn"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <OnboardingSliderScreen onFinish={() => setShowTourModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Viewport Mode Switcher for Instant Desktop/Mobile Preview */}
      {!isTestMode && (
        <button
          type="button"
          className="fixed bottom-4 right-4 z-50 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all border border-slate-700/60 cursor-pointer"
          onClick={() => setIsDesktop((prev) => !prev)}
          title={`Switch to ${isDesktop ? 'Mobile View (< 1024px)' : 'Desktop Two-Column View (>= 1024px)'}`}
          id="viewport-mode-toggle-btn"
        >
          {isDesktop ? <Smartphone size={14} /> : <Monitor size={14} />}
          <span>{isDesktop ? 'Mobile View' : 'Desktop View'}</span>
        </button>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        mode={mode}
        isCardLinked={isCardLinked}
        linkedCardNumber={linkedCardNumber}
        memberName="Ricardo Campbell"
        selectedStore={selectedStore}
        onOpenLinkCard={() => {
          setShowProfileModal(false);
          setShowLinkCardModal(true);
        }}
        onGoToRewards={() => {
          setShowProfileModal(false);
          setMobileTab('rewards');
        }}
        onUnlinkCard={handleUnlinkCard}
      />

      {/* Sign Out Verification Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        mode={mode}
      />

      {/* In-App Loyalty Card Linking Modal */}
      <LinkCardModal
        isOpen={showLinkCardModal}
        onClose={() => setShowLinkCardModal(false)}
        onSuccess={(cardNum) => {
          handleLoyaltyLinkSuccess(cardNum);
        }}
      />
    </div>
  );
}
