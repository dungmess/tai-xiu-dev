
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
        <div style={{ padding: '40px', color: 'white', background: '#020617', height: '100vh', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', fontSize: '2rem' }}>Hệ thống gặp sự cố render</h1>
          <p style={{ color: '#94a3b8', margin: '20px 0' }}>Lỗi này thường do dữ liệu cũ bị xung đột hoặc lỗi mạng.</p>
          <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', color: '#f87171', overflow: 'auto', textAlign: 'left', maxWidth: '800px', margin: '0 auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {this.state.error?.stack || this.state.error?.message || "Lỗi không xác định"}
            </pre>
          </div>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '30px', padding: '12px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            DỌN DẸP DỮ LIỆU & TẢI LẠI TRANG
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Fatal: Root element '#root' not found in HTML.");
} else {
  // Bắt các lỗi Promise bị reject toàn cục (Xử lý lỗi Uncaught in promise)
  window.addEventListener('unhandledrejection', (event) => {
    console.error('PROMISE REJECTION:', event.reason);
    // Tránh để trình duyệt crash vì undefined rejection
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
    console.log("App mounted successfully.");
  } catch (error) {
    console.error("BOOTSTRAP CRASH:", error);
    rootElement.innerHTML = `
      <div style="padding: 20px; color: #ef4444; background: #020617; height: 100vh;">
        <h2>LỖI KHỞI ĐỘNG HỆ THỐNG</h2>
        <pre>${error instanceof Error ? error.stack : String(error)}</pre>
      </div>
    `;
  }
}
