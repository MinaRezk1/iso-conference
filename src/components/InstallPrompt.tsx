import React, { useState, useEffect } from "react";
import { 
  Download, 
  Smartphone, 
  Share, 
  X, 
  Sparkles,
  ArrowLeft
} from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showPromptBanner, setShowPromptBanner] = useState<boolean>(false);
  const [showAutoModal, setShowAutoModal] = useState<boolean>(false);
  const [iosToast, setIosToast] = useState<boolean>(false);
  const [deviceType, setDeviceType] = useState<"ios" | "android" | "desktop" | null>(null);

  useEffect(() => {
    // Check if running in standalone mode
    const checkStandalone = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                          (navigator as any).standalone || 
                          document.referrer.includes("android-app://");
      
      setIsInstalled(isStandalone);
      return isStandalone;
    };

    const standalone = checkStandalone();

    // Check device type
    const ua = navigator.userAgent.toLowerCase();
    let dev: "ios" | "android" | "desktop" = "desktop";
    if (/iphone|ipad|ipod/.test(ua)) {
      dev = "ios";
    } else if (/android/.test(ua)) {
      dev = "android";
    }
    setDeviceType(dev);

    // Sync with global window prompt if already captured
    if ((window as any).deferredPwaPrompt) {
      const evt = (window as any).deferredPwaPrompt;
      setDeferredPrompt(evt);
      if (!standalone && !localStorage.getItem("pwa_auto_modal_closed")) {
        setShowAutoModal(true);
      }
    }

    const handlePromptReady = () => {
      if ((window as any).deferredPwaPrompt) {
        const evt = (window as any).deferredPwaPrompt;
        setDeferredPrompt(evt);
        if (!standalone && !localStorage.getItem("pwa_auto_modal_closed")) {
          setShowAutoModal(true);
        }
      }
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPwaPrompt = e;
      setDeferredPrompt(e);
      if (!standalone) {
        setShowPromptBanner(true);
        if (!localStorage.getItem("pwa_auto_modal_closed")) {
          setShowAutoModal(true);
        }
      }
    };

    const triggerManualInstall = () => {
      handleInstallClick();
    };

    window.addEventListener("pwa-prompt-ready", handlePromptReady);
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("trigger-install-prompt", triggerManualInstall);

    // Auto show modal fallback after 1.5s if prompt ready or on chrome
    const timer = setTimeout(() => {
      if (!standalone && !localStorage.getItem("pwa_auto_modal_closed")) {
        setShowAutoModal(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pwa-prompt-ready", handlePromptReady);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("trigger-install-prompt", triggerManualInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = (window as any).deferredPwaPrompt || deferredPrompt;

    setShowAutoModal(false);

    if (promptEvent) {
      try {
        // Direct native browser install popup
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") {
          (window as any).deferredPwaPrompt = null;
          setDeferredPrompt(null);
          setShowPromptBanner(false);
          setIsInstalled(true);
        }
      } catch (e) {
        console.warn("Direct install prompt error:", e);
      }
    } else if (deviceType === "ios") {
      setIosToast(true);
      setTimeout(() => setIosToast(false), 6000);
    } else {
      setIosToast(true);
      setTimeout(() => setIosToast(false), 6000);
    }
  };

  const handleDismissAutoModal = () => {
    setShowAutoModal(false);
    localStorage.setItem("pwa_auto_modal_closed", "true");
  };

  const handleDismissBanner = () => {
    setShowPromptBanner(false);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Auto Modal Prompt for Chrome / Browser on Open */}
      {showAutoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-[0_20px_60px_rgba(245,158,11,0.25)] text-slate-100 text-center overflow-hidden">
            {/* Glowing accents */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={handleDismissAutoModal}
              className="absolute top-3 left-3 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30 mb-4 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                  <Smartphone className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <span className="text-[10px] font-black tracking-widest uppercase text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-0.5 rounded-full mb-2">
                تطبيق ISO 2026
              </span>

              <h3 className="text-xl font-black text-white">تثبيت التطبيق على جهازك؟</h3>
              
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                قم بتثبيت التطبيق الآن بنقرة واحدة لتصفح الألحان، السكور، والبرنامج اليومي بسرعة فائقة وبدون حاجة للإنترنت.
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>تثبيت الآن بنقرة واحدة 🚀</span>
              </button>

              <button
                onClick={handleDismissAutoModal}
                className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                المتابعة في المتصفح (لاحقاً)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner for Direct Install */}
      {showPromptBanner && !showAutoModal && (
        <div 
          className="relative z-50 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-3 py-2.5 shadow-xl flex items-center justify-between gap-3 animate-slide-down border-b border-amber-300/40"
          dir="rtl"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-slate-950/20 text-slate-950 p-2 rounded-xl border border-slate-950/20 shrink-0 flex items-center justify-center">
              <Smartphone className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-black leading-tight truncate">
                تثبيت تطبيق ISO 2026
              </h4>
              <p className="text-[10px] font-bold text-slate-900/80 truncate">
                اضغط لتثبيت التطبيق مباشرة على هاتفك
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-slate-950 hover:bg-slate-900 transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>تثبيت</span>
            </button>
            <button
              onClick={handleDismissBanner}
              className="p-1 rounded-lg hover:bg-slate-950/10 text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Minimal Notification Toast for iOS / fallback */}
      {iosToast && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-slate-900 border border-amber-500/40 text-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fade-in" dir="rtl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Share className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold leading-snug">
              {deviceType === "ios" ? "على هواتف iPhone: اضغط زر المشاركة (Share) ⎘ ثم (إضافة للشاشة الرئيسية ➕)" : "اضغط على القائمة (⋮) في متصفحك ثم اختر (تثبيت التطبيق)"}
            </p>
          </div>
          <button 
            onClick={() => setIosToast(false)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}

