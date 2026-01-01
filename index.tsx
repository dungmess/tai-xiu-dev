
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Bắt các lỗi Promise bị reject toàn cục (Sửa lỗi Uncaught in promise)
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Ngăn chặn app crash hoàn toàn nếu có thể
  event.preventDefault();
});

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("CRITICAL BOOT ERROR:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: white; background: #020617; height: 100vh; font-family: sans-serif;">
      <h1>Đã có lỗi xảy ra khi khởi động game</h1>
      <p>Vui lòng thử xóa cache trình duyệt hoặc liên hệ admin.</p>
      <pre style="background: #1e293b; padding: 10px; border-radius: 8px; color: #ef4444;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
