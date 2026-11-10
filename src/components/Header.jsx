import React, { useState, useEffect } from "react";
import logoImg from "../assets/logo.png";
import {
  MapPin,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  Phone,
  Clock,
  HelpCircle
} from "lucide-react";

export default function Header({
  selectedStore,
  onOpenStoreSelector,
  mode,
  isCardLinked,
  memberName = "Ricardo Campbell",
  onOpenProfile,
  onSignOut,
  onOpenAppTour
}) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const firstName = (memberName || "").trim().split(/\s+/)[0] || "Member";

  return (
    <header className="app-header-container sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Main Brand Topbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="app-topbar">
          {/* Row 1: Brand Logo & Right Action Group (Mode + Sign Out) */}
        <div className="header-top-row">
          <div className="brand-wrapper" onClick={onOpenStoreSelector} title="Click to view store information">
            <img src={logoImg} alt="Progressive Foods Logo" className="header-brand-logo" />
          </div>

          <div className="header-right-group">
            {/* Subtle App Tour Button */}
            {onOpenAppTour && (
              <button
                type="button"
                className="header-tour-btn"
                id="header-app-tour-btn"
                onClick={onOpenAppTour}
                title="Take a quick tour of Progressive Foods features"
                aria-label="App Tour"
              >
                <HelpCircle size={14} />
                <span className="tour-label-text">App Tour</span>
              </button>
            )}

            {/* User Profile Button / Mode Feature */}
            <button
              type="button"
              className={`mode-badge-indicator ${mode} profile-trigger-btn ${isCardLinked ? 'is-linked' : ''}`}
              id="header-mode-badge"
              onClick={onOpenProfile}
              title={`View ${mode === "customer" ? (isCardLinked ? `Hi, ${firstName}` : "Customer Profile") : "Staff Profile"}`}
              aria-label={`View ${mode === "customer" ? (isCardLinked ? `Hi, ${firstName}` : "Profile") : "Staff Profile"}`}
            >
              {mode === "customer" ? <User size={14} /> : <ShieldCheck size={14} />}
              <span className="mode-label-text">
                {mode === "customer"
                  ? isCardLinked
                    ? `Hi, ${firstName}`
                    : "Profile"
                  : "Staff Profile"}
              </span>
            </button>

            {/* Sign Out Button - Displays icon and sign out information */}
            <button
              type="button"
              className="header-signout-btn"
              onClick={onSignOut}
              id="header-signout-btn"
              title="Sign out and return to Welcome screen"
              aria-label="Sign Out"
            >
              <LogOut size={14} />
              <span className="signout-label-text">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Row 2: Complete Selected Store Information Card */}
        <div className="header-store-row">
          <button
            type="button"
            className="store-selector-trigger full-width-card"
            onClick={onOpenStoreSelector}
            title="Change supermarket branch or view branch details"
            id="store-selector-btn"
          >
            <div className="store-pin-badge">
              <MapPin size={16} className="store-pin-icon" />
            </div>

            <div className="store-selector-text">
              <div className="store-name-line">
                <span className="store-full-name">
                  {selectedStore ? selectedStore.name : "Select Store"}
                </span>
                <span className="store-change-chip">Change</span>
              </div>




            </div>

            <ChevronDown size={14} className="store-chevron-icon" />
          </button>
        </div>
      </div>
    </div>
  </header>
  );
}
