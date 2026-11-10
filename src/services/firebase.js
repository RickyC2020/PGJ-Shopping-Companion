/**
 * Firebase Client Initialization & App Check Service
 * Defense #3: Enforces client authentication and App Check attestation
 * to mitigate automated scrapers from bulk-reading Firestore documents.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { sanitizeClientConfig } from '../utils/securityConfig.js';

// Read and sanitize public client environment variables
const clientConfig = typeof import.meta !== 'undefined' && import.meta.env
  ? sanitizeClientConfig(import.meta.env)
  : {};

// Public Firebase Client Configuration
export const firebaseConfig = {
  apiKey: clientConfig.VITE_FIREBASE_API_KEY || 'AIzaSyA_mockRetailApiKey1234567890',
  authDomain: clientConfig.VITE_FIREBASE_AUTH_DOMAIN || 'progressive-foods-retail.firebaseapp.com',
  projectId: clientConfig.VITE_FIREBASE_PROJECT_ID || 'progressive-foods-retail',
  storageBucket: clientConfig.VITE_FIREBASE_STORAGE_BUCKET || 'progressive-foods-retail.firebasestorage.app',
  messagingSenderId: clientConfig.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: clientConfig.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890'
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Configure Firestore client initialization with offline persistence enabled.
 * Uses persistentLocalCache and multi-tab synchronization to optimize read quotas
 * and support seamless in-store offline catalog lookups.
 */
export function createConfiguredFirestore(firebaseApp) {
  if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
    try {
      return initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (err) {
      return getFirestore(firebaseApp);
    }
  }
  return getFirestore(firebaseApp);
}

// Initialize Cloud Firestore instance with persistent caching
export const db = createConfiguredFirestore(app);

// -----------------------------------------------------------------------------
// App Check & Catalog Scraping Mitigation
// Protects Firestore endpoints against bulk abuse by headless scripts
// -----------------------------------------------------------------------------
let appCheckInstance = null;

export function initializeRetailAppCheck() {
  if (typeof window === 'undefined') return null;
  if (appCheckInstance) return appCheckInstance;

  try {
    const siteKey = clientConfig.VITE_FIREBASE_APP_CHECK_KEY || '6Ld_mockSiteKeyForDevelopment1234567';

    // In local development or testing, configure debug token
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    appCheckInstance = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true
    });

    return appCheckInstance;
  } catch (err) {
    // Graceful fallback in environments without reCAPTCHA Enterprise configured
    console.warn('[Firebase App Check] Initialization skipped or operating in fallback mode:', err.message);
    return null;
  }
}

// Auto-initialize in browser if not running in headless test runner
if (typeof window !== 'undefined' && !(typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'test')) {
  initializeRetailAppCheck();
}
