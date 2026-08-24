import React, { useState } from "react";
import { X, Award, Check, Minus, Trophy, Sparkles, Medal } from "lucide-react";
import { Team } from "../types";

export type SessionCategory = "bible_study" | "workshop" | "lecture" | "custom";

interface StructuredScoringModalProps {
  teams: Team[];
  initialActivityName?: string;
  onClose: () => void;
  onSubmit: (data: {
    activityName: string;
    category: SessionCategory;
    teamPointsMap: { [teamId: string]: number };
    breakdownNotes: string;
    notes: string;
  }) => Promise<void>;
}

interface ActivityPreset {
  name: string;
  badge?: string;
  defaultReason?: string;
  ranks?: {
    r1: number;
    r2: number;
    r3: number;
    r4: number;
  };
}

const PRESET_ACTIVITIES: ActivityPreset[] = [
  {
    name: "الكنز",
    badge: "100 - 75 - 50 - 25",
    defaultReason: "توزيع نقاط مراكز لعبة البحث عن الكنز",
    ranks: { r1: 100, r2: 75, r3: 50, r4: 25 }
  },
  {
    name: "لعبة الجريمة",
    badge: "75 - 50 - 25 - 10",
    defaultReason: "توزيع نقاط مراكز حل لغز مسرح الجريمة",
    ranks: { r1: 75, r2: 50, r3: 25, r4: 10 }
  },
  {
    name: "المولد",
    badge: "75 - 50 - 25 - 10",
    defaultReason: "توزيع نقاط مراكز منافسات وألعاب المولد",
    ranks: { r1: 75, r2: 50, r3: 25, r4: 10 }
  },
  {
    name: "الاسكتشات",
    badge: "40 - 30 - 20 - 10",
    defaultReason: "توزيع نقاط مراكز تقييم الاسكتشات والعروض",
    ranks: { r1: 40, r2: 30, r3: 20, r4: 10 }
  },
  { name: "أسئلة ومسابقات", defaultReason: "نقاط إجابة أسئلة ومسابقات" },
  { name: "نقط حضور", defaultReason: "نقاط الالتزام ونسبة الحضور" },
  { name: "بونص حضور مبكر", defaultReason: "بونص التواجد والحضور المبكر" },
  { name: "دراسة الكتاب المقدس", defaultReason: "تقييم مشاركة وحفظ دراسة الكتاب المقدس" },
  { name: "ورشة العمل والتطبيق", defaultReason: "تقييم إنتاج وتطبيق ورشة العمل" },
  { name: "المحاضرة العامة", defaultReason: "تقييم تفاعل وانضباط المحاضرة العامة" },
  { name: "بونص السرعة والتجمع", defaultReason: "بونص السرعة والانضباط في التجمع" }
];

const RANK_DEFINITIONS = [
  { num: 1 as const, key: "r1" as const, label: "🥇 المركز الأول", color: "border-amber-400 bg-amber-500/15 text-amber-300" },
  { num: 2 as const, key: "r2" as const, label: "🥈 المركز الثاني", color: "border-slate-300 bg-slate-300/15 text-slate-200" },
  { num: 3 as const, key: "r3" as const, label: "🥉 المركز الثالث", color: "border-orange-400 bg-orange-500/15 text-orange-300" },
  { num: 4 as const, key: "r4" as const, label: "🏅 المركز الرابع", color: "border-blue-400 bg-blue-500/15 text-blue-300" }
];

