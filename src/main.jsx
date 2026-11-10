import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installGlobalErrorScrubber } from './utils/telemetryScrubber.js'

// Install global error interceptor to scrub customer PII before console/telemetry output
installGlobalErrorScrubber();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
