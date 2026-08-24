import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  X, 
  Activity, 
  History,
  Sparkles,
  Edit3,
  Tv,
  Flame,
  BookOpen,
  Wrench,
  Mic,
  Zap,
  Award,
  Info,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Eye,
  Map,
  Search,
  Tent,
  Clapperboard,
  Trophy
} from "lucide-react";
import { Team, ScoreLog } from "../types";
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc,
  writeBatch 
} from "firebase/firestore";
import { Trophy3D, Medal3D } from "./ThreeDIcons";
import StructuredScoringModal, { SessionCategory } from "./StructuredScoringModal";
import TeamScoreDetailsModal from "./TeamScoreDetailsModal";
import PointsDistributionModal from "./PointsDistributionModal";

interface ScoreboardViewProps {
  teams: Team[];
  scoreLogs: ScoreLog[];
  isAdmin: boolean;
  onRefreshData: () => void;
}

export default function ScoreboardView({ teams, scoreLogs, isAdmin, onRefreshData }: ScoreboardViewProps) {
  const [showAddLog, setShowAddLog] = useState(false);
  const [showScoreMatrix, setShowScoreMatrix] = useState(false);
  const [showLogsHistory, setShowLogsHistory] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState<Team | null>(null);
  const [selectedTeamForDetails, setSelectedTeamForDetails] = useState<Team | null>(null);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [tvMode, setTvMode] = useState(false);
  const [showPointsModal, setShowPointsModal] = useState(false);

  // Form: Activity log
  const [activityName, setActivityName] = useState("");
  const [notes, setNotes] = useState("");
  const [teamPointsMap, setTeamPointsMap] = useState<{ [teamId: string]: string }>({});

  // Structured Scoring Submit Handler
  const handleStructuredSubmit = async (data: {
    activityName: string;
    category: SessionCategory;
    teamPointsMap: { [teamId: string]: number };
    breakdownNotes: string;
    notes: string;
  }) => {
    const batch = writeBatch(db);

    // 1. Add log
    const logColRef = collection(db, "scoreLogs");
    const newLogRef = doc(logColRef);
    const combinedNotes = data.notes 
      ? `${data.notes} • [تفاصيل: ${data.breakdownNotes}]` 
      : `[تفاصيل: ${data.breakdownNotes}]`;

    batch.set(newLogRef, {
      activityName: data.activityName,
      timestamp: new Date(),
      notes: combinedNotes,
      points: data.teamPointsMap
    });

    // 2. Update each team's total score
    for (const team of teams) {
      const teamRef = doc(db, "teams", team.id);
      const added = data.teamPointsMap[team.id] || 0;
      const newScore = (team.totalScore || 0) + added;
      batch.set(teamRef, { 
        id: team.id,
        name: team.name,
        color: team.color || "#f43f5e",
        bgColor: team.bgColor || "bg-indigo-50 dark:bg-indigo-950/20",
        borderColor: team.borderColor || "border-indigo-200 dark:border-indigo-900",
        logo: team.logo || "🔴",
        totalScore: newScore 
      }, { merge: true });
    }

    await batch.commit();
    onRefreshData();
  };

  // Form: Edit Team
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("🔴");
  const [editColor, setEditColor] = useState("#f43f5e");

  // Form: Add Team
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("⚽");
  const [newTeamColor, setNewTeamColor] = useState("#6366f1");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sort teams by totalScore descending
  const sortedTeams = [...teams].sort((a, b) => b.totalScore - a.totalScore);
  const topScore = sortedTeams[0]?.totalScore || 1;

  const handleOpenAddLog = () => {
    setActivityName("");
    setNotes("");
    const initialMap: { [key: string]: string } = {};
    teams.forEach(t => {
      initialMap[t.id] = "0";
    });
    setTeamPointsMap(initialMap);
    setShowAddLog(true);
  };

  const handleOpenEditTeam = (team: Team) => {
    setEditName(team.name);
    setEditLogo(team.logo || "🔴");
    setEditColor(team.color || "#f43f5e");
    setShowEditTeam(team);
  };

  const handleSaveTeamEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditTeam) return;
    if (!editName.trim()) {
      alert("الرجاء كتابة اسم الفريق!");
      return;
    }

    try {
      const teamRef = doc(db, "teams", showEditTeam.id);
      await setDoc(teamRef, {
        name: editName.trim(),
        logo: editLogo.trim() || "🔴",
        color: editColor
      }, { merge: true });
      onRefreshData();
      setShowEditTeam(null);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ اسم الفريق.");
    }
  };

  const handleAddTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      alert("الرجاء كتابة اسم الفريق الجديد!");
      return;
    }

    try {
      await addDoc(collection(db, "teams"), {
        name: newTeamName.trim(),
        logo: newTeamLogo.trim() || "⚽",
        color: newTeamColor,
        bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
        borderColor: "border-indigo-200 dark:border-indigo-900",
        totalScore: 0
      });
      onRefreshData();
      setNewTeamName("");
      setShowAddTeam(false);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة الفريق الجديد.");
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm(`هل أنت متأكد من حذف فريق "${team.name}" نهائياً؟`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "teams", team.id));
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف الفريق.");
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityName.trim()) {
      alert("الرجاء إدخال اسم الفقرة أو النشاط!");
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      const parsedPoints: { [key: string]: number } = {};
      teams.forEach(t => {
        parsedPoints[t.id] = Number(teamPointsMap[t.id]) || 0;
      });

      // 1. Add log entry
      const logColRef = collection(db, "scoreLogs");
      const newLogRef = doc(logColRef);
      batch.set(newLogRef, {
        activityName,
        timestamp: new Date(),
        notes,
        points: parsedPoints
      });

      // 2. Update each team's total score
      for (const team of teams) {
        const teamRef = doc(db, "teams", team.id);
        const added = parsedPoints[team.id] || 0;
        const newScore = (team.totalScore || 0) + added;
        batch.set(teamRef, { 
          id: team.id,
          name: team.name,
          color: team.color || "#f43f5e",
          bgColor: team.bgColor || "bg-indigo-50 dark:bg-indigo-950/20",
          borderColor: team.borderColor || "border-indigo-200 dark:border-indigo-900",
          logo: team.logo || "🔴",
          totalScore: newScore 
        }, { merge: true });
      }

      await batch.commit();
      onRefreshData();
      setShowAddLog(false);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تسجيل نقاط الفقرة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (log: ScoreLog) => {
    if (!window.confirm(`هل أنت متأكد من حذف سكور فقرة "${log.activityName}"؟ سيتم خصم هذه النقاط تلقائياً من إجمالي الفرق.`)) {
      return;
    }

    try {
      const batch = writeBatch(db);

      // 1. Delete log
      const logRef = doc(db, "scoreLogs", log.id);
      batch.delete(logRef);

      // 2. Deduct score from teams
      for (const team of teams) {
        const teamRef = doc(db, "teams", team.id);
        const deductedPoints = (log.points as any)[team.id] || 0;
        const newScore = Math.max(0, (team.totalScore || 0) - deductedPoints);
        batch.set(teamRef, { totalScore: newScore }, { merge: true });
      }

      await batch.commit();
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف السكور.");
    }
  };

  return (
    <div className={`space-y-4 animate-fade-in text-white mx-auto transition-all duration-300 ${tvMode ? "max-w-[1400px] px-2 sm:px-6 py-2" : "max-w-5xl"}`} dir="rtl">
      
      {/* Compact Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-[11px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20 backdrop-blur-sm mb-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>مؤتمر ISO • شاشة المرفاع المباشرة</span>
          </div>
          <h1 className="text-xl md:text-3xl font-serif font-black text-white flex items-center gap-2">
            <Trophy3D className="w-8 h-8 md:w-10 md:h-10 shrink-0" />
            <span>الاسكور والنقاط</span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <button
            onClick={handleOpenAddLog}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 border border-amber-300/40"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة نقاط ➕</span>
          </button>

          <button
            onClick={() => setShowPointsModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>نظام النقاط 📋</span>
          </button>

          <button
            onClick={() => setShowScoreMatrix(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>جدول التقييم</span>
          </button>
        </div>
      </div>

      {/* Subtitle / Mode Indicator */}
      <div className="flex items-center justify-between text-xs text-slate-300 font-medium py-1">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
          <span className="font-bold text-white">ترتيب المراكز الأربعة الحالية في المؤتمر:</span>
        </div>
        <span className="text-[11px] text-slate-400">
          تحديث مباشر تلقائي • {sortedTeams.length} فرق
        </span>
      </div>

      {/* Stacked Vertical List: All 4 Teams under each other, fitting completely in 1 screen height */}
      <div className="space-y-3">
        {sortedTeams.map((team, idx) => {
          const is1st = idx === 0;
          const is2nd = idx === 1;
          const is3rd = idx === 2;

          // Visual Themes for 1st (Gold), 2nd (Silver), 3rd (Bronze), 4th+ (Standard)
          let rowBg = "";
          let borderColor = "";
          let shadowStyle = "";
          let rankBadgeBg = "";
          let rankBadgeText = "";
          let badgeTitle = "";
          let scoreTextColor = "";
          let progressGrad = "";
          let medalComp = null;

          if (is1st) {
            // GOLD (المركز الأول - ذهبي)
            rowBg = "bg-gradient-to-r from-amber-500/25 via-yellow-950/40 to-black/80";
            borderColor = "border-amber-400/90";
            shadowStyle = "shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50";
            rankBadgeBg = "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500";
            rankBadgeText = "text-amber-950 font-black";
            badgeTitle = "🥇 المركز الأول";
            scoreTextColor = "text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]";
            progressGrad = "from-amber-500 via-yellow-300 to-amber-400";
            medalComp = <Trophy3D className="w-10 h-10 md:w-12 md:h-12 shrink-0 drop-shadow-xl" />;
          } else if (is2nd) {
            // SILVER (المركز الثاني - فضي)
            rowBg = "bg-gradient-to-r from-slate-200/20 via-slate-800/40 to-black/80";
            borderColor = "border-slate-300/80";
            shadowStyle = "shadow-[0_0_20px_rgba(203,213,225,0.2)] ring-1 ring-slate-300/30";
            rankBadgeBg = "bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400";
            rankBadgeText = "text-slate-950 font-black";
            badgeTitle = "🥈 المركز الثاني";
            scoreTextColor = "text-slate-100 drop-shadow-[0_0_10px_rgba(203,213,225,0.6)]";
            progressGrad = "from-slate-400 via-slate-200 to-slate-300";
            medalComp = <Medal3D type="silver" className="w-9 h-9 md:w-10 md:h-10 shrink-0 drop-shadow-lg" rankText="٢" />;
          } else if (is3rd) {
            // BRONZE (المركز الثالث - برونزي)
            rowBg = "bg-gradient-to-r from-amber-800/25 via-orange-950/40 to-black/80";
            borderColor = "border-amber-600/80";
            shadowStyle = "shadow-[0_0_20px_rgba(217,119,6,0.2)] ring-1 ring-amber-600/30";
            rankBadgeBg = "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700";
            rankBadgeText = "text-white font-black";
            badgeTitle = "🥉 المركز الثالث";
            scoreTextColor = "text-orange-300 drop-shadow-[0_0_10px_rgba(217,119,6,0.6)]";
            progressGrad = "from-amber-700 via-orange-400 to-amber-500";
            medalComp = <Medal3D type="bronze" className="w-9 h-9 md:w-10 md:h-10 shrink-0 drop-shadow-lg" rankText="٣" />;
          } else {
            // STANDARD (المركز الرابع وما بعدها)
            const ARABIC_RANKS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر"];
            const rankTextName = ARABIC_RANKS[idx] || `${idx + 1}`;
            
            rowBg = "bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-black/80";
            borderColor = "border-white/15 hover:border-white/30";
            shadowStyle = "shadow-md";
            rankBadgeBg = "bg-white/10 border border-white/20";
            rankBadgeText = "text-slate-300 font-bold";
            badgeTitle = `🏅 المركز ${rankTextName}`;
            scoreTextColor = "text-white";
            progressGrad = "from-indigo-500 to-blue-400";
            medalComp = <Medal3D type="blue" className="w-8 h-8 md:w-9 md:h-9 shrink-0 drop-shadow-md" rankText={String(idx + 1)} />;
          }

          // Calculations
          const percentage = Math.min(Math.round((team.totalScore / (topScore || 1)) * 100), 100);
          const diffFromLeader = topScore - team.totalScore;

          return (
            <div 
              key={team.id}
              className={`relative rounded-2xl p-3.5 sm:p-4 border backdrop-blur-md flex flex-col gap-2 transition-all duration-300 hover:scale-[1.005] ${rowBg} ${borderColor} ${shadowStyle}`}
            >
              {/* Row Body: Single horizontal line structure */}
              <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                
                {/* Right Side: Medal, Rank Badge, Logo, Team Name */}
                <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                  {/* Medal / Trophy Icon */}
                  <div className="shrink-0">
                    {medalComp}
                  </div>

                  {/* Rank Badge Pill */}
                  <span className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${rankBadgeBg} ${rankBadgeText} shadow-sm`}>
                    {badgeTitle}
                  </span>

                  {/* Team Logo Emoji & Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl sm:text-3xl shrink-0 drop-shadow-md">
                      {team.logo}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-2xl font-serif font-black text-white truncate leading-tight">
                        {team.name}
                      </h2>
                      {is1st && (
                        <span className="text-[10px] sm:text-xs text-amber-300 font-bold block flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> متصدر المسابقة
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Left Side: Details Button, Score & Admin edit */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0 ms-auto sm:ms-0">
                  {/* Detailed Breakdown Button */}
                  <button
                    onClick={() => setSelectedTeamForDetails(team)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95 shrink-0"
                    title={isAdmin ? "عرض تفصيلي لجميع النقاط المضافة لهذا الفريق مع إمكانية التعديل" : "عرض تفصيلي لجميع النقاط المضافة لهذا الفريق"}
                  >
                    <ListChecks className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">عرض تفصيلي للنقاط</span>
                    <span className="sm:hidden">تفاصيل النقاط</span>
                  </button>

                  {/* Score Box */}
                  <div className="bg-black/50 border border-white/20 px-3.5 py-1.5 sm:py-2 rounded-xl text-center backdrop-blur-md min-w-[90px] sm:min-w-[120px]">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block -mb-0.5 sm:hidden">السكور</span>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-2xl sm:text-4xl font-serif font-black ${scoreTextColor} leading-none`}>
                        {team.totalScore}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        نقطة
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEditTeam(team)}
                      className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                      title="تعديل الفريق"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>

              {/* Integrated Progress Bar at bottom of each row */}
              <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden border border-white/10 mt-0.5">
                <div 
                  className={`h-full bg-gradient-to-r ${progressGrad} transition-all duration-1000 ease-out rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

            </div>
          );
        })}
      </div>

      {/* Expandable Historical logs - Accessible to admin or when toggled */}
      {isAdmin && showLogsHistory && (
        <div className="glass-panel p-6 mt-8">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <History className="w-5.5 h-5.5 text-white" />
            <h3 className="text-xs uppercase tracking-widest font-bold py-1 px-3 bg-white/10 rounded-full text-white w-fit border border-white/10">سجل وسكور الأنشطة التفصيلي</h3>
          </div>

          {scoreLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-white/20 rounded-xl bg-white/5">
              <Activity className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">لا توجد نقاط مسجلة للفقرات حتى الآن.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scoreLogs
                .sort((a, b) => {
                  const dateA = a.timestamp?.seconds || 0;
                  const dateB = b.timestamp?.seconds || 0;
                  return dateB - dateA;
                })
                .map((log) => (
                  <div 
                    key={log.id} 
                    className="glass-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">{log.activityName}</h4>
                      {log.notes && <p className="text-xs text-slate-300 font-medium">{log.notes}</p>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 min-w-[280px]">
                      {teams.map(team => {
                        const pointsGained = (log.points as any)[team.id] || 0;
                        return (
                          <div 
                            key={team.id} 
                            className="bg-black/20 rounded-lg px-3 py-2 border border-white/5 text-center"
                          >
                            <div className="text-[10px] text-slate-400 font-bold truncate">{team.name}</div>
                            <div className="text-xs font-black text-white flex items-center justify-center gap-0.5 mt-0.5">
                              <span className="text-emerald-400 font-bold text-[10px]">+</span>
                              <span>{pointsGained}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log)}
                      className="p-2 rounded-full border border-transparent text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer self-end md:self-center"
                      title="حذف هذه الفقرة ونقاطها"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">تعديل اسم وداتا الفريق</h3>
              <button 
                onClick={() => setShowEditTeam(null)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الفريق الجديد</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="مثال: فريق القديس أثناسيوس..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز / إيموجي</label>
                  <input
                    type="text"
                    value={editLogo}
                    onChange={(e) => setEditLogo(e.target.value)}
                    placeholder="مثال: 🔴 أو ⚽ أو 🏆"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-center text-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">لون الفريق</label>
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-full h-11 p-1 rounded-xl border border-white/10 bg-black/20 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditTeam(null)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                >
                  حفظ اسم الفريق
                </button>
              </div>

              {teams.length > 2 && (
                <div className="pt-2 border-t border-white/10 text-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteTeam(showEditTeam)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1 mx-auto hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف هذا الفريق بالكامل</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">إضافة فريق جديد للمؤتمر</h3>
              <button 
                onClick={() => setShowAddTeam(false)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الفريق</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="مثال: بصمة إيمان..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">رمز / إيموجي</label>
                  <input
                    type="text"
                    value={newTeamLogo}
                    onChange={(e) => setNewTeamLogo(e.target.value)}
                    placeholder="مثال: 🔵"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-center text-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">لون الفريق</label>
                  <input
                    type="color"
                    value={newTeamColor}
                    onChange={(e) => setNewTeamColor(e.target.value)}
                    className="w-full h-11 p-1 rounded-xl border border-white/10 bg-black/20 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeam(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30 cursor-pointer"
                >
                  إضافة الفريق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Score Modal using Structured Scoring Wizard */}
      {showAddLog && (
        <StructuredScoringModal
          teams={teams}
          initialActivityName={activityName}
          onClose={() => setShowAddLog(false)}
          onSubmit={handleStructuredSubmit}
        />
      )}

      {/* Team Score Details Modal */}
      {selectedTeamForDetails && (
        <TeamScoreDetailsModal
          team={teams.find(t => t.id === selectedTeamForDetails.id) || selectedTeamForDetails}
          teams={teams}
          scoreLogs={scoreLogs}
          isAdmin={isAdmin}
          onClose={() => setSelectedTeamForDetails(null)}
          onRefreshData={onRefreshData}
        />
      )}

      {/* Score Matrix Modal (جدول رصد وتقييم نقاط الفقرات) */}
      {showScoreMatrix && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <div className="bg-slate-900 border border-amber-500/30 max-w-4xl w-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black">
                  <Award className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
                    جدول تقييم ورصد الفقرات 🎯
                  </h3>
                  <p className="text-xs text-amber-200/70">
                    تفاصيل النقاط الممنوحة لكل مجموعة في مختلف الأنشطة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowScoreMatrix(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Team Summary Cards Bar */}
            <div className="px-5 py-3 bg-slate-950/60 border-b border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {teams.map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{t.logo}</span>
                    <span className="text-xs font-bold text-slate-200 truncate">{t.name}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-400 mr-1">{t.totalScore}</span>
                </div>
              ))}
            </div>

            {/* Modal Body / Table */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {scoreLogs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <Award className="w-12 h-12 text-amber-400/30 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-300">لا توجد فقرات مرصودة حتى الآن</p>
                  <p className="text-xs text-slate-400 mt-1">عند تسجيل نقاط للفقرات والأنشطة من الخدام ستظهر هنا تفصيلياً.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/70 shadow-inner">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 border-b border-white/10 text-slate-300">
                        <th className="p-3.5 font-bold text-slate-200 min-w-[140px]">اسم الفقرة / النشاط</th>
                        {teams.map(team => (
                          <th key={team.id} className="p-3.5 font-bold text-center border-r border-white/5 min-w-[90px]">
                            <div className="flex flex-col items-center">
                              <span className="text-lg leading-none mb-1">{team.logo}</span>
                              <span className="text-[11px] text-amber-300 font-bold truncate max-w-[85px]">{team.name}</span>
                            </div>
                          </th>
                        ))}
                        <th className="p-3.5 font-bold text-slate-300 border-r border-white/5 min-w-[120px]">الملاحظات</th>
                        {isAdmin && <th className="p-3.5 font-bold text-center border-r border-white/5 w-12">حذف</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {scoreLogs.map((log, index) => {
                        const pointsMap = log.points || {};
                        return (
                          <tr key={log.id} className="hover:bg-amber-500/5 transition-colors group">
                            <td className="p-3.5 font-medium text-white">
                              <div className="flex items-baseline gap-2">
                                <span className="text-[10px] font-mono font-bold text-amber-400/70 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                  #{index + 1}
                                </span>
                                <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                                  {log.activityName}
                                </span>
                              </div>
                            </td>

                            {teams.map(team => {
                              const pts = pointsMap[team.id] || 0;
                              return (
                                <td key={team.id} className="p-3.5 text-center font-mono border-r border-white/5">
                                  {pts > 0 ? (
                                    <span className="inline-block px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg font-black text-xs shadow-sm">
                                      +{pts}
                                    </span>
                                  ) : pts < 0 ? (
                                    <span className="inline-block px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg font-black text-xs">
                                      {pts}
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-bold text-[11px]">-</span>
                                  )}
                                </td>
                              );
                            })}

                            <td className="p-3.5 text-slate-300 text-[11px] border-r border-white/5">
                              {log.notes ? (
                                <span className="line-clamp-2 text-slate-300">{log.notes}</span>
                              ) : (
                                <span className="text-slate-600 font-normal">-</span>
                              )}
                            </td>

                            {isAdmin && (
                              <td className="p-3.5 text-center border-r border-white/5">
                                <button
                                  onClick={() => handleDeleteLog(log)}
                                  className="text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="حذف الفقرة"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 font-black border-t-2 border-amber-500/40 text-white">
                        <td className="p-3.5 text-amber-300 font-serif text-xs">الإجمالي التراكمي:</td>
                        {teams.map(team => (
                          <td key={team.id} className="p-3.5 text-center border-r border-white/5 font-mono text-amber-300 text-sm font-black">
                            {team.totalScore}
                          </td>
                        ))}
                        <td className="p-3.5 border-r border-white/5 text-[11px] text-slate-400">مجموع كل النقاط</td>
                        {isAdmin && <td className="p-3.5 border-r border-white/5"></td>}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-white/10 flex items-center justify-between bg-slate-950/80">
              <span className="text-xs text-slate-400">
                إجمالي الأنشطة والفقرات: <strong className="text-amber-300 font-mono text-sm">{scoreLogs.length}</strong>
              </span>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowScoreMatrix(false);
                      handleOpenAddLog();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تعديل النقاط</span>
                  </button>
                )}
                <button
                  onClick={() => setShowScoreMatrix(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Points Distribution Modal */}
      {showPointsModal && (
        <PointsDistributionModal 
          onClose={() => setShowPointsModal(false)} 
          onOpenAddLog={() => {
            setShowPointsModal(false);
            handleOpenAddLog();
          }}
        />
      )}
    </div>
  );
}

