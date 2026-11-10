import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ArrowRight,
  ScanLine,
  Receipt,
  Gift
} from 'lucide-react';
export default function OnboardingSliderScreen({ onFinish }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(null);
  const touchDeltaX = useRef(0);

  const slides = [
    {
      id: 'price-check',
      tag: 'INSTANT SCANNER',
      tagColor: '#037c68',
      tagBg: 'rgba(3, 124, 104, 0.1)',
      title: 'Easy Price Checks',
      description:
        'Scan any product barcode anywhere in the store to instantly check live prices, promotions, and details right from your phone.',
      accentIcon: ScanLine,
      visual: (
        <div className="onboarding-visual-canvas price-check-canvas">
          <svg
            viewBox="0 0 340 240"
            className="onboarding-svg-illustration"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Smart phone scanning a product barcode showing instant price"
          >
            <defs>
              {/* Phone chassis gradient — sleek modern midnight slate */}
              <linearGradient id="modernPhoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Phone screen — clean modern white */}
              <linearGradient id="modernScreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>

              {/* Laser glow */}
              <filter id="modernLaserGlow" x="-10%" y="-100%" width="120%" height="300%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Soft card shadow */}
              <filter id="modernCardShadow" x="-20%" y="-20%" width="140%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="rgba(15,23,42,0.14)" />
              </filter>

              {/* Phone shadow */}
              <filter id="modernDeviceShadow" x="-20%" y="-10%" width="140%" height="130%">
                <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="rgba(15,23,42,0.22)" />
              </filter>

              {/* Screen clip path */}
              <clipPath id="modernPhoneScreenClip">
                <rect x="112" y="21" width="116" height="198" rx="19" />
              </clipPath>
            </defs>

            {/* ── Background soft glow rings ── */}
            <circle cx="170" cy="120" r="105" fill="rgba(3, 124, 104, 0.05)" />
            <circle cx="170" cy="120" r="80" fill="rgba(16, 185, 129, 0.05)" />

            {/* Decorative subtle accent sparkles */}
            <circle cx="68" cy="62" r="2.5" fill="#2dd4bf" opacity="0.4" />
            <circle cx="276" cy="178" r="3.5" fill="#037c68" opacity="0.3" />
            <path d="M 272 58 L 272 66 M 268 62 L 276 62" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
            <path d="M 64 168 L 64 174 M 61 171 L 67 171" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />

            {/* ── Sleek iPhone-style Device ── */}
            <g filter="url(#modernDeviceShadow)">
              {/* Outer Phone Shell */}
              <rect
                x="105"
                y="15"
                width="130"
                height="210"
                rx="24"
                fill="url(#modernPhoneGrad)"
                stroke="#334155"
                strokeWidth="1.6"
              />

              {/* Side Volume Buttons */}
              <rect x="102" y="58" width="3" height="14" rx="1.5" fill="#475569" />
              <rect x="102" y="78" width="3" height="14" rx="1.5" fill="#475569" />
              {/* Power Button */}
              <rect x="235" y="66" width="3" height="22" rx="1.5" fill="#475569" />

              {/* Dynamic Island pill */}
              <rect x="150" y="22" width="40" height="9" rx="4.5" fill="#020617" />
              <circle cx="180" cy="26.5" r="2" fill="#1e293b" />

              {/* Screen Area with live viewfinder */}
              <g clipPath="url(#modernPhoneScreenClip)">
                <rect x="112" y="21" width="116" height="198" rx="19" fill="url(#modernScreenGrad)" />

                {/* Subtle scanner ambient spotlight */}
                <circle cx="170" cy="120" r="50" fill="rgba(3, 124, 104, 0.06)" />

                {/* ── Modern Generic Product: Clean pantry jar (no brand) ── */}
                <g>
                  {/* Jar Lid / Cap */}
                  <rect x="157" y="78" width="26" height="10" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
                  <rect x="160" y="86" width="20" height="4" fill="#94a3b8" />

                  {/* Jar Body */}
                  <rect
                    x="145"
                    y="90"
                    width="50"
                    height="72"
                    rx="12"
                    fill="#f1f5f9"
                    stroke="#cbd5e1"
                    strokeWidth="1.4"
                  />

                  {/* Soft modern label band */}
                  <rect x="145" y="102" width="50" height="46" fill="#ccfbf1" />
                  <rect x="151" y="107" width="38" height="3" rx="1.5" fill="#2dd4bf" />

                  {/* Clean Barcode Area */}
                  <rect
                    x="150"
                    y="112"
                    width="40"
                    height="26"
                    rx="4"
                    fill="#ffffff"
                    stroke="#94a3b8"
                    strokeWidth="0.8"
                  />
                  {/* Modern barcode bars */}
                  {[153, 155.5, 158, 160.5, 163, 165.5, 168, 171, 173.5, 176, 178.5, 181, 183.5, 186].map((bx, i) => (
                    <rect
                      key={bx}
                      x={bx}
                      y={116}
                      width={i % 3 === 0 ? 1.8 : 1}
                      height={14}
                      fill="#0f172a"
                      rx="0.2"
                    />
                  ))}
                  <text x="170" y="134" textAnchor="middle" fill="#64748b" fontSize="4.2" fontFamily="monospace">
                    0 00000 00000
                  </text>
                </g>

                {/* ── Modern Scan Frame / Reticle (Centered at y=120) ── */}
                {/* 4 Crisp Teal Corner Brackets */}
                <path d="M 132 86 L 132 72 L 146 72" fill="none" stroke="#037c68" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 194 72 L 208 72 L 208 86" fill="none" stroke="#037c68" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 132 154 L 132 168 L 146 168" fill="none" stroke="#037c68" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 194 168 L 208 168 L 208 154" fill="none" stroke="#037c68" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Scanning Laser Beam (Vertically centered at y=120) */}
                <g className="onboarding-laser-beam">
                  <line
                    x1="134"
                    y1="120"
                    x2="206"
                    y2="120"
                    stroke="#037c68"
                    strokeWidth="2.4"
                    filter="url(#modernLaserGlow)"
                  />
                  <line
                    x1="134"
                    y1="120"
                    x2="206"
                    y2="120"
                    stroke="rgba(3, 124, 104, 0.25)"
                    strokeWidth="6"
                  />
                </g>

                {/* Bottom Viewfinder Minimal UI */}
                <circle cx="170" cy="202" r="8" fill="none" stroke="#94a3b8" strokeWidth="1.6" />
                <circle cx="170" cy="202" r="5" fill="#e2e8f0" />
              </g>

              {/* Glass subtle light reflection on screen */}
              <path
                d="M 116 26 C 132 23, 168 22, 190 25"
                stroke="rgba(0,0,0,0.04)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </g>

            {/* ── Floating Modern Price Result Card (Hero Feedback) ── */}
            <g className="onboarding-floating-price" filter="url(#modernCardShadow)">
              {/* Card Container */}
              <rect
                x="85"
                y="8"
                width="170"
                height="46"
                rx="14"
                fill="#ffffff"
                stroke="#e2e8f0"
                strokeWidth="1.2"
              />

              {/* Callout Arrow pointing down to the scanner */}
              <path d="M 165 54 L 175 54 L 170 60 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
              <rect x="164" y="52" width="12" height="3" fill="#ffffff" />

              {/* Verified Icon Badge */}
              <circle cx="106" cy="31" r="13" fill="rgba(16, 185, 129, 0.12)" />
              <path
                d="M 101 31 L 104.5 34.5 L 111 27.5"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Text: Item Title & Price */}
              <text x="126" y="24" fill="#64748b" fontSize="8.5" fontWeight="600">
                Scanned Item
              </text>
              <text
                x="126"
                y="41"
                fill="#037c68"
                fontSize="14.5"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                $145.49
              </text>

              {/* In Stock Pill Badge */}
              <rect x="188" y="22" width="56" height="17" rx="8.5" fill="rgba(16, 185, 129, 0.12)" />
              <circle cx="196.5" cy="30.5" r="2.5" fill="#10b981" />
              <text x="202" y="34" fill="#059669" fontSize="7.5" fontWeight="700">
                In Stock
              </text>
            </g>
          </svg>
        </div>
      )
    },
    {
      id: 'cart-total',
      tag: 'PRE-CHECKOUT BUDGETING',
      tagColor: '#c0184b',
      tagBg: 'rgba(192, 24, 75, 0.1)',
      title: "Your Cart's Budget Buddy",
      description:
        'Shoppers are able to know their exact cart total before they go to the cashier so they checkout with more confidence and no surprises.',
      accentIcon: Receipt,
      visual: (
        <div className="onboarding-visual-canvas cart-total-canvas">
          <svg
            viewBox="0 0 340 240"
            className="onboarding-svg-illustration"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="receiptGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
            </defs>

            {/* Background soft glow with Shoppers Fair crimson & Progressive teal */}
            <circle cx="170" cy="120" r="105" fill="rgba(192, 24, 75, 0.05)" />
            <circle cx="170" cy="120" r="80" fill="rgba(3, 124, 104, 0.05)" />

            {/* Modern Shopping Cart Silhouette - Enlarged */}
            <g transform="translate(42, 45)">
              {/* Colorful groceries inside basket */}
              {/* Box 1 (Crimson) */}
              <rect x="45" y="16" width="22" height="30" rx="3" fill="#c0184b" />
              {/* Bottle (Forest Green) */}
              <rect x="71" y="12" width="14" height="34" rx="4" fill="#0e6b3f" />
              {/* Box 2 (Gold) */}
              <rect x="88" y="20" width="24" height="26" rx="3" fill="#f59e0b" />

              {/* Cart Body */}
              <path
                d="M10 24 L28 24 L44 76 L118 76 L130 36 L38 36"
                fill="none"
                stroke="#037c68"
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="46" y1="55" x2="124" y2="55" stroke="#037c68" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              <line x1="68" y1="36" x2="63" y2="76" stroke="#037c68" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              <line x1="96" y1="36" x2="91" y2="76" stroke="#037c68" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

              {/* Cart Wheels */}
              <circle cx="52" cy="88" r="8" fill="#0f172a" />
              <circle cx="52" cy="88" r="3" fill="#ffffff" />
              <circle cx="110" cy="88" r="8" fill="#0f172a" />
              <circle cx="110" cy="88" r="3" fill="#ffffff" />
            </g>

            {/* Live Total Card Overlay */}
            <g
              className="onboarding-receipt-card"
              transform="translate(150, 24)"
              filter="drop-shadow(0 12px 24px rgba(15, 23, 42, 0.14))"
            >
              <rect
                x="0"
                y="0"
                width="155"
                height="164"
                rx="18"
                fill="url(#receiptGrad)"
                stroke="#e2e8f0"
                strokeWidth="1.6"
              />

              {/* Top Badge */}
              <rect x="14" y="16" width="68" height="20" rx="10" fill="rgba(3, 124, 104, 0.12)" />
              <text x="48" y="30" textAnchor="middle" fill="#037c68" fontSize="9.5" fontWeight="700">
                5 ITEMS
              </text>

              {/* Confidence check icon */}
              <circle cx="132" cy="26" r="10" fill="#10b981" />
              <path d="M128 26 L131 29 L136.5 23" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

              {/* Receipt Lines */}
              <line x1="16" y1="52" x2="90" y2="52" stroke="#94a3b8" strokeWidth="3.2" strokeLinecap="round" />
              <line x1="112" y1="52" x2="138" y2="52" stroke="#64748b" strokeWidth="3.2" strokeLinecap="round" />

              <line x1="16" y1="68" x2="76" y2="68" stroke="#cbd5e1" strokeWidth="3.2" strokeLinecap="round" />
              <line x1="115" y1="68" x2="138" y2="68" stroke="#94a3b8" strokeWidth="3.2" strokeLinecap="round" />

              <line x1="16" y1="84" x2="86" y2="84" stroke="#cbd5e1" strokeWidth="3.2" strokeLinecap="round" />
              <line x1="118" y1="84" x2="138" y2="84" stroke="#94a3b8" strokeWidth="3.2" strokeLinecap="round" />

              {/* Divider */}
              <line x1="14" y1="102" x2="140" y2="102" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="4 3" />

              {/* Final Exact Total Readout */}
              <text x="16" y="122" fill="#64748b" fontSize="9" fontWeight="700" letterSpacing="0.6">
                EXACT BILL TOTAL
              </text>
              <text
                x="16"
                y="146"
                fill="#0f172a"
                fontSize="20"
                fontWeight="800"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                $4,756.80
              </text>
            </g>
          </svg>
        </div>
      )
    },
    {
      id: 'digital-rewards',
      tag: 'LOYALTY & REWARDS',
      tagColor: '#d91b7e',
      tagBg: 'rgba(217, 27, 126, 0.1)',
      title: 'Track Your Rewards',
      description:
        'See the Cash Value of your accumulated points for smarter cart calculations and instant value feedback',
      accentIcon: Gift,
      visual: (
        <div className="onboarding-visual-canvas rewards-canvas">
          <svg
            viewBox="0 0 340 240"
            className="onboarding-svg-illustration"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Progressive Foods Digital Rewards Pass"
          >
            <defs>
              {/* Card Gradient: Progressive Teal to Deep Emerald */}
              <linearGradient id="modernCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#037c68" />
                <stop offset="65%" stopColor="#025d4e" />
                <stop offset="100%" stopColor="#013b32" />
              </linearGradient>

              {/* Magenta Leaf Gradient */}
              <linearGradient id="magentaRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d91b7e" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>

              {/* Gold Tier Gradient */}
              <linearGradient id="goldTierGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Voucher Card Gradient */}
              <linearGradient id="voucherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>

              <filter id="rewardGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Ambient Glow Rings */}
            <circle cx="170" cy="120" r="105" fill="rgba(3, 124, 104, 0.06)" />
            <circle cx="170" cy="120" r="80" fill="rgba(217, 27, 126, 0.05)" />

            {/* Modern Digital Membership Pass / Card */}
            <g className="onboarding-rewards-card-group" transform="translate(38, 22)">
              {/* Card Shadow */}
              <rect x="0" y="6" width="232" height="138" rx="20" fill="rgba(2, 93, 78, 0.2)" filter="url(#rewardGlow)" />

              {/* Card Base */}
              <rect
                x="0"
                y="0"
                width="232"
                height="138"
                rx="20"
                fill="url(#modernCardGrad)"
                stroke="rgba(255, 255, 255, 0.28)"
                strokeWidth="1.5"
              />

              {/* Sleek Curved Wave Pattern */}
              <path d="M0 68 Q 90 38, 170 78 T 232 58 L232 138 L0 138 Z" fill="rgba(255, 255, 255, 0.07)" />

              {/* Card Top Header: Brand Name & Contactless Wave */}
              <text x="20" y="27" fill="#ffffff" fontSize="11" fontWeight="800" letterSpacing="0.8">
                PROGRESSIVE FOODS
              </text>
              <text x="20" y="39" fill="#a7f3d0" fontSize="8" fontWeight="700" letterSpacing="0.5">
                DIGITAL REWARDS CLUB
              </text>

              {/* Contactless NFC Wave Icon */}
              <g transform="translate(196, 17)" stroke="#a7f3d0" strokeWidth="1.8" fill="none" strokeLinecap="round">
                <path d="M0 4 A 6 6 0 0 1 0 16" />
                <path d="M4 1 A 11 11 0 0 1 4 19" />
                <path d="M8 -2 A 16 16 0 0 1 8 22" />
              </g>

              {/* Digital Gold Smart Chip */}
              <g transform="translate(20, 52)">
                <rect x="0" y="0" width="30" height="22" rx="5" fill="url(#goldTierGrad)" />
                <rect x="3" y="3" width="24" height="16" rx="3" fill="none" stroke="#b45309" strokeWidth="0.8" />
                <line x1="12" y1="0" x2="12" y2="22" stroke="#b45309" strokeWidth="0.8" />
                <line x1="0" y1="11" x2="30" y2="11" stroke="#b45309" strokeWidth="0.8" />
              </g>

              {/* Digital Membership Number */}
              <text x="20" y="96" fill="#ffffff" fontSize="13" fontWeight="700" letterSpacing="2.8" fontFamily="monospace">
                •••• 2317
              </text>

              {/* Tier Pill (Gold VIP Member with Magenta Accent) */}
              <g transform="translate(20, 107)">
                <rect x="0" y="0" width="84" height="18" rx="9" fill="rgba(255, 255, 255, 0.16)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.8" />
                <circle cx="9" cy="9" r="4" fill="#fbbf24" />
                <text x="18" y="12.5" fill="#fef08a" fontSize="8" fontWeight="800" letterSpacing="0.4">
                  GOLD MEMBER
                </text>
              </g>

              {/* Quick Scan QR / Member Barcode Badge */}
              <g transform="translate(168, 76)">
                <rect x="0" y="0" width="48" height="48" rx="9" fill="#ffffff" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.12))" />
                {/* QR Pattern */}
                <rect x="6" y="6" width="14" height="14" rx="2" fill="#0f172a" />
                <rect x="8" y="8" width="10" height="10" rx="1" fill="#ffffff" />
                <rect x="10" y="10" width="6" height="6" fill="#0f172a" />

                <rect x="28" y="6" width="14" height="14" rx="2" fill="#0f172a" />
                <rect x="30" y="8" width="10" height="10" rx="1" fill="#ffffff" />
                <rect x="32" y="10" width="6" height="6" fill="#0f172a" />

                <rect x="6" y="28" width="14" height="14" rx="2" fill="#0f172a" />
                <rect x="8" y="30" width="10" height="10" rx="1" fill="#ffffff" />
                <rect x="10" y="32" width="6" height="6" fill="#0f172a" />

                <rect x="24" y="24" width="6" height="6" fill="#0f172a" />
                <rect x="34" y="26" width="8" height="6" fill="#0f172a" />
                <rect x="26" y="34" width="16" height="8" rx="1" fill="#037c68" />
              </g>
            </g>

            {/* Floating Live Points & Rewards Progress Tracker Card */}
            <g className="onboarding-floating-rewards-card" transform="translate(136, 134)" filter="drop-shadow(0 12px 24px rgba(15, 23, 42, 0.16))">
              <rect x="0" y="0" width="176" height="80" rx="18" fill="url(#voucherGrad)" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Top Row: Points Tag & Star */}
              <g transform="translate(14, 14)">
                <circle cx="10" cy="10" r="10" fill="#fef3c7" />
                <text x="10" y="14" textAnchor="middle" fontSize="11">⭐</text>
                <text x="26" y="9" fill="#64748b" fontSize="8.5" fontWeight="700" letterSpacing="0.5">
                  POINTS BALANCE
                </text>
                <text x="26" y="23" fill="#0f172a" fontSize="16" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif">
                  1,450 PTS
                </text>
              </g>

              {/* Progress Bar to Next Reward ($10 Off) */}
              <g transform="translate(14, 48)">
                <rect x="0" y="0" width="148" height="7" rx="3.5" fill="#f1f5f9" />
                <rect x="0" y="0" width="112" height="7" rx="3.5" fill="url(#magentaRibbon)" />

                {/* Label below progress bar */}
                <text x="0" y="18" fill="#037c68" fontSize="8" fontWeight="700">
                  $10 Voucher at 1,500 pts
                </text>
                <text x="148" y="18" textAnchor="end" fill="#d91b7e" fontSize="8" fontWeight="800">
                  96%
                </text>
              </g>
            </g>

            {/* Floating Instant Reward Voucher Pill on Left */}
            <g className="onboarding-floating-voucher" transform="translate(24, 162)" filter="drop-shadow(0 8px 16px rgba(217, 27, 126, 0.22))">
              <rect x="0" y="0" width="114" height="34" rx="17" fill="#d91b7e" />
              <circle cx="17" cy="17" r="10" fill="rgba(255, 255, 255, 0.2)" />
              <text x="17" y="21" textAnchor="middle" fontSize="10">🎁</text>
              <text x="32" y="16" fill="#ffffff" fontSize="9" fontWeight="800">
                $10 OFF READY
              </text>
              <text x="32" y="25" fill="#fce7f3" fontSize="7.5" fontWeight="600">
                Tap to Redeem
              </text>
            </g>

            {/* Celebratory Floating Sparkles & Coins */}
            <circle cx="304" cy="46" r="5.5" fill="#fbbf24" opacity="0.85" />
            <circle cx="22" cy="50" r="4.5" fill="#037c68" opacity="0.75" />
            <circle cx="318" cy="126" r="4.5" fill="#d91b7e" opacity="0.8" />
            <circle cx="14" cy="125" r="3.5" fill="#f59e0b" opacity="0.7" />
          </svg>
        </div>
      )
    }
  ];

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const swipeThreshold = 40;
    if (touchDeltaX.current < -swipeThreshold) {
      // Swiped left -> next slide
      handleNext();
    } else if (touchDeltaX.current > swipeThreshold) {
      // Swiped right -> prev slide
      handlePrev();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div
      className="onboarding-screen-container"
      id="onboarding-slider-screen"
      role="region"
      aria-label="App Onboarding Introduction"
    >
      {/* Top Header: Repositioned Back button (slides 2 & 3) and Skip button */}
      <header className="onboarding-header">
        <div className="onboarding-header-left">
          {currentSlide > 0 && (
            <button
              type="button"
              className="onboarding-header-nav-btn onboarding-back-header-btn"
              id="onboarding-prev-btn"
              onClick={handlePrev}
              aria-label="Previous slide"
            >
              {/* Back arrow without the stem in front of Back text */}
              <ChevronLeft size={24} strokeWidth={2.5} className="onboarding-back-chevron" />
              <span>Back</span>
            </button>
          )}
        </div>

        <div className="onboarding-header-right">
          <button
            type="button"
            className="onboarding-header-nav-btn onboarding-skip-btn"
            id="onboarding-skip-btn"
            onClick={onFinish}
            aria-label={currentSlide === slides.length - 1 ? 'Start shopping' : 'Skip onboarding intro'}
          >
            {currentSlide === slides.length - 1 ? 'Start' : 'Skip'}
          </button>
        </div>
      </header>

      {/* Main Swipable Content Area */}
      <div
        className="onboarding-slider-viewport"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="onboarding-slides-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`onboarding-slide-item ${idx === currentSlide ? 'slide-active' : ''}`}
              aria-hidden={idx !== currentSlide}
            >
              {/* Illustration Graphic - Enlarged */}
              <div className="onboarding-illustration-wrapper">
                {slide.visual}
              </div>

              {/* Text Description Content */}
              <div className="onboarding-text-content">
                <span
                  className="onboarding-category-tag"
                  style={{ color: slide.tagColor, backgroundColor: slide.tagBg }}
                >
                  {slide.tag}
                </span>

                <h2 className="onboarding-slide-title">
                  {slide.title}
                </h2>

                <p className="onboarding-slide-desc">
                  {slide.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer: Slider visual brought up to the center between text and bottom */}
      <footer className="onboarding-footer">
        {/* Pagination Dots (Slider Visual centered vertically) */}
        <div className="onboarding-pagination" role="tablist" aria-label="Slide Indicator">
          {slides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={idx === currentSlide}
              aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              className={`onboarding-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              id={`onboarding-dot-${idx}`}
            />
          ))}
        </div>

        {/* On the final slide, provide a sleek Get Started button below the centered dots */}
        {currentSlide === slides.length - 1 && (
          <button
            type="button"
            className="onboarding-get-started-btn"
            id="onboarding-get-started-btn"
            onClick={onFinish}
            aria-label="Get Started"
          >
            <span>Get Started</span>
            <ArrowRight size={20} />
          </button>
        )}
      </footer>
    </div>
  );
}
