import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import UserProfileModal from './components/UserProfileModal';
import SignOutConfirmModal from './components/SignOutConfirmModal';
import PreCheckoutCart from './components/PreCheckoutCart';
import Header from './components/Header';

describe('User Profile, Sign Out Verification, and Shopping Cart Loyalty Prompts', () => {

  it('SignOutConfirmModal displays verification prompt and triggers confirm or cancel', () => {
    let confirmed = false;
    let closed = false;

    render(
      <SignOutConfirmModal
        isOpen={true}
        onClose={() => { closed = true; }}
        onConfirm={() => { confirmed = true; }}
        mode="customer"
      />
    );

    expect(screen.getByText(/Sign Out of Progressive Foods\?/i)).toBeDefined();
    expect(screen.getByText(/Your current pre-checkout cart and temporary shopping session will be cleared/i)).toBeDefined();

    // Click Stay Signed In (Cancel)
    fireEvent.click(screen.getByRole('button', { name: /Stay Signed In/i }));
    expect(closed).toBe(true);

    // Click Confirm Sign Out
    fireEvent.click(screen.getByRole('button', { name: /Yes, Sign Out/i }));
    expect(confirmed).toBe(true);
  });

  it('UserProfileModal reveals linked customer details (name, email, phone number, card number)', () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={() => {}}
        mode="customer"
        isCardLinked={true}
        linkedCardNumber="231791"
        selectedStore={{ name: "Progressive Foods Portmore" }}
      />
    );

    expect(screen.getAllByText("Ricardo Campbell").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("ricardo.campbell@email.com")).toBeDefined();
    expect(screen.getByText("+1 (876) 555-0192")).toBeDefined();
    expect(screen.getByText("#231791")).toBeDefined();
    expect(screen.getByText(/25,000/)).toBeDefined();
  });

  it('UserProfileModal for unlinked customer presents option to link card and sign up at customer service', () => {
    let openLinkCardClicked = false;

    render(
      <UserProfileModal
        isOpen={true}
        onClose={() => {}}
        mode="customer"
        isCardLinked={false}
        linkedCardNumber={null}
        selectedStore={{ name: "Progressive Foods Fairview" }}
        onOpenLinkCard={() => { openLinkCardClicked = true; }}
      />
    );

    expect(screen.getByText("Guest Shopper")).toBeDefined();
    expect(screen.getByText(/Already Have a Progressive Card\?/i)).toBeDefined();
    expect(screen.getByText(/Sign Up at Customer Service/i)).toBeDefined();
    expect(screen.getByText(/Customer Service section/i)).toBeDefined();

    const linkCardBtn = screen.getByRole('button', { name: /Link Your Card/i });
    fireEvent.click(linkCardBtn);
    expect(openLinkCardClicked).toBe(true);
  });

  it('UserProfileModal reveals staff name and staff ID when user is staff', () => {
    render(
      <UserProfileModal
        isOpen={true}
        onClose={() => {}}
        mode="employee"
        isCardLinked={false}
        linkedCardNumber={null}
        selectedStore={{ name: "Progressive Foods Ocho Rios" }}
      />
    );

    expect(screen.getAllByText("Marcus Sterling").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("PGJ-EMP-1234")).toBeDefined();
    expect(screen.getByText(/Authorized Staff Member/i)).toBeDefined();
    expect(screen.getByText(/Progressive Foods Ocho Rios/i)).toBeDefined();
  });

  it('PreCheckoutCart presents option to link card or sign up at customer service when card is not linked', () => {
    let openLinkCardClicked = false;

    const mockItems = [
      {
        product: {
          barcode: '055270961124',
          name: 'Grace Corned Beef 340g',
          price: 520.00,
          wholesaleCost: 470.00
        },
        quantity: 2
      }
    ];

    render(
      <PreCheckoutCart
        cartItems={mockItems}
        onUpdateQuantity={() => {}}
        onClearCart={() => {}}
        onGoToScanner={() => {}}
        selectedStore={{ name: "Progressive Foods Mandeville" }}
        isCardLinked={false}
        onOpenLinkCard={() => { openLinkCardClicked = true; }}
      />
    );

    // Cart unlinked section is rendered
    expect(screen.getByText(/Earn Loyalty Rewards at Checkout/i)).toBeDefined();
    expect(screen.getByText(/Already a Member\?/i)).toBeDefined();
    expect(screen.getByText(/Need a Free Card\?/i)).toBeDefined();
    expect(screen.getByText(/Sign Up at Customer Service/i)).toBeDefined();

    // Clicking link button calls callback
    const linkBtn = screen.getByRole('button', { name: /Link Your Card/i });
    fireEvent.click(linkBtn);
    expect(openLinkCardClicked).toBe(true);
  });

  it('PreCheckoutCart shows digital card number at cashier when card is linked', () => {
    const mockItems = [
      {
        product: {
          barcode: '055270961124',
          name: 'Grace Corned Beef 340g',
          price: 520.00
        },
        quantity: 1
      }
    ];

    render(
      <PreCheckoutCart
        cartItems={mockItems}
        onUpdateQuantity={() => {}}
        onClearCart={() => {}}
        onGoToScanner={() => {}}
        selectedStore={{ name: "Progressive Foods Mandeville" }}
        isCardLinked={true}
        linkedCardNumber="231791"
        onOpenLinkCard={() => {}}
      />
    );

    expect(screen.getByText(/Ready for Cashier/i)).toBeDefined();
    expect(screen.getByText(/#231791/i)).toBeDefined();
    expect(screen.queryByText(/Sign Up at Customer Service/i)).toBeNull();
  });

  it('Header profile badge displays "Hi, [The first name of the loyalty member]" when card is linked', () => {
    const { rerender } = render(
      <Header
        mode="customer"
        isCardLinked={true}
        memberName="Ricardo Campbell"
        onOpenProfile={() => {}}
        onSignOut={() => {}}
      />
    );

    expect(screen.getByText("Hi, Ricardo")).toBeDefined();

    // With a different member name
    rerender(
      <Header
        mode="customer"
        isCardLinked={true}
        memberName="Deandre Johnson"
        onOpenProfile={() => {}}
        onSignOut={() => {}}
      />
    );

    expect(screen.getByText("Hi, Deandre")).toBeDefined();
  });

  it('Header profile badge displays "Profile" when loyalty card is not linked', () => {
    render(
      <Header
        mode="customer"
        isCardLinked={false}
        memberName="Ricardo Campbell"
        onOpenProfile={() => {}}
        onSignOut={() => {}}
      />
    );

    expect(screen.getByText("Profile")).toBeDefined();
    expect(screen.queryByText(/Hi, /i)).toBeNull();
  });

});
