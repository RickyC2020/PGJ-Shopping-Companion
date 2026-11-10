import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import SplashScreen from './components/SplashScreen';
import OnboardingSliderScreen from './components/OnboardingSliderScreen';

describe('Splash Screen and Onboarding Slider Flow', () => {

  it('SplashScreen displays Progressive Foods logo, animated cart with spinning wheels, and respects 3-second duration', () => {
    vi.useFakeTimers();
    const handleFinish = vi.fn();

    render(<SplashScreen onFinish={handleFinish} duration={3000} />);

    // Renders logo
    const logoImg = screen.getByAltText(/Progressive Foods Logo/i);
    expect(logoImg).toBeDefined();

    // Renders animated shopping cart with spinning wheel spokes
    const cartLoader = document.querySelector('.splash-cart-loader');
    expect(cartLoader).not.toBeNull();
    const spokes = document.querySelectorAll('.splash-wheel-spokes');
    expect(spokes.length).toBe(2);

    // After 2.5 seconds, finish has NOT yet been called
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(handleFinish).not.toHaveBeenCalled();

    // After 3.0 seconds, onFinish is called
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(handleFinish).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('SplashScreen allows tapping to skip early', () => {
    vi.useFakeTimers();
    const handleFinish = vi.fn();

    render(<SplashScreen onFinish={handleFinish} duration={3000} />);

    const splashScreen = screen.getByRole('banner', { name: /Progressive Foods Splash Screen/i });
    fireEvent.click(splashScreen);

    // Fast forward transition
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(handleFinish).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('OnboardingSliderScreen renders all 3 functionalities and allows sliding between them', () => {
    const handleFinish = vi.fn();

    render(<OnboardingSliderScreen onFinish={handleFinish} />);

    // Progressive Foods badge is removed from top left
    expect(document.querySelector('.onboarding-brand-pill')).toBeNull();

    // On slide 1, top left has no Back button
    expect(document.getElementById('onboarding-prev-btn')).toBeNull();

    // 1. Initial Slide: Easy Price Checks
    expect(screen.getByText(/Easy Price Checks/i)).toBeDefined();
    expect(screen.getByText(/Scan any product barcode anywhere in the store/i)).toBeDefined();
    expect(screen.getByText(/INSTANT SCANNER/i)).toBeDefined();
    expect(screen.getAllByText(/\$145\.49/).length).toBeGreaterThanOrEqual(1);

    // No next button at the bottom
    expect(document.getElementById('onboarding-next-btn')).toBeNull();

    // Navigate to Slide 2 using dot indicator
    const dot1 = document.getElementById('onboarding-dot-1');
    fireEvent.click(dot1);

    // 2. Slide 2: Your Cart's Budget Buddy
    expect(screen.getByText(/Your Cart's Budget Buddy/i)).toBeDefined();
    expect(screen.getByText(/Shoppers are able to know their exact cart total before they go to the cashier so they checkout with more confidence/i)).toBeDefined();
    expect(screen.getByText(/PRE-CHECKOUT BUDGETING/i)).toBeDefined();
    expect(screen.getByText(/\$4,756\.80/)).toBeDefined();

    // On Slide 2, Back button is now present at the top left with stemless arrow
    const backBtnTop = document.getElementById('onboarding-prev-btn');
    expect(backBtnTop).not.toBeNull();
    expect(backBtnTop.querySelector('.onboarding-back-chevron')).not.toBeNull();

    // Clicking Back returns to Slide 1
    fireEvent.click(backBtnTop);
    expect(screen.getByText(/Easy Price Checks/i)).toBeDefined();
    expect(document.getElementById('onboarding-prev-btn')).toBeNull();

    // Dot navigation to Slide 3 (index 2)
    const dot2 = document.getElementById('onboarding-dot-2');
    fireEvent.click(dot2);

    // 3. Slide 3: Digital Rewards
    expect(screen.getByText(/^Track Your Rewards$/i)).toBeDefined();
    expect(screen.getByText(/accumulated points/i)).toBeDefined();
    expect(screen.getByText(/LOYALTY & REWARDS/i)).toBeDefined();

    // Modern digital rewards pass visual is rendered
    const rewardsPass = screen.getByRole('img', { name: /Progressive Foods Digital Rewards Pass/i });
    expect(rewardsPass).toBeDefined();
    expect(screen.getByText(/1,450 PTS/i)).toBeDefined();
    expect(screen.getByText(/\$10 OFF READY/i)).toBeDefined();

    // Get Started button finishes onboarding
    const getStartedBtn = document.getElementById('onboarding-get-started-btn');
    expect(getStartedBtn).toBeDefined();
    fireEvent.click(getStartedBtn);
    expect(handleFinish).toHaveBeenCalledTimes(1);
  });

  it('OnboardingSliderScreen provides a Skip button that exits immediately', () => {
    const handleFinish = vi.fn();

    render(<OnboardingSliderScreen onFinish={handleFinish} />);

    const skipBtn = document.getElementById('onboarding-skip-btn');
    expect(skipBtn).toBeDefined();
    fireEvent.click(skipBtn);

    expect(handleFinish).toHaveBeenCalledTimes(1);
  });

  it('OnboardingSliderScreen supports touch swipe gestures to slide across functionalities', () => {
    const handleFinish = vi.fn();

    render(<OnboardingSliderScreen onFinish={handleFinish} />);

    const viewport = document.querySelector('.onboarding-slider-viewport');
    expect(viewport).not.toBeNull();

    // Swipe left (advance to Slide 2)
    fireEvent.touchStart(viewport, { touches: [{ clientX: 250 }] });
    fireEvent.touchMove(viewport, { touches: [{ clientX: 150 }] }); // delta -100
    fireEvent.touchEnd(viewport);

    expect(screen.getByText(/Your Cart's Budget Buddy/i)).toBeDefined();

    // Swipe left again (advance to Slide 3)
    fireEvent.touchStart(viewport, { touches: [{ clientX: 250 }] });
    fireEvent.touchMove(viewport, { touches: [{ clientX: 150 }] });
    fireEvent.touchEnd(viewport);

    expect(screen.getByText(/^Track Your Rewards$/i)).toBeDefined();
  });

});
