import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';


// Suppress Vite's benign WebSocket connection errors in AI Studio
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args.length > 0 && typeof args[0] === 'string' && args[0].includes('failed to connect to websocket')) {
    return;
  }
  originalConsoleError(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('WebSocket closed without opened')) {
    event.preventDefault();
    event.stopPropagation();
  }
});


createRoot(document.getElementById('root')!).render(
  <App />
);
