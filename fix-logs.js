import fs from 'fs';
let file = 'src/main.tsx';
let data = fs.readFileSync(file, 'utf8');

if (!data.includes('const originalConsoleError')) {
  const patch = `
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
`;

  data = data.replace(
    /\/\/ Suppress Vite's benign WebSocket connection errors in AI Studio[\s\S]*?\}\);/g,
    patch
  );
  
  fs.writeFileSync(file, data);
}
