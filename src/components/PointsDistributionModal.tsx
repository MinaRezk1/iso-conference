import React, { useEffect, useState } from "react";
import { X, Trophy, Star, Sparkles, Plus, Church, Users, BookOpen, DoorOpen, Music, Crown, Gamepad2, Map, Target, Smile, UserMinus } from "lucide-react";

interface PointsDistributionModalProps {
  onClose: () => void;
  onOpenAddLog?: () => void;
}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* 1. حضور القداس */}
            <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0"><Church className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">حضور القداس</h4>
              </div>
              <span className="self-start bg-amber-500/20 text-amber-300 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-500/30">20 درجة</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">تُعطى للمجموعة اللي حضر منها أكبر عدد.</p>
            </div>

            {/* 2. التجمع */}
            <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "50ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0"><Users className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">التجمع (صلاة / محاضرات)</h4>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <span className="py-1 bg-amber-500/15 text-amber-300 font-black text-[10px] rounded border border-amber-500/20">🥇 20</span>
                <span className="py-1 bg-slate-400/10 text-slate-300 font-bold text-[10px] rounded border border-slate-400/20">🥈 15</span>
                <span className="py-1 bg-orange-500/10 text-orange-300 font-bold text-[10px] rounded border border-orange-500/20">🥉 10</span>
                <span className="py-1 bg-blue-500/10 text-blue-300 font-bold text-[10px] rounded border border-blue-500/20">4️⃣ 0</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">ترتيب المجموعات الأربعة حسب الالتزام والانضباط.</p>
            </div>

            {/* 3. تفاعل */}
            <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0"><BookOpen className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">تفاعل (دراسة الكتاب / محاضرات)</h4>
              </div>
              <span className="self-start bg-blue-500/20 text-blue-300 text-xs font-black px-2.5 py-1 rounded-lg border border-blue-500/30">حتى 10 لكل مجموعة</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">الأسئلة توزع بالتساوي على كل المجموعات لتكافؤ الفرص.</p>
            </div>

            {/* 4. نظافة الغرف */}
            <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0"><DoorOpen className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">نظافة الغرف</h4>
              </div>
              <span className="self-start bg-cyan-500/20 text-cyan-300 text-xs font-black px-2.5 py-1 rounded-lg border border-cyan-500/30">حتى 10 لكل مجموعة</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">لو الغرفة فيها أفراد من مجموعات مختلفة، الدرجة تتضاف لكل واحد لمجموعته.</p>
            </div>

            {/* 5. حفظ اللحن */}
            <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400 shrink-0"><Music className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">حفظ اللحن (تسميع)</h4>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <span className="py-1 bg-amber-500/15 text-amber-300 font-black text-[10px] rounded border border-amber-500/20">🥇 20</span>
                <span className="py-1 bg-slate-400/10 text-slate-300 font-bold text-[10px] rounded border border-slate-400/20">🥈 15</span>
                <span className="py-1 bg-orange-500/10 text-orange-300 font-bold text-[10px] rounded border border-orange-500/20">🥉 10</span>
                <span className="py-1 bg-blue-500/10 text-blue-300 font-bold text-[10px] rounded border border-blue-500/20">4️⃣ 5</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">تسميع للمجموعة كلها، وترتيب أربع مستويات.</p>
            </div>

            {/* 6. أفضل سلوك فردي */}
            <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "250ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 shrink-0"><Crown className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">أفضل سلوك فردي</h4>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-rose-500/20 text-rose-300 text-xs font-black px-2.5 py-1 rounded-lg border border-rose-500/30">ولد: 20</span>
                <span className="bg-pink-500/20 text-pink-300 text-xs font-black px-2.5 py-1 rounded-lg border border-pink-500/30">بنت: 20</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">أفضل أخلاق وروح رياضية، بالاتفاق بين كل الخدام. الدرجة تضاف لمجموعة الفائز/ة.</p>
            </div>

            {/* 7. الألعاب التنافسية */}
            <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400 shrink-0"><Gamepad2 className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">الألعاب التنافسية</h4>
              </div>
              <span className="self-start bg-teal-500/20 text-teal-300 text-xs font-black px-2.5 py-1 rounded-lg border border-teal-500/30">10 درجات / لعبة</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">للمجموعة الفائزة، ويمكن تكرارها لأكتر من لعبة لو الوقت متاح.</p>
            </div>

            {/* 8. الكنز */}
            <div className="group bg-gradient-to-b from-amber-500/10 via-black/40 to-black/60 p-4 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "350ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0"><Map className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">الكنز</h4>
              </div>
              <span className="self-start bg-amber-500/20 text-amber-300 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-500/30">30 درجة</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">للمجموعة الفائزة بالكنز.</p>
            </div>

            {/* 9. سكيب روم */}
            <div className="group bg-gradient-to-b from-emerald-500/10 via-black/40 to-black/60 p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "400ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0"><Target className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">سكيب روم</h4>
              </div>
              <span className="self-start bg-emerald-500/20 text-emerald-300 text-xs font-black px-2.5 py-1 rounded-lg border border-emerald-500/30">30 درجة</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">للمجموعة الفائزة.</p>
            </div>

            {/* 10. حفلة التنكر */}
            <div className="group bg-black/40 p-4 rounded-xl border border-white/10 hover:bg-black/60 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "450ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-fuchsia-500/10 rounded-lg text-fuchsia-400 shrink-0"><Smile className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">حفلة التنكر</h4>
              </div>
              <div className="flex gap-1.5">
                <span className="bg-fuchsia-500/20 text-fuchsia-300 text-xs font-black px-2.5 py-1 rounded-lg border border-fuchsia-500/30">ولد: 20</span>
                <span className="bg-pink-500/20 text-pink-300 text-xs font-black px-2.5 py-1 rounded-lg border border-pink-500/30">بنت: 20</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">اختيار أفضل تنكر ولد وأفضل تنكر بنت، تضاف لمجموعة كل فائز/ة.</p>
            </div>

            {/* 11. خصم / جزاء */}
            <div className="group bg-gradient-to-b from-rose-500/10 via-black/40 to-black/60 p-4 rounded-xl border border-rose-500/30 hover:border-rose-500/50 transition-colors duration-300 flex flex-col gap-2.5 slide-up" style={{ animationDelay: "500ms" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/15 rounded-lg text-rose-400 shrink-0"><UserMinus className="w-4 h-4" /></div>
                <h4 className="text-sm font-black text-white">خصم / جزاء</h4>
              </div>
              <span className="self-start bg-rose-500/20 text-rose-300 text-xs font-black px-2.5 py-1 rounded-lg border border-rose-500/30">➖ رقم سالب</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">لخصم درجات نتيجة مخالفة، متاح من نفس شاشة رصد النقاط.</p>
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
