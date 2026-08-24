import React, { useEffect, useState } from "react";
import { X, Map, Search, Tent, Clapperboard, Trophy, Star, BookOpen, Wrench, Mic, Sparkles, Zap, Plus } from "lucide-react";

interface PointsDistributionModalProps {
  onClose: () => void;
  onOpenAddLog?: () => void;
}

const staggeredDelay = (index: number) => ({
  animationDelay: `${index * 100}ms`,
  opacity: 0,
  animationFillMode: 'forwards' as const,
});

export default function PointsDistributionModal({ onClose, onOpenAddLog }: PointsDistributionModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/95 backdrop-blur-xl overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        {[...Array(20)].map((_, i) => (
          <Star 
            key={i}
            className="absolute text-amber-300/20 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 15 + 5}px`,
              height: `${Math.random() * 15 + 5}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          />
        ))}
      </div>

      <div 
        className={`relative w-full max-w-5xl max-h-[90vh] flex flex-col glass-panel rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.15)] border border-amber-500/20 transition-all duration-1000 transform ${showContent ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-12"}`}
        dir="rtl"
      >
        <button 
          onClick={onClose}
          className="absolute top-5 left-5 p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-full border border-white/10 transition-all z-20 hover:rotate-90 duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="shrink-0 pt-6 pb-4 px-6 sm:px-10 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-amber-500/5 to-transparent"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 blur-xl opacity-20 animate-pulse"></div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg relative border border-white/20">
                  <Trophy className="w-7 h-7 text-white drop-shadow-md" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-amber-500/20 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>مؤتمر ISO</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 font-serif drop-shadow-sm">
                  نظام توزيع النقاط
                </h2>
              </div>
            </div>
            <div className="text-right md:text-left bg-white/5 px-3 py-2 rounded-xl border border-white/5 backdrop-blur-sm">
              <p className="text-xs text-amber-200/80 font-bold">الهدف</p>
              <p className="text-[10px] text-slate-400 mt-0.5">اجمع أكبر عدد من النقاط لتتصدر الترتيب!</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* Main Events Category */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white/90 flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              الفقرات التنافسية الكبرى
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. الكنز */}
              <div className="group relative bg-gradient-to-b from-amber-500/10 via-black/40 to-black/60 p-4 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all duration-500 overflow-hidden flex flex-col gap-3 slide-up" style={staggeredDelay(1)}>
                <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500/50 group-hover:bg-amber-400 transition-colors"></div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 rounded-lg shrink-0 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-500">
                    <Map className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-black text-white">البحث عن الكنز</h4>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-center mt-1">
                  <span className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-amber-400/20 to-amber-500/5 text-amber-300 font-black text-xs rounded border border-amber-400/30">🥇 الأول: 100</span>
                  <span className="flex items-center justify-center gap-1 py-1 bg-slate-400/10 text-slate-300 font-bold text-[10px] rounded border border-slate-400/20">🥈 الثاني: 75</span>
                  <span className="flex items-center justify-center gap-1 py-1 bg-orange-500/10 text-orange-300 font-bold text-[10px] rounded border border-orange-500/20">🥉 الثالث: 50</span>
                  <span className="col-span-2 flex items-center justify-center gap-1 py-1 bg-blue-500/10 text-blue-300 font-bold text-[10px] rounded border border-blue-500/20">🏅 الرابع: 25</span>
                </div>
              </div>

              {/* 2. الجريمة */}
              <div className="group relative bg-gradient-to-b from-rose-500/10 via-black/40 to-black/60 p-4 rounded-xl border border-rose-500/20 hover:border-rose-500/40 transition-all duration-500 overflow-hidden flex flex-col gap-3 slide-up" style={staggeredDelay(2)}>
                <div className="absolute top-0 right-0 left-0 h-1 bg-rose-500/50 group-hover:bg-rose-400 transition-colors"></div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 rounded-lg shrink-0 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all duration-500">
                    <Search className="w-5 h-5 text-rose-400" />
                  </div>
                  <h4 className="text-sm font-black text-white">لغز الجريمة</h4>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-center mt-1">
                  <span className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-rose-500/20 to-rose-600/5 text-rose-300 font-black text-xs rounded border border-rose-500/30">🥇 الأول: 75</span>
                  <span className="flex items-center justify-center gap-1 py-1 bg-slate-400/10 text-slate-300 font-bold text-[10px] rounded border border-slate-400/20">🥈 الثاني: 50</span>
                  <span className="flex items-center justify-center gap-1 py-1 bg-orange-500/10 text-orange-300 font-bold text-[10px] rounded border border-orange-500/20">🥉 الثالث: 25</span>
                  <span className="col-span-2 flex items-center justify-center gap-1 py-1 bg-blue-500/10 text-blue-300 font-bold text-[10px] rounded border border-blue-500/20">🏅 الرابع: 10</span>
                </div>
              </div>

              {/* 3. المولد */}
              <div className="group relative bg-gradient-to-b from-emerald-500/10 via-black/40 to-black/60 p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden flex flex-col gap-3 slide-up" style={staggeredDelay(3)}>
                <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-500/50 group-hover:bg-emerald-400 transition-colors"></div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
                    <Tent className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-black text-white">ألعاب المولد</h4>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-center mt-1">
                  <span className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-emerald-600/5 text-emerald-300 font-black text-xs rounded border border-emerald-500/30">🥇 الأول: 75</span>
                  <span className="flex items-center justify-center gap-1 py-1 bg-slate-400/10 text-slate-300 font-bold text-[10px] rounded border border-slate-400/20">🥈 الثاني: 50</span>
                  <span className="flex items-center justify-center gap-1 py-1 bg-orange-500/10 text-orange-300 font-bold text-[10px] rounded border border-orange-500/20">🥉 الثالث: 25</span>
                  <span className="col-span-2 flex items-center justify-center gap-1 py-1 bg-blue-500/10 text-blue-300 font-bold text-[10px] rounded border border-blue-500/20">🏅 الرابع: 10</span>
                </div>
              </div>

              {/* 4. الاسكتشات */}
              <div className="group relative bg-gradient-to-b from-purple-500/10 via-black/40 to-black/60 p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 overflow-hidden flex flex-col gap-3 slide-up" style={staggeredDelay(4)}>
                <div className="absolute top-0 right-0 left-0 h-1 bg-purple-500/50 group-hover:bg-purple-400 transition-colors"></div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 rounded-lg shrink-0 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
                    <Clapperboard className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-black text-white">عروض الاسكتشات</h4>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-center mt-1">
                  <span className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-purple-500/20 to-purple-600/5 text-purple-300 font-black text-xs rounded border border-purple-500/30">🥇 الأول: 40</span>
                  <span className="flex items-center justify-center gap-1 py-1 bg-slate-400/10 text-slate-300 font-bold text-[10px] rounded border border-slate-400/20">🥈 الثاني: 30</span>
                  <span className="flex items-center justify-center gap-1 py-1 bg-orange-500/10 text-orange-300 font-bold text-[10px] rounded border border-orange-500/20">🥉 الثالث: 20</span>
                  <span className="col-span-2 flex items-center justify-center gap-1 py-1 bg-blue-500/10 text-blue-300 font-bold text-[10px] rounded border border-blue-500/20">🏅 الرابع: 10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Events Category */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black text-white/90 flex items-center gap-2 mb-2 px-1">
              <div className="w-1 h-4 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              النقاط التفصيلية للفقرات
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 5. دراسة الكتاب */}
              <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 slide-up" style={staggeredDelay(5)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-black text-white">دراسة الكتاب</h4>
                  </div>
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/30">ماكس: 60</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-slate-300 font-bold">الحضور</span>
                    <span className="text-white font-mono font-bold">10</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-slate-300 font-bold">التفاعل والأسئلة</span>
                    <span className="text-white font-mono font-bold">50</span>
                  </div>
                </div>
              </div>

              {/* 6. ورش العمل */}
              <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 slide-up" style={staggeredDelay(6)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-black text-white">ورش العمل</h4>
                  </div>
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded border border-cyan-500/30">ماكس: 60</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-slate-300 font-bold">الحضور</span>
                    <span className="text-white font-mono font-bold">10</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-slate-300 font-bold">التفاعل</span>
                    <span className="text-white font-mono font-bold">20</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-slate-300 font-bold">حل اللغز</span>
                    <span className="text-white font-mono font-bold">30</span>
                  </div>
                </div>
              </div>

              {/* 7. المحاضرات */}
              <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 slide-up" style={staggeredDelay(7)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                      <Mic className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-black text-white">المحاضرات</h4>
                  </div>
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-500/30">ماكس: 30</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-slate-300 font-bold">الحضور</span>
                    <span className="text-white font-mono font-bold">10</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-slate-300 font-bold">التفاعل</span>
                    <span className="text-white font-mono font-bold">20</span>
                  </div>
                </div>
              </div>

              {/* 8. بونص التجمع السريع */}
              <div className="group bg-gradient-to-b from-amber-500/10 via-black/40 to-black/60 p-4 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-colors duration-300 slide-up" style={staggeredDelay(8)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                      <Zap className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-black text-white">الحضور المبكر</h4>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-amber-300 font-bold">المركز الأول</span>
                    <span className="text-white font-mono font-bold bg-amber-500/20 px-1.5 rounded border border-amber-500/30">+10</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-slate-300 font-bold">المركز الثاني</span>
                    <span className="text-white font-mono font-bold bg-slate-500/20 px-1.5 rounded border border-slate-500/30">+7</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-orange-300 font-bold">المركز الثالث</span>
                    <span className="text-white font-mono font-bold bg-orange-500/20 px-1.5 rounded border border-orange-500/30">+5</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 px-3 py-1.5 rounded text-[11px]">
                    <span className="text-blue-300 font-bold">المركز الرابع</span>
                    <span className="text-white font-mono font-bold bg-blue-500/20 px-1.5 rounded border border-blue-500/30">+3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* Modal Footer with Direct Add Points Action */}
        <div className="shrink-0 p-4 sm:px-8 border-t border-white/10 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-400 font-medium text-center sm:text-right">
            هل تريد رصد نقاط لفقرة جديدة وتحديث الترتيب مباشرة؟
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenAddLog && (
              <button
                onClick={onOpenAddLog}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>رصد وإضافة نقاط الآن 🚀</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .slide-up {
          animation-name: slideUpFade;
          animation-duration: 0.6s;
          animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
