import React, { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// --- Cache Busting Logic ---
// __BUILD_TIME__ is injected automatically at build time (see vite.config.ts)
// so this changes on every deploy without anyone needing to remember to
// bump a version number by hand.
declare const __BUILD_TIME__: string;
const APP_VERSION = typeof __BUILD_TIME__ !== 'undefined' ? __BUILD_TIME__ : 'dev';
const currentVersion = localStorage.getItem('appVersion');

if (currentVersion !== APP_VERSION) {
  localStorage.setItem('appVersion', APP_VERSION);
  
  // Clear service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Clear CacheStorage
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  
  // Force a hard reload
  window.location.reload();
}

// Register PWA service worker safely
try {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ 
      immediate: true,
      onNeedRefresh() {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (let registration of registrations) {
              registration.update();
            }
          });
        }
        window.location.reload();
      }
    });
  }).catch((err) => {
    console.warn("PWA registration not available", err);
  });
} catch (e) {
  console.warn("SW registration error", e);
}


interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center"
          dir="rtl"
        >
          <div className="bg-slate-900 border border-amber-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="text-4xl animate-bounce">⚠️</div>
            <h1 className="text-xl font-black text-amber-300 font-serif">
              حدث خطأ غير متوقع في التحميل
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              نقوم بإعادة تنشيط التطبيق تلقائياً. يرجى الضغط على الزر أدناه لإعادة تحميل الصفحة.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition shadow-lg cursor-pointer"
            >
              🔄 إعادة تحميل تطبيق ISO
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

