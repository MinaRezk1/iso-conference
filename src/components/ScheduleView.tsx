import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  DoorOpen, 
  Sparkles, 
  Gamepad2, 
  Music, 
  Compass, 
  Sun, 
  EyeOff, 
  Users, 
  Trophy, 
  Moon, 
  BookOpen, 
  Brain, 
  Smile,
  X,
  CalendarDays,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Target,
  Award,
  Table,
  LayoutGrid,
  Search,
  UserCheck
} from "lucide-react";
import { EventSchedule, Team } from "../types";
import { db } from "../lib/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, setDoc, writeBatch } from "firebase/firestore";
import { Calendar3D } from "./ThreeDIcons";
import StructuredScoringModal, { SessionCategory } from "./StructuredScoringModal";

interface ScheduleViewProps {
  schedule: EventSchedule[];
  teams: Team[];
  isAdmin: boolean;
  onRefreshData: () => void;
}

const formatArabicTime = (timeStr: string) => {
  return timeStr.replace(/AM/gi, 'ص').replace(/PM/gi, 'م');
};

const isEventActive = (timeRange: string) => {
  const parts = timeRange.split('-');
  if (parts.length !== 2) return false;
  
  const parseTime = (t: string) => {
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const isPM = match[3].toUpperCase() === 'PM';
    if (h === 12) h = isPM ? 12 : 0;
    else if (isPM) h += 12;
    return h * 60 + m;
  };

  const startMins = parseTime(parts[0].trim());
  let endMins = parseTime(parts[1].trim());
  if (endMins < startMins) endMins += 24 * 60;

  const now = new Date();
  let currentMins = now.getHours() * 60 + now.getMinutes();
  
  if (currentMins < 6 * 60 && startMins > 18 * 60) {
    currentMins += 24 * 60;
  }

  return currentMins >= startMins && currentMins <= endMins;
};

const IconMap: { [key: string]: any } = {
  DoorOpen, Sparkles, Gamepad2, Music, Compass, Sun, EyeOff, Users, Trophy, Moon, BookOpen, Brain, Smile
};

