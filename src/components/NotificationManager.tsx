import React, { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Volume2, VolumeX, Sparkles, X, Play, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EventSchedule } from "../types";

interface NotificationManagerProps {
  schedule: EventSchedule[];
}

const DAY_DATES: { [key: number]: string } = {
  1: "2026-08-06",
  2: "2026-08-07",
  3: "2026-08-08",
  4: "2026-08-09"
};

export default function NotificationManager({ schedule }: NotificationManagerProps) {
  // Settings state stored in localStorage
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("alerts_enabled");
    return saved !== null ? saved === "true" : true;
  });
  
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("alerts_voice_enabled");
    return saved !== null ? saved === "true" : true;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<{
    title: string;
    location: string;
    responsible: string;
    time: string;
  } | null>(null);

  const notifiedEventsRef = useRef<string[]>([]);

  // Load notified events after mounting
  useEffect(() => {
    try {
      const saved = localStorage.getItem("alerts_notified_ids");
      if (saved) {
        notifiedEventsRef.current = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to parse alerts_notified_ids:", e);
    }
  }, []);

  // Save settings on change
  useEffect(() => {
    localStorage.setItem("alerts_enabled", String(isEnabled));
  }, [isEnabled]);

  useEffect(() => {
    localStorage.setItem("alerts_voice_enabled", String(isVoiceEnabled));
  }, [isVoiceEnabled]);

  // Audio synthesizer chime using Web Audio API (No files needed!)
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number, type: OscillatorType = "sine") => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      // Arpeggio chime
      playTone(523.25, now, 0.35);       // C5
      playTone(659.25, now + 0.12, 0.35); // E5
      playTone(783.99, now + 0.24, 0.35); // G5
      playTone(1046.50, now + 0.36, 0.8, "triangle"); // C6
    } catch (e) {
      console.warn("Audio context failed or not allowed by browser autoplay policy:", e);
    }
  };

  // Text to Speech in Arabic
  const speakArabic = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-EG";
      utterance.rate = 0.85; // Slightly slower for crisp clear Arabic pronunciation
      utterance.pitch = 1.0;

      // Try finding Egyptian/Arabic voices
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang.startsWith("ar"));
      if (arVoice) {
        utterance.voice = arVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis failed:", e);
    }
  };

  // Trigger simulated/test alert so user can experience it instantly
  const handleTestAlert = () => {
    playChime();
    const testTitle = "ورشة عمل تفاعلية";
    const testLocation = "الروف العلوي";
    const testResp = "بولا وهاني";
    const testTime = "12:00 م";

    setActiveAlert({
      title: testTitle,
      location: testLocation,
      responsible: testResp,
      time: testTime
    });

    if (isVoiceEnabled) {
      setTimeout(() => {
        speakArabic(`تنبيه هام! تبدأ الآن فقرة: ${testTitle}. المكان: ${testLocation || "غير محدد"}. نتمنى لكم وقتاً مباركاً.`);
      }, 700);
    }
  };

  // Check current time against schedule
  useEffect(() => {
    if (!isEnabled) return;

    const checkTime = () => {
      const now = new Date();
      // Format current Date into YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const currentDateStr = `${year}-${month}-${date}`;

      // Check current day of conference from DAY_DATES
      let currentConferenceDay: number | null = null;
      for (const [day, dStr] of Object.entries(DAY_DATES)) {
        if (dStr === currentDateStr) {
          currentConferenceDay = parseInt(day);
          break;
        }
      }

      // If we are not on any of the conference days, do nothing (unless they simulate it)
      if (!currentConferenceDay) return;

      // Filter events for today
      const todaysEvents = schedule.filter(ev => ev.day === currentConferenceDay);

      todaysEvents.forEach(event => {
        // Parse start time (e.g., "04:45 AM - 07:00 AM" -> start "04:45 AM")
        const parts = event.time.split("-");
        if (parts.length === 0) return;
        const startPart = parts[0].trim(); // e.g. "04:45 AM"
        
        const match = startPart.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return;

        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        const isPM = match[3].toUpperCase() === "PM";
        if (h === 12) h = isPM ? 12 : 0;
        else if (isPM) h += 12;

        const eventTimeMinutes = h * 60 + m;
        const nowTimeMinutes = now.getHours() * 60 + now.getMinutes();

        // If current time is exactly the event start time (or within 1 minute of it)
        // and we haven't notified it yet
        if (nowTimeMinutes === eventTimeMinutes && !notifiedEventsRef.current.includes(event.id)) {
          // Play chime and speak
          playChime();
          setActiveAlert({
            title: event.title,
            location: event.location || "غير محدد",
            responsible: event.responsible || "مسؤولي الفقرة",
            time: startPart
          });

          if (isVoiceEnabled) {
            setTimeout(() => {
              speakArabic(`تبدأ الآن فقرة: ${event.title}. المكان: ${event.location || "الرجاء مراجعة البرنامج"}.`);
            }, 800);
          }

          // Mark as notified and save to ref/localStorage
          notifiedEventsRef.current.push(event.id);
          localStorage.setItem("alerts_notified_ids", JSON.stringify(notifiedEventsRef.current));
        }
      });
    };

    // Run every 20 seconds to be precise and robust
    const intervalId = setInterval(checkTime, 20000);
    // Initial check
    checkTime();

    return () => clearInterval(intervalId);
  }, [schedule, isEnabled, isVoiceEnabled]);

  return (
    <>
      {/* Floating Bell Trigger Button */}
      <div className="fixed bottom-20 left-4 z-40 lg:bottom-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border backdrop-blur-md shadow-2xl cursor-pointer transition-all ${
            isEnabled 
              ? "bg-indigo-600/90 text-white border-indigo-400/50 shadow-indigo-500/30 animate-bounce-slow" 
              : "bg-slate-900/80 text-slate-400 border-white/10"
          }`}
          style={{ animationDuration: "3s" }}
          title="نظام التنبيهات الصوتية للبرنامج"
        >
          {isEnabled ? <Bell className="w-6 h-6 animate-swing" /> : <BellOff className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Floating Active Announcement Overlay (Top of Screen) */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 glass-panel p-5 shadow-2xl border-indigo-500/30 bg-indigo-950/40"
            dir="rtl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-6 h-6 animate-spin-slow" />
                <h4 className="font-serif font-black text-lg tracking-wider">تنبيه الفقرة الحالية!</h4>
              </div>
              <button 
                onClick={() => {
                  setActiveAlert(null);
                  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
                }}
                className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xl font-black text-white drop-shadow-md">{activeAlert.title}</p>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-white/80 pt-3 border-t border-white/10">
                <div>
                  <span className="text-xs text-indigo-300 block">📍 المكان</span>
                  <span className="font-bold">{activeAlert.location || "البرنامج الرئيسي"}</span>
                </div>
                <div>
                  <span className="text-xs text-indigo-300 block">👤 المسؤول</span>
                  <span className="font-bold">{activeAlert.responsible || "كل الخدام"}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  playChime();
                  if (isVoiceEnabled) {
                    speakArabic(`تنبيه: تبدأ الآن فقرة: ${activeAlert.title}. المكان: ${activeAlert.location || "غير محدد"}.`);
                  }
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/20"
              >
                <Volume2 className="w-4 h-4" />
                <span>إعادة نطق التنبيه</span>
              </button>
              <button
                onClick={() => setActiveAlert(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs py-2.5 px-4 transition-colors border border-white/5"
              >
                إغلاق التنبيه
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-panel max-w-md w-full p-6 text-white shadow-2xl border-white/20"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl border border-indigo-500/30">
                    <Bell className="w-5 h-5 animate-swing" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-xl">منبه الفقرات الصوتي</h3>
                    <p className="text-[10px] text-slate-400">نظام الإرشاد الصوتي والسمعي الآلي</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info alert */}
              <div className="mt-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-1.5 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>تنبيه المزامنة التلقائية</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  يقوم هذا النظام التفاعلي بربط جدول المؤتمر الحقيقي (أيام 6، 7، 8، 9 أغسطس 2026) بساعة جهاز المخدومين. عند مجيء موعد الفقرة، يُطلق البرنامج جرس منبه ونطقاً آلياً باللغة العربية.
                </p>
              </div>

              {/* Toggles */}
              <div className="mt-6 space-y-3">
                {/* Bell Alert Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    {isEnabled ? <Volume2 className="text-indigo-400 w-5 h-5" /> : <VolumeX className="text-slate-500 w-5 h-5" />}
                    <div>
                      <span className="font-bold text-sm block text-white">أجراس التنبيه الصوتي</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">إطلاق جرس تنبيه عند بداية الفقرات</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isEnabled ? "bg-indigo-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? "-translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Voice Readout Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Volume2 className="text-indigo-400 w-5 h-5" />
                    <div>
                      <span className="font-bold text-sm block text-white">النطق الآلي للفقرة (TTS)</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">نطق اسم الفقرة والمكان باللغة العربية</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isVoiceEnabled ? "bg-indigo-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isVoiceEnabled ? "-translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Demo button */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleTestAlert}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5 backdrop-blur-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>تجربة وتجريب جرس التنبيه 🔊</span>
                </button>
              </div>

              {/* Footer */}
              <p className="text-[9px] text-center text-slate-500 mt-6 font-mono font-medium">
                ISO 2026 Live Audio Broadcast Engine v1.1
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
