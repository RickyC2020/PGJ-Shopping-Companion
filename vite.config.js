import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { secretSanitizationPlugin } from './src/utils/securityConfig.js'

// https://vite.dev/config/
export default defineConfig({
  // Only expose explicitly safe public variables to client bundles
  envPrefix: ['VITE_PUBLIC_', 'VITE_FIREBASE_', 'VITE_'],
  plugins: [
    tailwindcss(),
    react(),
    secretSanitizationPlugin()
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