export default function ScheduleView({ schedule, teams, isAdmin, onRefreshData }: ScheduleViewProps) {
  const [activeDay, setActiveDay] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'matrix'>('timeline');
  const [searchQuery, setSearchQuery] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState<EventSchedule | null>(null);

  // Servant Scoring Modal State
  const [scoringEvent, setScoringEvent] = useState<EventSchedule | null>(null);
  const [servantName, setServantName] = useState("");
  const [eventTeamPointsMap, setEventTeamPointsMap] = useState<{ [teamId: string]: string }>({});
  const [eventScoreNotes, setEventScoreNotes] = useState("");
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  const [itemsPerRow, setItemsPerRow] = useState(3);
  const [, setCurrentTimeTick] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerRow(2);
      else if (window.innerWidth < 1024) setItemsPerRow(3);
      else setItemsPerRow(4);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const timer = setInterval(() => {
      setCurrentTimeTick(prev => prev + 1);
    }, 60000);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);

  // Form states for Add / Edit Schedule Item
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [day, setDay] = useState<number>(1);
  const [speaker, setSpeaker] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Sparkles");
  const [location, setLocation] = useState("");
  const [responsible, setResponsible] = useState("");
  const [maxPoints, setMaxPoints] = useState<number>(0);

  const getEventIndex = (id: string): number | null => {
    const match = id.match(/^event\d+_(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 9999;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    let totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 4 * 60) {
      totalMinutes += 24 * 60;
    }
    
    return totalMinutes;
  };

  const sortedAllEvents = [...schedule].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    const indexA = getEventIndex(a.id);
    const indexB = getEventIndex(b.id);
    if (indexA !== null && indexB !== null) return indexA - indexB;
    return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
  });

  const filteredEvents = sortedAllEvents
    .filter(event => event.day === activeDay)
    .filter(event => 
      !searchQuery.trim() || 
      event.title.includes(searchQuery) || 
      (event.responsible && event.responsible.includes(searchQuery)) ||
      (event.location && event.location.includes(searchQuery))
    );

  const resetForm = () => {
    setTitle("");
    setTime("");
    setDay(activeDay);
    setSpeaker("");
    setDescription("");
    setIcon("Sparkles");
    setLocation("");
    setResponsible("");
    setMaxPoints(0);
    setIsEditing(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (event: EventSchedule) => {
    setTitle(event.title);
    setTime(event.time);
    setDay(event.day);
    setSpeaker(event.speaker || "");
    setDescription(event.description || "");
    setIcon(event.icon || "Sparkles");
    setLocation(event.location || "");
    setResponsible(event.responsible || "");
    setMaxPoints(event.maxPoints || 0);
    setIsEditing(event);
    setShowAddModal(true);
  };

  // Open Servant Score Awarding Modal
  const handleOpenScoreModal = (event: EventSchedule) => {
    setScoringEvent(event);
    setServantName(event.scoredBy || "");
    setEventScoreNotes(event.scoreNotes || "");
    
    const initialMap: { [key: string]: string } = {};
    teams.forEach(team => {
      const existingVal = event.awardedPoints ? event.awardedPoints[team.id] : undefined;
      initialMap[team.id] = existingVal !== undefined ? String(existingVal) : "0";
    });
    setEventTeamPointsMap(initialMap);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time) {
      alert("الرجاء ملء عنوان الفقرة والوقت!");
      return;
    }

    try {
      if (isEditing) {
        const docRef = doc(db, "schedule", isEditing.id);
        await setDoc(docRef, {
          title,
          time,
          day: Number(day),
          speaker,
          description,
          icon,
          location,
          responsible,
          maxPoints: Number(maxPoints) || 0
        }, { merge: true });
      } else {
        const colRef = collection(db, "schedule");
        await addDoc(colRef, {
          title,
          time,
          day: Number(day),
          speaker,
          description,
          icon,
          location,
          responsible,
          completed: false,
          maxPoints: Number(maxPoints) || 0
        });
      }
      onRefreshData();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ الفقرة.");
    }
  };

  // Handle Structured Scoring for Schedule Event
  const handleStructuredScheduleSubmit = async (data: {
    activityName: string;
    category: SessionCategory;
    teamPointsMap: { [teamId: string]: number };
    breakdownNotes: string;
    notes: string;
  }) => {
    if (!scoringEvent) return;

    try {
      const batch = writeBatch(db);

      // 1. Update schedule document
      const eventRef = doc(db, "schedule", scoringEvent.id);
      batch.set(eventRef, {
        awardedPoints: data.teamPointsMap,
        scoredBy: servantName.trim() || "الخادم المسئول",
        scoreNotes: data.breakdownNotes,
        completed: true
      }, { merge: true });

      // 2. Add or update linked scoreLog entry
      const logColRef = collection(db, "scoreLogs");
      const logId = `event_log_${scoringEvent.id}`;
      const logRef = doc(logColRef, logId);
      
      const previousPoints = scoringEvent.awardedPoints || {};

      batch.set(logRef, {
        activityName: `فقرة: ${data.activityName}`,
        timestamp: new Date(),
        notes: data.notes ? `${data.notes} • [تفاصيل: ${data.breakdownNotes}]` : `[تفاصيل: ${data.breakdownNotes}]`,
        points: data.teamPointsMap,
        eventId: scoringEvent.id
      }, { merge: true });

      // 3. Recalculate team total scores cleanly
      teams.forEach(team => {
        const prevScore = previousPoints[team.id] || 0;
        const newScore = data.teamPointsMap[team.id] || 0;
        const diff = newScore - prevScore;

        if (diff !== 0) {
          const teamRef = doc(db, "teams", team.id);
          const currentTotal = team.totalScore || 0;
          batch.set(teamRef, {
            id: team.id,
            name: team.name,
            color: team.color || "#f43f5e",
            bgColor: team.bgColor || "bg-indigo-50 dark:bg-indigo-950/20",
            borderColor: team.borderColor || "border-indigo-200 dark:border-indigo-900",
            logo: team.logo || "🔴",
            totalScore: Math.max(0, currentTotal + diff)
          }, { merge: true });
        }
      });

      await batch.commit();
      onRefreshData();
      setScoringEvent(null);
    } catch (err) {
      console.error("Error saving event scores:", err);
      alert("حدث خطأ أثناء حفظ نقاط الفقرة.");
    }
  };

  // Handle Saving Event Scores by Servant
  const handleSaveEventScores = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringEvent) return;

    if (!servantName.trim()) {
      alert("الرجاء إدخال اسم الخادم المسئول عن رصد نقاط هذه الفقرة!");
      return;
    }

    setIsSubmittingScore(true);
    try {
      const batch = writeBatch(db);

      const parsedPoints: { [key: string]: number } = {};
      teams.forEach(t => {
        parsedPoints[t.id] = Number(eventTeamPointsMap[t.id]) || 0;
      });

      // 1. Update schedule document in Firestore
      const eventRef = doc(db, "schedule", scoringEvent.id);
      batch.set(eventRef, {
        awardedPoints: parsedPoints,
        scoredBy: servantName.trim(),
        scoreNotes: eventScoreNotes.trim(),
        completed: true
      }, { merge: true });

      // 2. Add or update linked scoreLog entry for complete audit history
      const logColRef = collection(db, "scoreLogs");
      const logId = `event_log_${scoringEvent.id}`;
      const logRef = doc(logColRef, logId);
      
      const previousPoints = scoringEvent.awardedPoints || {};

      batch.set(logRef, {
        activityName: `نقاط فقرة: ${scoringEvent.title}`,
        timestamp: new Date(),
        notes: eventScoreNotes.trim() 
          ? `${eventScoreNotes.trim()} (رصد الخادم: ${servantName.trim()})`
          : `رصد بواسطة الخادم: ${servantName.trim()}`,
        points: parsedPoints,
        eventId: scoringEvent.id
      }, { merge: true });

      // 3. Recalculate team total scores cleanly
      teams.forEach(team => {
        const prevScore = previousPoints[team.id] || 0;
        const newScore = parsedPoints[team.id] || 0;
        const diff = newScore - prevScore;

        if (diff !== 0) {
          const teamRef = doc(db, "teams", team.id);
          const currentTotal = team.totalScore || 0;
          batch.set(teamRef, {
            id: team.id,
            name: team.name,
            color: team.color || "#f43f5e",
            bgColor: team.bgColor || "bg-indigo-50 dark:bg-indigo-950/20",
            borderColor: team.borderColor || "border-indigo-200 dark:border-indigo-900",
            logo: team.logo || "🔴",
            totalScore: Math.max(0, currentTotal + diff)
          }, { merge: true });
        }
      });

      await batch.commit();
      onRefreshData();
      setScoringEvent(null);
    } catch (err) {
      console.error("Error saving event scores:", err);
      alert("حدث خطأ أثناء حفظ نقاط الفقرة.");
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الفقرة نهائياً من البرنامج؟")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "schedule", id));
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف الفقرة.");
    }
  };

  const handleToggleCompleted = async (event: EventSchedule) => {
    try {
      const docRef = doc(db, "schedule", event.id);
      await updateDoc(docRef, {
        completed: !event.completed,
        isCurrent: false
      });
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تعديل حالة إنجاز الفقرة.");
    }
  };

  const handleSetCurrent = async (targetEvent: EventSchedule) => {
    try {
      const promises = schedule.map(async (ev) => {
        const docRef = doc(db, "schedule", ev.id);
        if (ev.id === targetEvent.id) {
          await updateDoc(docRef, { isCurrent: true, completed: false });
        } else {
          const isBefore = ev.day < targetEvent.day || (ev.day === targetEvent.day && parseTimeToMinutes(ev.time) < parseTimeToMinutes(targetEvent.time));
          await updateDoc(docRef, { 
            isCurrent: false,
            completed: isBefore ? true : ev.completed 
          });
        }
      });
      await Promise.all(promises);
      onRefreshData();
    } catch (err) {
      console.error("Error setting current event:", err);
      alert("حدث خطأ أثناء تحديد الفقرة الحالية.");
    }
  };

  const chunks: EventSchedule[][] = [];
  for (let i = 0; i < filteredEvents.length; i += itemsPerRow) {
    chunks.push(filteredEvents.slice(i, i + itemsPerRow));
  }

  return (
    <div className="space-y-8 animate-fade-in text-white" dir="rtl">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-indigo-300 block mb-1">
            Timeline & Event Scoring
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-black text-white flex items-center gap-2">
            <Calendar3D className="w-9 h-9 shrink-0" />
            <span>جدول الفقرات ونظام توزيع النقاط للفرق</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            متابعة الجدول الروحي ورصد نقاط كل فقرة مباشرة بواسطة الخادم لضمان التنافس الشريف وتحديث ترتيب الفرق تلقائياً.
          </p>
        </div>

        {/* View Controls & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 glass-button px-4 py-2.5 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فقرة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Days Tabs selector & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="grid grid-cols-2 gap-3 flex-1">
          {[1, 2].map(d => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`py-3 px-4 text-center rounded-xl transition-all duration-300 cursor-pointer font-bold ${
                activeDay === d 
                  ? "bg-indigo-600 shadow-lg shadow-indigo-500/30 text-white transform -translate-y-0.5" 
                  : "glass-card text-slate-300 hover:text-white opacity-80 hover:opacity-100"
              }`}
            >
              <div className="text-xs sm:text-sm uppercase tracking-wide">اليوم {d === 1 ? "الأول" : "الثاني"}</div>
              <div className="text-[11px] opacity-75 mt-0.5 font-medium">
                {d === 1 ? "برنامج اليوم الأول" : "برنامج اليوم الثاني"}
              </div>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالفقرة أو الخادم..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* VIEW MODE 1: TIMELINE (Snake Journey) */}
      {viewMode === 'timeline' && (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto py-4 px-1 sm:px-4">
          {filteredEvents.length === 0 ? (
            <div className="glass-panel p-12 text-center text-slate-300 w-full border-dashed">
              <CalendarDays className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-pulse opacity-50" />
              <p className="text-sm font-bold">لا توجد فقرات مطابقة في هذا اليوم.</p>
              {isAdmin && <p className="text-xs mt-2 text-slate-400">اضغط على زر "إضافة فقرة" بالأعلى للبدء.</p>}
            </div>
          ) : (
            chunks.map((chunk, rIndex) => {
              const isEvenRow = rIndex % 2 === 0;
              const isLastRow = rIndex === chunks.length - 1;

              return (
                <React.Fragment key={rIndex}>
                  <div className={`flex w-full justify-between items-stretch gap-2 sm:gap-4 ${isEvenRow ? 'flex-row' : 'flex-row-reverse'}`}>
                    {Array.from({ length: itemsPerRow }).map((_, i) => {
                      const event = chunk[i];
                      const isLastSlot = i === itemsPerRow - 1;
                      const IconComponent = event ? (IconMap[event.icon || "Sparkles"] || Sparkles) : Sparkles;

                      return (
                        <React.Fragment key={`slot-${i}`}>
                          <div className="flex-1 flex justify-center relative py-2 min-w-0">
                            {event ? (
                              <div className={`relative group w-full flex justify-center transition-all duration-300 ${event.completed ? 'opacity-85 scale-98' : ''} ${event.isCurrent || (!event.completed && isEventActive(event.time)) ? 'scale-102 z-10' : ''}`}>
                                
                                {/* Event Card */}
                                <div className={`w-full flex flex-col glass-card overflow-hidden ${event.isCurrent ? 'border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] bg-emerald-950/40' : (!event.completed && isEventActive(event.time)) ? 'border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.3)] bg-white/15' : ''} transition-all relative`}>
                                  
                                  {event.isCurrent && (
                                    <div className="bg-emerald-500 text-slate-950 font-black text-[9px] py-1 text-center uppercase tracking-wider shadow-sm flex items-center justify-center gap-1">
                                      <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-900"></span>
                                      </span>
                                      <span>الفقرة الحالية (الآن)</span>
                                    </div>
                                  )}

                                  {/* Top Header (Time) */}
                                  <div className={`${event.isCurrent ? 'bg-emerald-900/80 text-emerald-200' : (!event.completed && isEventActive(event.time)) ? 'bg-indigo-500/80 text-white' : 'bg-black/30 text-slate-300'} text-center py-2 font-bold text-[11px] sm:text-xs tracking-wide flex items-center justify-center gap-1 transition-colors backdrop-blur-md`}>
                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                    <span dir="rtl">{formatArabicTime(event.time)}</span>
                                  </div>

                                  {/* Max Points Limit Badge if defined */}
                                  {event.maxPoints ? (
                                    <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-[10px] font-bold py-1 px-2 text-center flex items-center justify-center gap-1">
                                      <Target className="w-3 h-3 text-amber-400" />
                                      <span>حد النقاط: {event.maxPoints} نقطة</span>
                                    </div>
                                  ) : null}
                                  
                                  {/* Center Icon Area */}
                                  <div className="py-3 flex justify-center relative">
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center relative shadow-lg ${event.isCurrent ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/50' : (!event.completed && isEventActive(event.time)) ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-300'}`}>
                                      {(event.isCurrent || (!event.completed && isEventActive(event.time))) && (
                                        <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-40"></span>
                                      )}
                                      <IconComponent className="w-6 h-6 transition-transform group-hover:scale-110" />
                                    </div>
                                  </div>
                                  
                                  {/* Title and Info */}
                                  <div className="p-3 text-center border-t border-white/5 flex-1 flex flex-col items-center">
                                    <h3 className="font-bold text-white text-sm leading-snug mb-1">
                                      {event.title}
                                    </h3>
                                    
                                    {event.location && (
                                      <span className="text-[11px] text-indigo-300 font-bold flex gap-1 justify-center items-center mb-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="leading-tight truncate">{event.location}</span>
                                      </span>
                                    )}

                                    {/* Awarded Points Summary per team */}
                                    {event.awardedPoints && (
                                      <div className="w-full mt-2 bg-black/40 p-2 rounded-xl border border-white/10 space-y-1">
                                        <div className="text-[9px] text-slate-300 font-bold flex items-center justify-between border-b border-white/10 pb-1">
                                          <span className="text-emerald-400 flex items-center gap-1">
                                            <Award className="w-3 h-3" /> النقاط الممنوحة
                                          </span>
                                          {event.scoredBy && (
                                            <span className="text-slate-400 text-[8px] truncate">
                                              رصد: {event.scoredBy}
                                            </span>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-0.5">
                                          {teams.map(t => (
                                            <div key={t.id} className="flex items-center justify-between px-1.5 py-0.5 bg-white/5 rounded">
                                              <span className="text-[10px] truncate">{t.logo}</span>
                                              <span className="font-bold text-white">{(event.awardedPoints as any)[t.id] || 0}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}


                                  </div>

                                </div>

                                {/* Admin Actions overlay */}
                                {isAdmin && (
                                  <div className="absolute -top-2 -right-2 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleSetCurrent(event)} title="تعيين كفقرة حالية الآن للجميع" className="p-1.5 bg-emerald-500/30 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 backdrop-blur-md border border-emerald-400/50 rounded-full shadow-lg transition-colors cursor-pointer">
                                      <Sparkles className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleToggleCompleted(event)} title="تعليم كمنتهية" className="p-1.5 bg-green-500/20 hover:bg-green-500 text-green-300 hover:text-white backdrop-blur-md border border-green-500/30 rounded-full shadow-lg transition-colors cursor-pointer">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleOpenEdit(event)} title="تعديل البيانات" className="p-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white backdrop-blur-md border border-amber-500/30 rounded-full shadow-lg transition-colors cursor-pointer">
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(event.id)} title="حذف" className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white backdrop-blur-md border border-red-500/30 rounded-full shadow-lg transition-colors cursor-pointer">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-10"></div>
                            )}
                          </div>
                          
                          {/* Connecting Horizontal Arrow */}
                          {!isLastSlot && (
                            <div className="flex-shrink-0 flex items-center justify-center w-4 sm:w-8 relative">
                              {event && chunk[i + 1] ? (
                                <div className="w-full h-0.5 bg-white/20 relative">
                                  <div className={`absolute top-1/2 -translate-y-1/2 ${isEvenRow ? 'left-0 -translate-x-1.5' : 'right-0 translate-x-1.5'}`}>
                                    {isEvenRow ? (
                                      <ChevronLeft className="w-4 h-4 text-white/40" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-white/40" />
                                    )}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Connecting Vertical Arrow */}
                  {!isLastRow && (
                    <div className={`flex w-full justify-between items-center h-6 ${isEvenRow ? 'flex-row' : 'flex-row-reverse'}`}>
                      {Array.from({ length: itemsPerRow }).map((_, i) => {
                        const isLastSlot = i === itemsPerRow - 1;
                        const thisRowEdgeItem = chunk[itemsPerRow - 1];
                        const nextRowEdgeItem = chunks[rIndex + 1]?.[0];
                        const shouldDrawArrow = isLastSlot && thisRowEdgeItem && nextRowEdgeItem;

                        return (
                          <React.Fragment key={`v-slot-${i}`}>
                            <div className="flex-1 flex justify-center relative h-full">
                              {shouldDrawArrow && (
                                <div className="w-0.5 h-full bg-white/20 relative">
                                  <ChevronDown className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 text-white/40 animate-bounce" />
                                </div>
                              )}
                            </div>
                            {!isLastSlot && <div className="flex-shrink-0 w-4 sm:w-8"></div>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      )}



      {/* SERVANT / ADMIN SCORE AWARDING MODAL */}
      {scoringEvent && (
        <StructuredScoringModal
          teams={teams}
          initialActivityName={scoringEvent.title}
          onClose={() => setScoringEvent(null)}
          onSubmit={handleStructuredScheduleSubmit}
        />
      )}

      {/* ADMIN ADD / EDIT SCHEDULE EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">
                {isEditing ? "تعديل بيانات الفقرة" : "إضافة فقرة جديدة لجدول اليوم"}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اليوم</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value={1}>اليوم الأول</option>
                    <option value={2}>اليوم الثاني</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الأيقونة المناسبة</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  >
                    <option value="Sparkles">بريق / عام ✨</option>
                    <option value="DoorOpen">باب مفتوح / استقبال 🚪</option>
                    <option value="Gamepad2">ألعاب / ترفيه 🎮</option>
                    <option value="Music">نوتة ترانيم / تسبيح 🎵</option>
                    <option value="Compass">بوصلة / لقاء روحي 🧭</option>
                    <option value="Sun">قداس / شروق ☀️</option>
                    <option value="EyeOff">تأمل / عيون مغلقة 🙈</option>
                    <option value="Users">مجموعات عمل 👥</option>
                    <option value="Trophy">بطولة رياضية 🏆</option>
                    <option value="Moon">سهرة صلاة / قمر 🌙</option>
                    <option value="BookOpen">دراسة كتاب 📖</option>
                    <option value="Brain">مسابقة ذهنية / عقل 🧠</option>
                    <option value="Smile">حفلة سمر / فرح 🙂</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان الفقرة</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: قداس / ورش عمل / مسابقة"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المكان (الموقع)</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="مثال: القاعة / الملعب / المطعم"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1.5">حد النقاط الأقصى للفقرة (Max)</label>
                  <input
                    type="number"
                    min={0}
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    placeholder="100 (ضع 0 للفقرات غير التنافسية)"
                    className="w-full px-4 py-3 rounded-xl border border-amber-500/30 bg-black/20 text-amber-300 text-xs font-mono font-bold focus:ring-1 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">وقت الفقرة</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="07:00 PM - 08:30 PM"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium placeholder-slate-500 text-left focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المسؤول عن الفقرة</label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="مثال: أ. مينا رزق"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">وصف الفقرة أو ملاحظات (اختياري)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل أي ملاحظات أو تفاصيل إضافية..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30 cursor-pointer"
                >
                  {isEditing ? "حفظ التغييرات" : "إضافة للبرنامج"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
