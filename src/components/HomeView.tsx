import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Music, 
  BookOpen, 
  Home, 
  Flame, 
  MapPin, 
  ChevronLeft, 
  Sparkles, 
  Clock, 
  Radio, 
  Users, 
  CheckCircle2,
  Share2
} from 'lucide-react';
import { Team, EventSchedule, Song, Lesson, Room, CopticHymn, ConferenceGroup } from '../types';
import { Trophy3D, Calendar3D, Music3D, Book3D, Home3D, CopticCross3D } from './ThreeDIcons';

interface HomeViewProps {
  teams?: Team[];
  schedule: EventSchedule[];
  songs?: Song[];
  lessons?: Lesson[];
  rooms?: Room[];
  alhan?: CopticHymn[];
  conferenceGroups?: ConferenceGroup[];
  setActiveTab: (tab: string) => void;
}

export default function HomeView({ 
  teams = [], 
  schedule, 
  songs = [], 
  lessons = [], 
  rooms = [], 
  alhan = [],
  conferenceGroups = [],
  setActiveTab 
}: HomeViewProps) {

  // Current Live Event Detection
  const [activeLiveEvent, setActiveLiveEvent] = useState<EventSchedule | null>(null);

  useEffect(() => {
    const updateActiveEvent = () => {
      const live = schedule.find(ev => ev.status === "live");
      if (live) {
        setActiveLiveEvent(live);
      } else {
        const upcoming = schedule.find(ev => ev.status === "upcoming");
        setActiveLiveEvent(upcoming || schedule[0] || null);
      }
    };

    updateActiveEvent();
    const interval = setInterval(updateActiveEvent, 10000);
    return () => clearInterval(interval);
  }, [schedule]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in" dir="rtl">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-amber-950/60 p-6 sm:p-10 border border-indigo-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                مؤتمر ISO 2026
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                كنيسة الشهيد مارمينا
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight">
              أهلاً بكم في مؤتمر ISO 🌟
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              معايير الجودة الروحية والشخصية لحياة الشاب المسيحي. تابع جدول اليومين، الألحان والترانيم، دراسات الكتاب، ومجموعات العمل لحظة بلحظة.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('schedule')}
              className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>جدول المؤتمر 📅</span>
            </button>
            <button
              onClick={() => setActiveTab('alhan')}
              className="flex-1 md:flex-none px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CopticCross3D className="w-4 h-4" />
              <span>قسم الألحان 🎶</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Live / Upcoming Event Box */}
      {activeLiveEvent && (
        <div 
          onClick={() => setActiveTab('schedule')}
          className="glass-card p-5 sm:p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-slate-900/80 to-indigo-950/40 hover:border-amber-400/70 transition-all duration-300 cursor-pointer shadow-xl group relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 animate-pulse">
                <Radio className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    {activeLiveEvent.status === "live" ? "الفقرة الجارية الآن" : "الفقرة القادمة في الجدول"}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">اليوم {activeLiveEvent.day === 1 ? "الأول" : "الثاني"}</span>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                  {activeLiveEvent.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1 text-amber-300">
                    <Clock className="w-3.5 h-3.5" />
                    {activeLiveEvent.time}
                  </span>
                  {activeLiveEvent.location && (
                    <span className="flex items-center gap-1 text-indigo-300">
                      <MapPin className="w-3.5 h-3.5" />
                      {activeLiveEvent.location}
                    </span>
                  )}
                  {activeLiveEvent.speaker && (
                    <span className="text-slate-400">
                      بتقديم: <strong className="text-white">{activeLiveEvent.speaker}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 group-hover:translate-x-[-4px] transition-transform self-end sm:self-center shrink-0">
              <span>عرض كامل الجدول</span>
              <ChevronLeft className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Main Core 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Coptic Hymns (الألحان القبطية) */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('alhan')}
          className="glass-card p-6 cursor-pointer group flex flex-col justify-between relative overflow-hidden border border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 rounded-3xl h-full bg-slate-900/70"
        >
          <div className="flex justify-between items-center relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 rounded-2xl p-3 text-amber-300 border border-amber-500/30 shrink-0">
                <CopticCross3D className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  قسم الألحان الكنسية 🎶
                </h3>
                <span className="text-[11px] text-amber-300/80 font-medium">لحن شيري ثيؤطوكي بارثيني (لحن المؤتمر)</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 group-hover:text-amber-300 transition-all shrink-0" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-end">
            <div className="pt-2 border-t border-white/10 bg-amber-950/20 p-3.5 rounded-2xl space-y-2 h-[155px] flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-300/90 border-b border-white/10 pb-1.5">
                <span>فقرة حفظ اللحن بالمؤتمر:</span>
                <span className="text-[10px] text-slate-400">قبطي + معرب + ترجمة</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                <li className="text-amber-300 font-bold">لحن المؤتمر: شيري ثيؤطوكي بارثيني</li>
                <li className="text-white font-medium">النطق القبطي المعرب للترديد الجماعي</li>
                <li className="text-amber-300 font-medium">الترجمة العربية وتوجيهات الهزات</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Conference Songs (ترانيم وشعار مؤتمر ISO) */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('songs')}
          className="glass-card p-6 cursor-pointer group flex flex-col justify-between relative overflow-hidden border border-purple-500/30 hover:border-purple-400/60 transition-all duration-300 rounded-3xl h-full bg-slate-900/70"
        >
          <div className="flex justify-between items-center relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 rounded-2xl p-3 text-purple-300 border border-purple-500/30 shrink-0">
                <Music3D className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  ترانيم وشعار المؤتمر 🎼
                </h3>
                <span className="text-[11px] text-purple-300/80 font-medium">شعار المؤتمر + ترنيمة ١ & ترنيمة ٢</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 group-hover:text-purple-300 transition-all shrink-0" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-end">
            <div className="pt-2 border-t border-white/10 bg-purple-950/25 p-3.5 rounded-2xl space-y-2 h-[155px] flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px] font-bold text-purple-300 border-b border-white/10 pb-1.5">
                <span>شعار وترانيم مؤتمر ISO:</span>
                <span className="text-[10px] text-slate-400">تحديث فوري</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                <li className="text-amber-300 font-bold">شعار المؤتمر: أساس النجاح هو الإيمان...</li>
                <li className="text-white font-medium">يا قارئ كل تفاصيلي وخابرها...</li>
                <li className="text-white font-medium">سأدنو منك ياربي وألمس ثوبك الآن...</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Lessons & Bible Studies (الشروحات ودراسات الكتاب) */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('lessons')}
          className="glass-card p-6 cursor-pointer group flex flex-col justify-between relative overflow-hidden border border-indigo-500/30 hover:border-indigo-400/60 transition-all duration-300 rounded-3xl h-full bg-slate-900/70"
        >
          <div className="flex justify-between items-center relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 rounded-2xl p-3 text-indigo-300 border border-indigo-500/30 shrink-0">
                <Book3D className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  دراسات الكتاب والمحاضرات 📖
                </h3>
                <span className="text-[11px] text-indigo-300/80 font-medium">أمثال 9-10، سيراخ 48-49، معايير ISO</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 group-hover:text-indigo-300 transition-all shrink-0" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-end">
            <div className="pt-2 border-t border-white/10 bg-indigo-950/25 p-3.5 rounded-2xl space-y-2 h-[155px] flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 border-b border-white/10 pb-1.5">
                <span>مواد الشرح والمسابقات:</span>
                <span className="text-[10px] text-slate-400">اليومين</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                <li className="text-white font-medium">اليوم 1: أمثال 9-10 + محاضرة (كونوا رجالاً)</li>
                <li className="text-white font-medium">اليوم 2: يشوع بن سيراخ 48-49 + الاحتراق النفسي</li>
                <li className="text-indigo-300 font-bold">محاضرة معايير الجودة ISO ومحاضرة أقنوم الحكمة</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Conference Groups (مجموعات المؤتمر وورش العمل) */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => setActiveTab('groups')}
          className="glass-card p-6 cursor-pointer group flex flex-col justify-between relative overflow-hidden border border-emerald-500/30 hover:border-emerald-400/60 transition-all duration-300 rounded-3xl h-full bg-slate-900/70"
        >
          <div className="flex justify-between items-center relative z-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 rounded-2xl p-3 text-emerald-300 border border-emerald-500/30 shrink-0">
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  مجموعات المؤتمر وورش العمل 👥
                </h3>
                <span className="text-[11px] text-emerald-300/80 font-medium">جروبات التنافس، ورش العمل، وأسماء المجموعات</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:-translate-x-1 group-hover:text-emerald-300 transition-all shrink-0" />
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-end">
            <div className="pt-2 border-t border-white/10 bg-emerald-950/25 p-3.5 rounded-2xl space-y-2 h-[155px] flex flex-col justify-center">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 border-b border-white/10 pb-1.5">
                <span>توزيع المجموعات والمسابقات:</span>
                <span className="text-[10px] text-slate-400">تحديث فوري</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside pt-1">
                <li className="text-white font-medium">معرفة جروبك والخدام المسؤولين</li>
                <li className="text-white font-medium">ورش العمل والأنشطة التفاعلية الجماعية</li>
                <li className="text-emerald-300 font-bold">متابعة مسابقات ونقاط المجموعات</li>
              </ul>
            </div>
          </div>
        </motion.div>

      </div>

    </div>
  );
}
