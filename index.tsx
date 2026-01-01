
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process.env để tránh lỗi "process is not defined" trên một số môi trường production
if (typeof (window as any).process === 'undefined') {
  (window as any).process = { env: {} };
}

// Error Boundary Component để bắt lỗi render của React
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("REACT RENDER ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#020617', height: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#ef4444' }}>Hệ thống gặp sự cố render</h1>
          <p>Lỗi này thường do dữ liệu LocalStorage bị hỏng hoặc lỗi logic component.</p>
          <pre style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', color: '#f87171', overflow: 'auto' }}>
            {this.state.error?.stack || this.state.error?.message}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Xóa dữ liệu cũ & Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Bắt các lỗi Promise bị reject toàn cục (Sửa lỗi Uncaught in promise)
window.addEventListener('unhandledrejection', (event) => {
  console.error('CRITICAL: Unhandled Promise Rejection:', event.reason);
  // Hiển thị thông báo nếu là lỗi nghiêm trọng
  if (event.reason && event.reason.message) {
    console.log("Reason message:", event.reason.message);
  }
  event.preventDefault();
});

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error("BOOTSTRAP ERROR:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: white; background: #020617; height: 100vh; font-family: sans-serif;">
      <h1 style="color: #ef4444;">LỖI KHỞI ĐỘNG (BOOTSTRAP)</h1>
      <p>Ứng dụng không thể khởi tạo root. Kiểm tra console để biết chi tiết.</p>
      <pre style="background: #1e293b; padding: 10px; border-radius: 8px; color: #ef4444;">${error instanceof Error ? error.stack : String(error)}</pre>
    </div>
  `;
}
