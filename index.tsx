
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Configure API keys for development
// In production, these should be set via environment variables
(window as any).GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
(window as any).GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// Backend base URL for dev; secrets should live in server .env only
// Configure via VITE_API_BASE in .env if needed

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);