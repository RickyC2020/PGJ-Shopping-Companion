import React, { useState, useEffect } from 'react';
import splashLogo from '../assets/splash-logo.png';

export default function SplashScreen({ onFinish, duration = 3000 }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Auto-exit timer for 3 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 350);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  const handleSkip = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 300);
  };

  return (
    <div
      className={`app-splash-screen ${isExiting ? 'splash-screen-exiting' : ''}`}
      onClick={handleSkip}
      id="app-splash-screen"
      role="banner"
      aria-label="Progressive Foods Splash Screen"
    >
      <div className="splash-content-container">
        {/* Attached Logo - Splash Screen Only */}
        <div className="splash-logo-card">
          <img
            src={splashLogo}
            alt="Progressive Foods Logo"
            className="splash-brand-logo"
          />
        </div>

        {/* Animated Shopping Cart Loading Visual with Spinning Wheels & Rolling Movement */}
        <div className="splash-cart-loader" aria-label="Loading..." role="status">
          <svg
            viewBox="0 0 90 64"
            className="splash-cart-svg"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Speed track line beneath cart with streaming dashes */}
            <line
              x1="6"
              y1="56"
              x2="84"
              y2="56"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="splash-cart-track"
            />
            {/* Secondary subtle dash line */}
            <line
              x1="14"
              y1="60"
              x2="76"
              y2="60"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="splash-cart-track-sub"
            />

            {/* Cart body with rolling forward/back movement */}
            <g className="splash-cart-body">
              {/* Basket frame & handle */}
              <path
                d="M12 14 L22 14 L32 42 L68 42 L75 20 L28 20"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Basket grid lines */}
              <line
                x1="30"
                y1="31"
                x2="71"
                y2="31"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="43"
                y1="20"
                x2="43"
                y2="42"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <line
                x1="57"
                y1="20"
                x2="57"
                y2="42"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Wheel struts connecting cart frame to wheel axels */}
              <line x1="36" y1="42" x2="38" y2="50" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />
              <line x1="64" y1="42" x2="62" y2="50" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" />

              {/* Back Wheel with spinning spokes centered at (0, 0) */}
              <g className="splash-cart-wheel-assembly" transform="translate(38, 50)">
                {/* Tire rim */}
                <circle cx="0" cy="0" r="5.5" fill="#037c68" stroke="#ffffff" strokeWidth="2.2" />
                {/* Spinning spokes */}
                <g className="splash-wheel-spokes">
                  <line x1="0" y1="-5.5" x2="0" y2="5.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="-3.8" y1="-3.8" x2="3.8" y2="3.8" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="-3.8" y1="3.8" x2="3.8" y2="-3.8" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.4" strokeLinecap="round" />
                </g>
                {/* Center hub */}
                <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
              </g>

              {/* Front Wheel with spinning spokes centered at (0, 0) */}
              <g className="splash-cart-wheel-assembly" transform="translate(62, 50)">
                {/* Tire rim */}
                <circle cx="0" cy="0" r="5.5" fill="#037c68" stroke="#ffffff" strokeWidth="2.2" />
                {/* Spinning spokes */}
                <g className="splash-wheel-spokes">
                  <line x1="0" y1="-5.5" x2="0" y2="5.5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="-5.5" y1="0" x2="5.5" y2="0" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" />
                  <line x1="-3.8" y1="-3.8" x2="3.8" y2="3.8" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="-3.8" y1="3.8" x2="3.8" y2="-3.8" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.4" strokeLinecap="round" />
                </g>
                {/* Center hub */}
                <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
