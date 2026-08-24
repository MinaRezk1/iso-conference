import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Church, Play, Smartphone, Trophy, Music, Home, ChevronRight } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

// Web Audio API Chime sound generator for button click
const playHeavenlyChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Notes for C-Major pentatonic / heavenly arpeggio
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
    
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
      
      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + index * 0.08 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + index * 0.08);
      osc.stop(ctx.currentTime + index * 0.08 + 1.3);
    });
  } catch (err) {
    console.error("Audio playback error:", err);
  }
};

const playHoverSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(659.25, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
};

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [logoSrc, setLogoSrc] = useState('/reflect-logo-trans.png');

  const handleStart = () => {
    playHeavenlyChime();
    setIsStarting(true);
    setTimeout(() => {
      onStart();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-slate-100 overflow-y-auto px-4 py-4 sm:py-6 select-none font-sans"
        dir="rtl"
      >
        {/* Ambient Glowing Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/80 via-slate-950 to-amber-950/40 opacity-95" />
          
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-1/2 translate-x-1/2 w-[22rem] h-[22rem] bg-amber-500/15 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1.1, 0.9, 1.1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[26rem] h-[26rem] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"
          />

          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-10" />
        </div>

        {/* TOP HEADER */}
        <motion.header 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 w-full max-w-4xl mx-auto flex items-center justify-between gap-2 shrink-0 pt-1"
        >
          {/* Right Badge: St. Anba Ruwais Family */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-amber-500/30 shadow-md">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-right">
              <h3 className="text-[11px] sm:text-xs font-black text-amber-300 leading-tight">
                أسرة الأنبا رويس
              </h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-amber-200/70">
                شباب ثانوي
              </p>
            </div>
          </div>

          {/* Left Badge: St. Mina Church */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-sky-500/30 shadow-md">
            <div className="text-left">
              <h3 className="text-[11px] sm:text-xs font-black text-sky-200 leading-tight">
                كنيسة مارمينا
              </h3>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                أرض الأحلام
              </p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 shrink-0">
              <Church className="w-3.5 h-3.5 text-sky-300" />
            </div>
          </div>
        </motion.header>

        {/* MAIN CENTER SECTION */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6 my-auto w-full max-w-md mx-auto text-center">
          <motion.div
            animate={
              isStarting
                ? {
                    scale: 1.5,
                    opacity: 0,
                    filter: "blur(15px)",
                    transition: { duration: 0.8, ease: "easeIn" },
                  }
                : {
                    scale: 1,
                    opacity: 1,
                    transition: { duration: 0.6, ease: "easeOut" },
                  }
            }
            className="flex flex-col items-center justify-center w-full"
          >
            {/* Logo Emblem Container */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl bg-slate-900/80 border border-amber-500/30 p-4 shadow-[0_0_40px_rgba(245,158,11,0.2)] backdrop-blur-md flex items-center justify-center overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-indigo-500/10 opacity-50" />
              <img
                src={logoSrc}
                alt="شعار مؤتمر ISO"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-105"
                onError={() => {
                  if (logoSrc !== '/reflect-logo.png') {
                    setLogoSrc('/reflect-logo.png');
                  }
                }}
              />
            </motion.div>
            
            {/* Title & Conference Name */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-6 space-y-1.5"
            >
              <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black rounded-full shadow-inner">
                مؤتمر ISO 2026
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 tracking-tight drop-shadow-md font-serif">
                ISO
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-300 max-w-xs mx-auto leading-relaxed">
                التطبيق الرسمي لمؤتمر شباب ثانوي كنيسة الشهيد العظيم مارمينا أرض الأحلام
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* BOTTOM ACTION FOOTER */}
        <motion.footer
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-20 w-full max-w-md mx-auto flex flex-col items-center gap-3 text-center shrink-0 pb-2"
        >
          {/* START PROGRAM BUTTON */}
          <div className="relative group w-full">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 opacity-70 blur-md group-hover:opacity-100 transition duration-300 animate-pulse" />
            
            <motion.button
              onMouseEnter={playHoverSound}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              disabled={isStarting}
              className="relative w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 overflow-hidden shadow-xl cursor-pointer transition-all duration-300"
            >
              <span className="text-lg sm:text-xl font-extrabold tracking-wide">
                ابدأ البرنامج الان
              </span>
              <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
            </motion.button>
          </div>

          {/* Install App Button */}
          <button 
            onClick={() => window.dispatchEvent(new Event('trigger-install-prompt'))}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md border border-slate-700/80 rounded-xl text-amber-300 font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>تثبيت التطبيق على الموبايل (PWA)</span>
          </button>

          {/* Quick Features Row */}
          <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 pt-1 flex-wrap">
            <span className="bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">🏆 السكور</span>
            <span className="bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">⚽ الكورة</span>
            <span className="bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">🎵 الترانيم</span>
            <span className="bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-800">🏠 التسكين</span>
          </div>
        </motion.footer>
      </motion.div>
    </AnimatePresence>
  );
}