export default function StructuredScoringModal({
  teams,
  initialActivityName = "",
  onClose,
  onSubmit
}: StructuredScoringModalProps) {
  const [activityName, setActivityName] = useState(initialActivityName);
  const [customNotes, setCustomNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Find active preset if matches current name
  const activePreset = PRESET_ACTIVITIES.find(
    (p) => p.name.trim() === activityName.trim()
  ) || PRESET_ACTIVITIES.find(
    (p) => activityName.trim().length > 0 && p.name.includes(activityName.trim())
  );

  const isFormValid = activityName.trim().length > 0 && customNotes.trim().length > 0;

  // Points mapping per team
  const [pointsMap, setPointsMap] = useState<{ [teamId: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    teams.forEach((t) => {
      initial[t.id] = 0;
    });
    return initial;
  });

  // Rank mapping per team (1, 2, 3, 4 or 0 if unranked)
  const [ranksMap, setRanksMap] = useState<{ [teamId: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    teams.forEach((t) => {
      initial[t.id] = 0;
    });
    return initial;
  });

  const handleSelectPreset = (preset: ActivityPreset) => {
    setActivityName(preset.name);
    setCustomNotes(preset.defaultReason || "");

    // If preset has ranks, clear previous point assignments or reset
    if (preset.ranks) {
      const emptyRanks: { [key: string]: number } = {};
      const emptyPts: { [key: string]: number } = {};
      teams.forEach((t) => {
        emptyRanks[t.id] = 0;
        emptyPts[t.id] = 0;
      });
      setRanksMap(emptyRanks);
      setPointsMap(emptyPts);
    }
  };

  const handlePointsChange = (teamId: string, val: number) => {
    const num = isNaN(val) ? 0 : Math.max(0, val);
    setPointsMap((prev) => ({ ...prev, [teamId]: num }));
  };

  const handleAdjustPoints = (teamId: string, delta: number) => {
    setPointsMap((prev) => {
      const current = prev[teamId] || 0;
      return { ...prev, [teamId]: Math.max(0, current + delta) };
    });
  };

  const handleAssignRankToTeam = (rankNum: 1 | 2 | 3 | 4, teamId: string) => {
    if (!activePreset?.ranks) return;

    const rankPts = activePreset.ranks[`r${rankNum}` as keyof typeof activePreset.ranks];

    setRanksMap((prevRanks) => {
      const nextRanks = { ...prevRanks };

      // Clear rankNum from any other team
      Object.keys(nextRanks).forEach((id) => {
        if (nextRanks[id] === rankNum) {
          nextRanks[id] = 0;
        }
      });

      if (teamId) {
        nextRanks[teamId] = rankNum;
      }
      return nextRanks;
    });

    setPointsMap((prevPts) => {
      const nextPts = { ...prevPts };

      // Clear points for any team that was holding this rank if rankPts matches
      if (teamId) {
        nextPts[teamId] = rankPts;
      }
      return nextPts;
    });
  };

  const handleQuickFillAll = (amount: number) => {
    const next: { [key: string]: number } = {};
    teams.forEach((t) => {
      next[t.id] = amount;
    });
    setPointsMap(next);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    const finalName = activityName.trim();

    const notesLines: string[] = [];
    teams.forEach((t) => {
      const pts = pointsMap[t.id] || 0;
      const rank = ranksMap[t.id] || 0;
      const rankText = rank > 0 ? ` (المركز #${rank})` : "";
      notesLines.push(`${t.name}: ${pts}ن${rankText}`);
    });

    setIsSubmitting(true);
    try {
      await onSubmit({
        activityName: finalName,
        category: "custom",
        teamPointsMap: pointsMap,
        breakdownNotes: notesLines.join(" | "),
        notes: customNotes.trim()
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ درجات الفقرة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/30 max-w-2xl w-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 font-black">
              <Award className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                رصد نقاط وتعديل الفقرة 🎯
              </h3>
              <p className="text-xs text-amber-200/70">
                اختر نوع الفقرة وحدد مراكز الفرق لتزويد النقاط تلقائياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* 1. Activity Name Input & Quick Choice */}
          <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-white/10">
            <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>1. اختر أو اكتب اسم الفقرة (مطلوب) *</span>
            </label>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="اكتب أو اختر اسم الفقرة (الكنز، الجريمة، المولد، الاسكتشات...)"
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              autoFocus
            />

            {/* Quick Suggestions Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_ACTIVITIES.map((preset) => {
                const isSelected = activityName.trim() === preset.name.trim();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-amber-300"
                        : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <span>{preset.name}</span>
                    {preset.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-black ${
                        isSelected ? "bg-slate-950/20 text-slate-950" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {preset.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. RANK ASSIGNMENT CARD (When a Rank-Based Activity like الكنز / الجريمة / المولد / الاسكتشات is selected) */}
          {activePreset?.ranks && (
            <div className="space-y-3 bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-900 p-4 rounded-xl border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                    تحديد ترتيب المراكز لفقرة [{activePreset.name}] 🏆
                  </h4>
                </div>
                <span className="text-[10px] text-amber-200/80 bg-amber-500/20 px-2 py-0.5 rounded font-bold">
                  توزيع تلقائي للنقط
                </span>
              </div>

              <p className="text-[11px] text-slate-300">
                اختر الفريق صاحب كل مركز، وسيقوم النظام بتطبيق النقاط المحددة تلقائياً:
              </p>

              {/* Ranks Selectors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {RANK_DEFINITIONS.map((rDef) => {
                  const pts = activePreset.ranks![rDef.key];
                  const currentAssignedTeamId = Object.keys(ranksMap).find(
                    (id) => ranksMap[id] === rDef.num
                  ) || "";

                  return (
                    <div
                      key={rDef.num}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${rDef.color}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-xs shrink-0">{rDef.label}</span>
                        <span className="text-[11px] font-mono font-black px-1.5 py-0.5 bg-black/40 rounded text-amber-300 shrink-0">
                          +{pts}ن
                        </span>
                      </div>

                      <select
                        value={currentAssignedTeamId}
                        onChange={(e) => handleAssignRankToTeam(rDef.num, e.target.value)}
                        className="bg-slate-950 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg border border-white/20 outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer max-w-[140px]"
                      >
                        <option value="">-- اختر الفريق --</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.logo} {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Teams Points Overview & Direct Adjustments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>النقاط المرصودة لكل فريق:</span>
              </label>

              {/* Quick Fill Options */}
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400 text-[11px]">تعبئة للجميع:</span>
                <button
                  type="button"
                  onClick={() => handleQuickFillAll(60)}
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-bold hover:bg-amber-500/30 cursor-pointer"
                >
                  60
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillAll(30)}
                  className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[11px] font-bold hover:bg-indigo-500/30 cursor-pointer"
                >
                  30
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillAll(0)}
                  className="px-2 py-0.5 bg-white/5 text-slate-400 rounded text-[11px] font-bold hover:bg-white/10 cursor-pointer"
                >
                  تصفير
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teams.map((team) => {
                const currentScore = pointsMap[team.id] || 0;
                const assignedRank = ranksMap[team.id] || 0;
                const ranks = activePreset?.ranks;

                return (
                  <div
                    key={team.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                      assignedRank > 0
                        ? "bg-slate-950 border-amber-500/50 shadow-md shadow-amber-500/10"
                        : "bg-slate-950/70 border-white/10 hover:border-amber-500/40"
                    }`}
                  >
                    {/* Team Header & Input */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl shrink-0">{team.logo}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-white truncate">{team.name}</h4>
                            {assignedRank > 0 && (
                              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 shrink-0">
                                #{assignedRank}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            المجموع الحالي: <strong className="text-amber-300 font-mono">{team.totalScore}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Number Input Box */}
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          min={0}
                          value={currentScore}
                          onChange={(e) => handlePointsChange(team.id, parseInt(e.target.value) || 0)}
                          className="w-16 h-10 text-center font-mono font-black text-base bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="text-xs text-slate-400 font-bold">نقطة</span>
                      </div>
                    </div>

                    {/* Rank Quick Buttons on card if activePreset has ranks */}
                    {ranks && (
                      <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/5">
                        {RANK_DEFINITIONS.map((rDef) => {
                          const pts = ranks[rDef.key];
                          const isThisRank = assignedRank === rDef.num;
                          return (
                            <button
                              key={rDef.num}
                              type="button"
                              onClick={() => handleAssignRankToTeam(rDef.num, team.id)}
                              className={`py-1 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                                isThisRank
                                  ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow"
                                  : "bg-white/5 text-slate-300 border-white/5 hover:bg-white/10"
                              }`}
                            >
                              <span>#{rDef.num}</span>
                              <span className="font-mono text-[9px]">{pts}ن</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Simple Increment Buttons */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustPoints(team.id, -5)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 flex items-center justify-center cursor-pointer transition-colors"
                          title="-5"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustPoints(team.id, 5)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustPoints(team.id, 10)}
                          className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustPoints(team.id, 20)}
                          className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono font-bold cursor-pointer transition-colors"
                        >
                          +20
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePointsChange(team.id, 60)}
                        className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold cursor-pointer transition-colors"
                      >
                        60 كاملة
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Mandatory Reason Note / تفاصيل النقاط */}
          <div className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-2xl border border-indigo-500/30 shadow-inner">
            <label className="block text-xs font-bold text-amber-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>تفاصيل ونوع النقاط (اختر من القائمة) *</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">قائمة الاختيارات</span>
            </label>

            {/* Dropdown Select Menu */}
            <div className="space-y-2">
              <select
                value={
                  ["أسئلة ومسابقات", "نقط حضور", "بونص حضور مبكر", "نقاط إجابة أسئلة ومسابقات", "نقاط الالتزام ونسبة الحضور", "بونص التواجد والحضور المبكر"].includes(customNotes)
                    ? customNotes
                    : customNotes === "" ? "" : "CUSTOM"
                }
                onChange={(e) => {
                  if (e.target.value === "CUSTOM") {
                    setCustomNotes("");
                  } else {
                    setCustomNotes(e.target.value);
                  }
                }}
                className="w-full px-3.5 py-3 rounded-xl border border-amber-500/40 bg-slate-900 text-amber-200 text-xs sm:text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-md"
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">-- اختر نوع/سبب النقاط من القائمة --</option>
                <option value="أسئلة ومسابقات" className="bg-slate-900 text-amber-300 font-bold py-2">❓ أسئلة ومسابقات</option>
                <option value="نقط حضور" className="bg-slate-900 text-indigo-300 font-bold py-2">📋 نقط حضور</option>
                <option value="بونص حضور مبكر" className="bg-slate-900 text-emerald-300 font-bold py-2">⚡ بونص حضور مبكر</option>
                <option value="CUSTOM" className="bg-slate-900 text-slate-300 font-bold py-2">✏️ سبب مخصص / كتابة تفاصيل أُخرى...</option>
              </select>

              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="تأكيد أو تعديل تفاصيل النقاط (مثال: أسئلة، نقط حضور، بونص حضور مبكر...)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/50 text-slate-100 text-xs font-medium outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-white/10 flex items-center justify-between bg-slate-950/80 gap-2 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          
          <div className="flex items-center gap-2 flex-wrap">
            {!isFormValid && (
              <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                ⚠️ يجب اختيار الفقرة وشرح سبب الإضافة للحفظ
              </span>
            )}
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={!isFormValid || isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-35 disabled:cursor-not-allowed text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                "جاري الحفظ..."
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>حفظ وتعديل النقاط للفرق</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
