import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import App from './App';
import productsData from './data/products.json';
import { STORES, STORE_NAMES } from './data/storeData';

// Helper function to navigate into Shopper mode
const loginAsShopper = (linkCard = false) => {
  const shopperBtn = screen.getByRole('button', { name: /Continue as Shopper/i });
  fireEvent.click(shopperBtn);

  if (linkCard) {
    const cardInput = document.getElementById('manual-card-input');
    fireEvent.change(cardInput, { target: { value: '231791' } });
    const verifyBtn = document.getElementById('verify-card-btn');
    fireEvent.click(verifyBtn);
    // Fast-forward or trigger success callback if timeout
  } else {
    const skipBtn = screen.getByRole('button', { name: /Skip for Now/i });
    fireEvent.click(skipBtn);
  }
};

// Helper function to navigate into Staff mode
const loginAsStaff = (pin = '1234', storeName) => {
  const staffBtn = screen.getByRole('button', { name: /Staff Portal Login/i });
  fireEvent.click(staffBtn);

  if (storeName) {
    const storeSelect = document.getElementById('staff-store-select-dropdown');
    if (storeSelect) {
      fireEvent.change(storeSelect, { target: { value: storeName } });
    }
  }

  const pinInput = document.getElementById('staff-pin-input');
  fireEvent.change(pinInput, { target: { value: pin } });
  const submitBtn = document.getElementById('submit-staff-pin-btn');
  fireEvent.click(submitBtn);
};

// Helper function to sign out and confirm verification dialog
const triggerSignOut = () => {
  const signOutBtn = document.getElementById('header-signout-btn');
  if (signOutBtn) fireEvent.click(signOutBtn);
  const confirmBtn = document.getElementById('confirm-signout-btn');
  if (confirmBtn) fireEvent.click(confirmBtn);
};

describe('Progressive Foods Supermarket App Requirements', () => {

  it('Requirement 1: Verifies store dropdown is removed from Auth screen and available in onboarding and staff login with 5 branches', () => {
    render(<App />);

    // Select store dropdown is removed from welcome/login screen
    expect(screen.queryByLabelText(/^Select Store$/i)).toBeNull();

    // Check staff portal login has the 5 required Jamaican branches
    const staffBtn = screen.getByRole('button', { name: /Staff Portal Login/i });
    fireEvent.click(staffBtn);

    const dropdown = screen.getByLabelText(/Which store do you work\?/i);
    expect(dropdown).toBeDefined();

    const expectedStores = [
      "Progressive Foods Portmore",
      "Progressive Foods Ocho Rios",
      "Progressive Foods Mandeville",
      "Progressive Foods Fairview",
      "Progressive Foods Whitter Village"
    ];

    expectedStores.forEach(storeName => {
      expect(screen.getByRole('option', { name: storeName })).toBeDefined();
    });
  });

  it('Requirement 2: Mock JSON database contains the 9 specified Jamaican products with correct barcodes, prices & inventory', () => {
    expect(productsData).toHaveLength(9);

    const testProducts = [
      {
        barcode: "055270961124",
        name: "Grace Mackerel in Tomato Sauce 5.5oz",
        price: 285.00,
        portmoreStock: 45,
        ochoRiosStock: 0,
        category: "Canned Goods / Canned Seafood"
      },
      {
        barcode: "040055531586",
        name: "Eve Black Pepper 2.69oz",
        price: 300.00,
        portmoreStock: 0,
        ochoRiosStock: 34,
        category: "Herbs & Spices / Seasonings"
      },
      {
        barcode: "050196110717",
        name: "Simply Natural Coconut Oil 500ml",
        price: 540.00,
        portmoreStock: 34,
        category: "Oils & Vinegars"
      },
      {
        barcode: "8857131311916",
        name: "Kendel Whole Kernel Sweet Corn 15oz",
        price: 230.00,
        portmoreStock: 2,
        category: "Canned Goods / Canned Vegetables"
      },
      {
        barcode: "048848846329",
        name: "Caribbean Choice Baked beans in Tomato Sauce 14.11oz",
        price: 134.00,
        portmoreStock: 0,
        category: "Canned Goods"
      },
      {
        barcode: "05527085312",
        name: "Grace Chicken Vienna Sausages 140g",
        price: 134.00,
        portmoreStock: 2,
        category: "Canned Goods / Canned Meats"
      },
      {
        barcode: "066613703028",
        name: "Brunswick Tuna Flaked in Water 142g",
        price: 250.00,
        portmoreStock: 20,
        category: "Canned Goods / Canned Seafood"
      },
      {
        barcode: "033200011101",
        name: "Arm & Hammer Pure baking Soda 1lb",
        price: 540.00,
        portmoreStock: 23,
        category: "Baking Essentials"
      },
      {
        barcode: "066613164171",
        name: "Brunswick Boneless Sardines in Spring Water 106g",
        price: 345.00,
        portmoreStock: 500,
        category: "Canned Goods / Canned Seafood"
      }
    ];

    testProducts.forEach(item => {
      const match = productsData.find(p => p.barcode === item.barcode);
      expect(match).toBeDefined();
      expect(match.name).toBe(item.name);
      expect(match.price).toBe(item.price);
      expect(match.category).toBe(item.category);
      if (item.portmoreStock !== undefined) {
        expect(match.inventory["Progressive Foods Portmore"]).toBe(item.portmoreStock);
      }
      if (item.ochoRiosStock !== undefined) {
        expect(match.inventory["Progressive Foods Ocho Rios"]).toBe(item.ochoRiosStock);
      }
    });
  });

  it('Requirement 3 & 4: Customer Mode displays product name, price, and a blank placeholder card titled "Meal Idea"', () => {
    render(<App />);

    // Login as Shopper
    loginAsShopper(false);

    // Scan Barcode "055270961124"
    const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
    fireEvent.change(input, { target: { value: '055270961124' } });
    const scanBtn = screen.getByRole('button', { name: /Scan Code/i });
    fireEvent.click(scanBtn);

    // Check product name
    expect(screen.getByText('Grace Mackerel in Tomato Sauce 5.5oz')).toBeDefined();

    // Check price
    expect(screen.getByText(/285\.00/)).toBeDefined();

    // Check placeholder card titled "Meal Idea"
    const mealIdeaTitle = screen.getByText('Meal Idea');
    expect(mealIdeaTitle).toBeDefined();

    const mealIdeaCard = document.getElementById('meal-idea-card');
    expect(mealIdeaCard).toBeDefined();
  });

  it('Requirement 4: Employee Mode displays product name, wholesale cost, and specific inventory level for currently selected store', () => {
    render(<App />);

    // Login as Staff via PIN 1234
    loginAsStaff('1234');

    // Scan Barcode "055270961124"
    const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
    fireEvent.change(input, { target: { value: '055270961124' } });
    const scanBtn = screen.getByRole('button', { name: /Scan Code/i });
    fireEvent.click(scanBtn);

    // Verify product name
    expect(screen.getByText('Grace Mackerel in Tomato Sauce 5.5oz')).toBeDefined();

    // Verify wholesale cost
    expect(screen.getByText('Wholesale Cost')).toBeDefined();
    expect(screen.getByText('$210.00')).toBeDefined();

    // Verify inventory level for default selected store (Progressive Foods Portmore: 45)
    const countElement = document.getElementById('store-inventory-count');
    expect(countElement.textContent).toBe('45');
    expect(screen.getByText(/units in stock at this branch/i)).toBeDefined();
  });

  it('Updates inventory level dynamically when switching the selected store', () => {
    render(<App />);

    // Login as Staff for Progressive Foods Ocho Rios
    loginAsStaff('1234', 'Progressive Foods Ocho Rios');

    // Scan Grace Mackerel
    const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
    fireEvent.change(input, { target: { value: '055270961124' } });
    const scanBtn = screen.getByRole('button', { name: /Scan Code/i });
    fireEvent.click(scanBtn);

    // For Ocho Rios, inventory is 0
    const countElement = document.getElementById('store-inventory-count');
    expect(countElement.textContent).toBe('0');
    expect(screen.getByText('Out of Stock')).toBeDefined();
  });

  it('Verifies all 9 products display exact prices in Customer Mode and correct store inventory across all 5 branches in Employee Mode', () => {
    const { unmount } = render(<App />);

    // Login as Shopper
    loginAsShopper(false);

    const testMatrix = [
      { barcode: "055270961124", name: "Grace Mackerel in Tomato Sauce 5.5oz", price: "285.00", portmore: 45, ochoRios: 0 },
      { barcode: "040055531586", name: "Eve Black Pepper 2.69oz", price: "300.00", portmore: 0, ochoRios: 34 },
      { barcode: "050196110717", name: "Simply Natural Coconut Oil 500ml", price: "540.00", portmore: 34, ochoRios: 54 },
      { barcode: "8857131311916", name: "Kendel Whole Kernel Sweet Corn 15oz", price: "230.00", portmore: 2, ochoRios: 89 },
      { barcode: "048848846329", name: "Caribbean Choice Baked beans in Tomato Sauce 14.11oz", price: "134.00", portmore: 0, ochoRios: 0 },
      { barcode: "05527085312", name: "Grace Chicken Vienna Sausages 140g", price: "134.00", portmore: 2, ochoRios: 78 },
      { barcode: "066613703028", name: "Brunswick Tuna Flaked in Water 142g", price: "250.00", portmore: 20, ochoRios: 34 },
      { barcode: "033200011101", name: "Arm & Hammer Pure baking Soda 1lb", price: "540.00", portmore: 23, ochoRios: 0 },
      { barcode: "066613164171", name: "Brunswick Boneless Sardines in Spring Water 106g", price: "345.00", portmore: 500, ochoRios: 345 }
    ];

    const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
    const scanBtn = screen.getByRole('button', { name: /Scan Code/i });

    // Test in Customer Mode
    testMatrix.forEach(item => {
      fireEvent.change(input, { target: { value: item.barcode } });
      fireEvent.click(scanBtn);

      expect(screen.getByText(item.name)).toBeDefined();
      expect(screen.getByText(new RegExp(item.price))).toBeDefined();
      expect(screen.getByText('Meal Idea')).toBeDefined();
    });

    // Sign out to switch to staff mode
    triggerSignOut();

    // Login as Staff
    loginAsStaff('1234');

    // Verify employee view for each
    const inputStaff = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
    const scanBtnStaff = screen.getByRole('button', { name: /Scan Code/i });

    testMatrix.forEach(item => {
      fireEvent.change(inputStaff, { target: { value: item.barcode } });
      fireEvent.click(scanBtnStaff);

      expect(screen.getByText(item.name)).toBeDefined();
      expect(screen.getByText('Wholesale Cost')).toBeDefined();

      const countEl = document.getElementById('store-inventory-count');
      expect(countEl.textContent).toBe(String(item.portmore));
    });

    unmount();
  });

  it('Requirement: Wires Gemini API into Customer Mode barcode scan with exact schema & displays recipe_name and ingredients inside Meal Idea card', async () => {
    let capturedRequestBody = null;
    const originalFetch = global.fetch;

    global.fetch = async (url, options) => {
      if (url.includes('generativelanguage.googleapis.com')) {
        capturedRequestBody = JSON.parse(options.body);
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        recipe_name: "Jamaican Stewed Mackerel with Sweet Corn",
                        ingredients: [
                          "Grace Mackerel in Tomato Sauce 5.5oz",
                          "Kendel Whole Kernel Sweet Corn 15oz",
                          "Simply Natural Coconut Oil 500ml"
                        ]
                      })
                    }
                  ]
                }
              }
            ]
          })
        };
      }
      return originalFetch(url, options);
    };

    try {
      const { findByText } = render(<App />);

      // Login as Shopper
      loginAsShopper(false);

      // Scan barcode "055270961124"
      const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
      fireEvent.change(input, { target: { value: '055270961124' } });
      const scanBtn = screen.getByRole('button', { name: /Scan Code/i });
      fireEvent.click(scanBtn);

      // 1. Verify exact System Instruction
      expect(capturedRequestBody).toBeDefined();
      expect(capturedRequestBody.system_instruction.parts[0].text).toBe(
        "You are a culinary assistant for Progressive Foods. Suggest a quick, authentic Jamaican recipe that uses the scanned ingredient and 2 to 3 other ingredients from the provided in-stock list."
      );

      // 2. Verify Structured Outputs generationConfig
      expect(capturedRequestBody.generationConfig.responseMimeType).toBe("application/json");
      expect(capturedRequestBody.generationConfig.responseSchema).toEqual({
        type: "OBJECT",
        properties: {
          recipe_name: { type: "STRING" },
          ingredients: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        },
        required: ["recipe_name", "ingredients"]
      });

      // 3. Verify user prompt contains scanned product name and in-stock items
      const promptText = capturedRequestBody.contents[0].parts[0].text;
      expect(promptText).toContain("Grace Mackerel in Tomato Sauce 5.5oz");
      expect(promptText).toContain("Progressive Foods Portmore");

      // 4. Verify display inside "Meal Idea" placeholder card
      const recipeNameElement = await findByText("Jamaican Stewed Mackerel with Sweet Corn");
      expect(recipeNameElement).toBeDefined();

      const ingredientItem = await findByText("Kendel Whole Kernel Sweet Corn 15oz");
      expect(ingredientItem).toBeDefined();

      // Ensure it is inside the Meal Idea card
      const mealIdeaCard = document.getElementById('meal-idea-card');
      expect(mealIdeaCard).toBeDefined();
      expect(mealIdeaCard.contains(recipeNameElement)).toBe(true);

    } finally {
      global.fetch = originalFetch;
    }
  });

  it('Requirement: If the customer selects 3 or more of a product, they get it at a wholesale price', () => {
    render(<App />);

    // Login as Shopper
    loginAsShopper(false);

    const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
    const scanBtn = screen.getByRole('button', { name: /Scan Code/i });

    // 1. Scan Grace Mackerel (Retail: $285.00, Wholesale: $210.00)
    fireEvent.change(input, { target: { value: '055270961124' } });
    fireEvent.click(scanBtn);

    const priceBox = document.getElementById('customer-product-price');
    expect(priceBox.textContent).toContain('285.00');

    // Increase quantity to 2 -> still retail ($285.00)
    const plusBtn = document.getElementById('scan-qty-plus-btn');
    fireEvent.click(plusBtn);
    expect(priceBox.textContent).toContain('285.00');

    // Increase quantity to 3 -> unlocks wholesale price ($210.00)
    fireEvent.click(plusBtn);
    expect(priceBox.textContent).toContain('210.00');
    expect(document.getElementById('wholesale-savings-tag')).not.toBeNull();
    expect(document.getElementById('wholesale-deal-banner')).not.toBeNull();

    // Subtotal display shows 3 * 210 = 630.00 JMD
    const subtotalDisplay = document.getElementById('scan-quantity-subtotal-display');
    expect(subtotalDisplay.textContent).toContain('630.00');

    // Add 3 to Cart
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    fireEvent.click(addToCartBtn);

    // Open Cart
    const cartTabBtn = document.getElementById('tab-cart-btn');
    fireEvent.click(cartTabBtn);

    // Cart subtotal reflects wholesale price (3 * 210 = 630.00 JMD)
    const cartSubtotal = document.getElementById('cart-subtotal-value');
    expect(cartSubtotal.textContent).toContain('630.00');
    expect(document.getElementById('cart-wholesale-savings-banner')).not.toBeNull();
  });

  /* ========================================================================
     AUTHENTICATION & ONBOARDING REQUIREMENTS TESTS
     ======================================================================== */
  describe('Simulated Authentication & Onboarding Flow Requirements', () => {

    it('Requirement 1: Initial app view is Welcome/Login Screen with "Continue as Shopper" and "Staff Portal Login"', () => {
      render(<App />);

      // Features Progressive Foods name
      expect(screen.getByRole('heading', { level: 1, name: /Progressive/i })).toBeDefined();

      // Features two primary options
      expect(screen.getByRole('button', { name: /Continue as Shopper/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Staff Portal Login/i })).toBeDefined();
    });

    it('Requirement 2: Employee Login Path reveals mock PIN field, rejects wrong PIN, and accepts PIN 1234', () => {
      render(<App />);

      // Click "Staff Portal Login"
      const staffBtn = screen.getByRole('button', { name: /Staff Portal Login/i });
      fireEvent.click(staffBtn);

      // Verify mock PIN input field is revealed
      const pinInput = document.getElementById('staff-pin-input');
      expect(pinInput).toBeDefined();

      // Submit incorrect PIN
      fireEvent.change(pinInput, { target: { value: '9999' } });
      const submitBtn = document.getElementById('submit-staff-pin-btn');
      fireEvent.click(submitBtn);

      // Verify error message
      expect(screen.getByText(/Invalid staff PIN/i)).toBeDefined();

      // Submit valid PIN 1234
      fireEvent.change(pinInput, { target: { value: '1234' } });
      fireEvent.click(submitBtn);

      // Successfully routes to Employee Mode dashboard (displaying Wholesale Cost)
      expect(screen.getByText('Wholesale Cost')).toBeDefined();
      expect(document.getElementById('employee-mode-view')).toBeDefined();
    });

    it('Requirement 3 & 4: Shopper Login bypasses password, routes to "Link Your Loyalty Card" screen with camera modal, manual input & skip', () => {
      render(<App />);

      // Click "Continue as Shopper"
      const shopperBtn = screen.getByRole('button', { name: /Continue as Shopper/i });
      fireEvent.click(shopperBtn);

      // Interstitial screen titled "Link Your Loyalty Card"
      expect(screen.getByText('Link Your Loyalty Card')).toBeDefined();

      // Welcoming message asking if they are an existing loyalty member
      expect(screen.getByText(/Are you an existing loyalty member\?/i)).toBeDefined();

      // Primary button labeled "Scan Card Barcode"
      const scanCardBtn = screen.getByRole('button', { name: /Scan Card Barcode/i });
      expect(scanCardBtn).toBeDefined();

      // Click "Scan Card Barcode" to open dummy camera modal
      fireEvent.click(scanCardBtn);
      const cameraModal = document.getElementById('dummy-camera-modal');
      expect(cameraModal).toBeDefined();

      // Close dummy camera modal
      const closeCameraBtn = document.getElementById('close-camera-modal-btn');
      fireEvent.click(closeCameraBtn);
      expect(document.getElementById('dummy-camera-modal')).toBeNull();

      // Secondary text input field labeled "Enter Card Number Manually" with a "Verify" button
      expect(screen.getByLabelText(/Enter Card Number Manually/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Verify/i })).toBeDefined();

      // "Skip for Now" text link at the bottom
      const skipLink = screen.getByRole('button', { name: /Skip for Now/i });
      expect(skipLink).toBeDefined();
    });

    it('Requirement 5: Mock Loyalty Validation Logic rejects invalid numbers and accepts card 231791', () => {
      render(<App />);

      // Click Continue as Shopper
      const shopperBtn = screen.getByRole('button', { name: /Continue as Shopper/i });
      fireEvent.click(shopperBtn);

      const cardInput = document.getElementById('manual-card-input');
      const verifyBtn = document.getElementById('verify-card-btn');

      // Test invalid card number
      fireEvent.change(cardInput, { target: { value: '999999' } });
      fireEvent.click(verifyBtn);

      // Display red error text: "Card not found. Please try again."
      const errorText = document.getElementById('card-error-text');
      expect(errorText).toBeDefined();
      expect(errorText.textContent).toContain('Card not found. Please try again.');

      // Test valid card number: "231791"
      fireEvent.change(cardInput, { target: { value: '231791' } });
      fireEvent.click(verifyBtn);

      // Displays "Card Successfully Linked!" success state
      expect(screen.getByText('Card Successfully Linked!')).toBeDefined();
    });

    it('Requirement 6: State Isolation strictly gates Shopper vs Employee views, and unlocks Rewards tab with card 231791 and 25,000 pts', () => {
      vi.useFakeTimers();

      render(<App />);

      // 1. Link card 231791
      const shopperBtn = screen.getByRole('button', { name: /Continue as Shopper/i });
      fireEvent.click(shopperBtn);

      const cardInput = document.getElementById('manual-card-input');
      const verifyBtn = document.getElementById('verify-card-btn');
      fireEvent.change(cardInput, { target: { value: '231791' } });
      fireEvent.click(verifyBtn);

      // Fast forward timeout to transition to customer dashboard
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Shopper dashboard is active
      expect(document.getElementById('customer-mode-view')).toBeDefined();
      expect(screen.getByText('Retail Price')).toBeDefined();

      // State Isolation: Shopper view must NEVER display wholesale data
      expect(screen.queryByText('Wholesale Cost')).toBeNull();

      // Rewards tab is unlocked with card number 231791 and 25,000 points balance
      const rewardsTabBtn = document.getElementById('tab-rewards-btn');
      expect(rewardsTabBtn).toBeDefined();
      fireEvent.click(rewardsTabBtn);

      expect(screen.getByText('231791')).toBeDefined();
      expect(screen.getByText('25,000')).toBeDefined();

      // Sign out
      triggerSignOut();

      // 2. Staff View
      loginAsStaff('1234');

      // State Isolation: Employee view must hide shopper cart and loyalty points
      expect(document.getElementById('tab-cart-btn')).toBeNull();
      expect(document.getElementById('header-cart-btn')).toBeNull();
      expect(document.getElementById('tab-rewards-btn')).toBeNull();
      expect(screen.queryByText(/Loyalty Points:/i)).toBeNull();

      vi.useRealTimers();
    });

    it('Requirement 7: Session Reset clears session state and linked card, returning to Welcome screen', () => {
      render(<App />);

      // Login as Staff
      loginAsStaff('1234');
      expect(screen.getByText('Wholesale Cost')).toBeDefined();

      // Click Sign Out
      triggerSignOut();

      // Returned to Welcome/Login screen
      expect(screen.getByRole('button', { name: /Continue as Shopper/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /Staff Portal Login/i })).toBeDefined();
    });

  });

  /* ========================================================================
     PRE-CHECKOUT CART REQUIREMENTS TESTS
     ======================================================================== */
  describe('Pre-Checkout Cart Calculator Requirements', () => {

    it('Requirement 1 & 2: Prominent "Add to Cart" button below loyalty preview adds items and updates badges', () => {
      render(<App />);

      // Login as Shopper
      loginAsShopper(false);

      // Verify "Add to Cart" button exists
      const addToCartBtn = screen.getByRole('button', { name: /Add Grace Mackerel in Tomato Sauce 5.5oz to Cart|Add to Cart/i });
      expect(addToCartBtn).toBeDefined();

      // Click "Add to Cart" for Grace Mackerel ($285.00)
      fireEvent.click(addToCartBtn);

      // Cart count badge in navigation should show 1
      const navCartBadge = document.getElementById('nav-cart-badge-count');
      expect(navCartBadge).toBeDefined();
      expect(navCartBadge.textContent).toBe('1');

      // Verify cart button is removed from header
      expect(document.getElementById('header-cart-btn')).toBeNull();

      // Scan second item: Simply Natural Coconut Oil ($540.00)
      const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
      fireEvent.change(input, { target: { value: '050196110717' } });
      const scanBtn = screen.getByRole('button', { name: /Scan Code/i });
      fireEvent.click(scanBtn);

      const addSecondBtn = screen.getByRole('button', { name: /Add Simply Natural Coconut Oil 500ml to Cart|Add to Cart/i });
      fireEvent.click(addSecondBtn);

      // Cart badge in navigation should now show 2
      expect(navCartBadge.textContent).toBe('2');
    });

    it('Requirement 2: Cart Dashboard displays scrollable items list, unit prices, quantity adjustors, subtotal, and 1 pt per $100 JMD formula', () => {
      render(<App />);

      // Login as Shopper
      loginAsShopper(false);

      // Add Grace Mackerel ($285.00 JMD)
      const addToCartBtn = screen.getByRole('button', { name: /Add Grace Mackerel in Tomato Sauce 5.5oz to Cart|Add to Cart/i });
      fireEvent.click(addToCartBtn);

      // Add second item: Kendel Sweet Corn ($230.00 JMD)
      const input = screen.getByLabelText(/Simulated Barcode Scanner Input/i);
      fireEvent.change(input, { target: { value: '8857131311916' } });
      const scanBtn = screen.getByRole('button', { name: /Scan Code/i });
      fireEvent.click(scanBtn);
      const addCornBtn = screen.getByRole('button', { name: /Add Kendel Whole Kernel Sweet Corn 15oz to Cart|Add to Cart/i });
      fireEvent.click(addCornBtn);

      // Open Cart Dashboard via Cart navigation tab
      const cartTabBtn = document.getElementById('tab-cart-btn');
      fireEvent.click(cartTabBtn);

      // Verify Cart Dashboard container exists
      const cartDashboard = document.getElementById('cart-dashboard-view');
      expect(cartDashboard).toBeDefined();

      // Verify item rows display product names and unit prices
      expect(screen.getByText('Grace Mackerel in Tomato Sauce 5.5oz')).toBeDefined();
      expect(screen.getByText('$285.00 JMD each')).toBeDefined();

      expect(screen.getByText('Kendel Whole Kernel Sweet Corn 15oz')).toBeDefined();
      expect(screen.getByText('$230.00 JMD each')).toBeDefined();

      // Subtotal calculation: $285.00 + $230.00 = $515.00 JMD
      const subtotalEl = document.getElementById('cart-subtotal-value');
      expect(subtotalEl.textContent).toContain('515.00');

      // Points to Earn indicator: Math.floor(515 / 100) = 5 points
      const pointsToEarnEl = document.getElementById('cart-points-to-earn-value');
      expect(pointsToEarnEl.textContent).toContain('+5');

      // Test Quantity Adjustor: Increase Grace Mackerel quantity (+1 -> qty: 2)
      const plusBtn = screen.getByRole('button', { name: /Increase quantity of Grace Mackerel in Tomato Sauce 5.5oz/i });
      fireEvent.click(plusBtn);

      // Subtotal should update: (2 * 285.00) + 230.00 = 570.00 + 230.00 = $800.00 JMD
      expect(subtotalEl.textContent).toContain('800.00');

      // Points to earn should update: Math.floor(800 / 100) = 8 points
      expect(pointsToEarnEl.textContent).toContain('+8');

      // Decrease quantity of Kendel Sweet Corn to 0 (should remove it from cart)
      const minusBtn = screen.getByRole('button', { name: /Decrease quantity of Kendel Whole Kernel Sweet Corn 15oz/i });
      fireEvent.click(minusBtn);

      // Subtotal should now be 2 * 285.00 = $570.00 JMD
      expect(subtotalEl.textContent).toContain('570.00');
      // Points to earn: Math.floor(570 / 100) = 5 points
      expect(pointsToEarnEl.textContent).toContain('+5');
      // Kendel Corn item row should no longer be present
      expect(document.getElementById('cart-item-8857131311916')).toBeNull();
    });

    it('Requirement 3: Physical Checkout Handoff contains large "Ready for Cashier" banner, "Clear Cart" button, and NO "Checkout" or "Pay Now" button', () => {
      render(<App />);

      // Login as Shopper
      loginAsShopper(false);

      // Add an item to cart
      const addToCartBtn = screen.getByRole('button', { name: /Add Grace Mackerel in Tomato Sauce 5.5oz to Cart|Add to Cart/i });
      fireEvent.click(addToCartBtn);

      // Open Cart Dashboard
      const cartTabBtn = document.getElementById('tab-cart-btn');
      fireEvent.click(cartTabBtn);

      // Verify "Ready for Cashier" banner is present
      const cashierBanner = document.getElementById('ready-for-cashier-banner');
      expect(cashierBanner).toBeDefined();
      expect(screen.getByText('Ready for Cashier')).toBeDefined();
      expect(screen.getByText(/Show your digital loyalty card/i)).toBeDefined();
      expect(screen.getByText(/#231791/i)).toBeDefined();

      // STRICT REQUIREMENT: Absolutely NO "Checkout" or "Pay Now" button anywhere on the screen
      const checkoutButtons = screen.queryAllByRole('button', { name: /^Checkout$|^Pay Now$/i });
      expect(checkoutButtons.length).toBe(0);

      // Verify "Clear Cart" button resets the list for the next shopping trip
      const clearCartBtn = document.getElementById('clear-cart-btn');
      expect(clearCartBtn).toBeDefined();
      fireEvent.click(clearCartBtn);

      // After clearing, empty cart state should appear
      expect(document.getElementById('empty-cart-state')).toBeDefined();
      expect(screen.getByText('Your Cart is Empty')).toBeDefined();

      // Navigation badge should disappear
      expect(document.getElementById('nav-cart-badge-count')).toBeNull();
    });

  });

  describe('Footer Navigation & Center Notch Cart Requirements', () => {

    it('Verifies Stores tab is removed from the bottom footer bar in Customer and Staff modes', () => {
      render(<App />);

      // 1. Customer Mode
      loginAsShopper(false);
      expect(document.getElementById('tab-store-btn')).toBeNull();

      // Sign out
      triggerSignOut();

      // 2. Staff Mode
      loginAsStaff('1234');
      expect(document.getElementById('tab-store-btn')).toBeNull();
    });

    it('Verifies Cart is rendered as a center notch with SVG scoop and elevated FAB in Customer mode', () => {
      render(<App />);
      loginAsShopper(false);

      // Bottom bar has center notch modifier class
      const bottomBar = screen.getByRole('navigation', { name: /Bottom navigation/i });
      expect(bottomBar.classList.contains('has-center-notch')).toBe(true);

      // Center notch container and scoop SVG exist
      const notchContainer = bottomBar.querySelector('.nav-notch-center-container');
      expect(notchContainer).not.toBeNull();

      const scoopSvg = notchContainer.querySelector('.nav-notch-scoop-svg');
      expect(scoopSvg).not.toBeNull();

      // Cart button is inside the center notch container with circular FAB
      const cartBtn = document.getElementById('tab-cart-btn');
      expect(cartBtn).not.toBeNull();
      expect(notchContainer.contains(cartBtn)).toBe(true);
      expect(cartBtn.querySelector('.cart-notch-fab-circle')).not.toBeNull();
      expect(cartBtn.querySelector('.cart-notch-label').textContent).toBe('Cart');

      // Click Cart to switch active tab and verify active classes
      fireEvent.click(cartBtn);
      expect(cartBtn.classList.contains('active')).toBe(true);
      expect(document.getElementById('cart-dashboard-view')).not.toBeNull();
    });

    it('Verifies scanned product quantity can be adjusted before adding to cart and adds exact quantity', () => {
      render(<App />);
      loginAsShopper(false);

      // Initial quantity should be 1
      const qtyDisplay = document.getElementById('scan-qty-display');
      expect(qtyDisplay).not.toBeNull();
      expect(qtyDisplay.textContent).toBe('1');

      // Minus button should be disabled when quantity is 1
      const minusBtn = document.getElementById('scan-qty-minus-btn');
      const plusBtn = document.getElementById('scan-qty-plus-btn');
      expect(minusBtn.disabled).toBe(true);

      // Increment quantity to 3
      fireEvent.click(plusBtn);
      expect(qtyDisplay.textContent).toBe('2');
      expect(minusBtn.disabled).toBe(false);

      fireEvent.click(plusBtn);
      expect(qtyDisplay.textContent).toBe('3');

      // Decrement quantity back to 2
      fireEvent.click(minusBtn);
      expect(qtyDisplay.textContent).toBe('2');

      // Click Add to Cart
      const addToCartBtn = document.getElementById('add-to-cart-btn');
      fireEvent.click(addToCartBtn);

      // Bottom nav cart badge should show 2
      const navCartBadge = document.getElementById('nav-cart-badge-count');
      expect(navCartBadge).not.toBeNull();
      expect(navCartBadge.textContent).toBe('2');

      // Open Cart Dashboard and verify subtotal is 2 * 285 = $570.00 JMD
      const cartBtn = document.getElementById('tab-cart-btn');
      fireEvent.click(cartBtn);

      expect(document.getElementById('cart-subtotal-value').textContent).toBe('$570.00 JMD');
    });

    it('Verifies dynamic wholesale tier pricing transitions in cart when quantity adjusted to 3+', () => {
      render(<App />);
      loginAsShopper(false);

      // Add Grace Mackerel (qty 1)
      const addToCartBtn = document.getElementById('add-to-cart-btn');
      fireEvent.click(addToCartBtn);

      // Go to Cart
      const cartBtn = document.getElementById('tab-cart-btn');
      fireEvent.click(cartBtn);

      const subtotalEl = document.getElementById('cart-subtotal-value');
      expect(subtotalEl.textContent).toContain('285.00');

      // Increase to 2 (still retail: 2 * 285 = $570.00 JMD)
      const plusBtn = screen.getByRole('button', { name: /Increase quantity of Grace Mackerel in Tomato Sauce 5.5oz/i });
      fireEvent.click(plusBtn);
      expect(subtotalEl.textContent).toContain('570.00');
      expect(document.getElementById('cart-wholesale-savings-banner')).toBeNull();

      // Increase to 3 (wholesale unlocked: 3 * 210 = $630.00 JMD)
      fireEvent.click(plusBtn);
      expect(subtotalEl.textContent).toContain('630.00');
      expect(document.getElementById('cart-wholesale-savings-banner')).not.toBeNull();
      expect(screen.getByText(/⚡ Wholesale \(3\+\)/i)).toBeDefined();

      // Decrease back to 2 (reverts to retail: 2 * 285 = $570.00 JMD)
      const minusBtn = screen.getByRole('button', { name: /Decrease quantity of Grace Mackerel in Tomato Sauce 5.5oz/i });
      fireEvent.click(minusBtn);
      expect(subtotalEl.textContent).toContain('570.00');
      expect(document.getElementById('cart-wholesale-savings-banner')).toBeNull();
    });

  });

});

