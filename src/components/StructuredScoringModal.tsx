import React, { useState } from "react";
import { X, Award, Check, Trophy, Sparkles, Medal, Crown, ClipboardList, UserMinus } from "lucide-react";
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

type PresetCategory = "winner" | "ranked" | "independent" | "deduction";

interface ActivityPreset {
  name: string;
  category: PresetCategory;
  badge?: string;
  defaultReason?: string;
  maxPoints?: number;
  ranks?: {
    r1: number;
    r2: number;
    r3: number;
    r4: number;
  };
}

// تقييمات مؤتمر ISO - اجتماع شباب ٢٠٢٦ - مقسّمة حسب نوع التقييم
const PRESET_ACTIVITIES: ActivityPreset[] = [
  // 🏆 فوز مباشر: فريق واحد بس بياخد الدرجة كاملة
  { name: "حضور القداس", category: "winner", badge: "٢٠", maxPoints: 20, defaultReason: "تُعطى للمجموعة اللي حضر منها أكبر عدد في القداس" },
  { name: "الكنز", category: "winner", badge: "٣٠", maxPoints: 30, defaultReason: "للمجموعة الفائزة بالكنز" },
  { name: "سكيب روم", category: "winner", badge: "٣٠", maxPoints: 30, defaultReason: "للمجموعة الفائزة" },
  { name: "الألعاب التنافسية", category: "winner", badge: "١٠/لعبة", maxPoints: 10, defaultReason: "للمجموعة الفائزة في اللعبة - يمكن تكرارها لأكتر من لعبة لو الوقت متاح" },
  { name: "أفضل سلوك فردي (ولد)", category: "winner", badge: "٢٠", maxPoints: 20, defaultReason: "أفضل أخلاق وروح رياضية خلال المؤتمر - باتفاق وأخذ رأي كل الخدام" },
  { name: "أفضل سلوك فردي (بنت)", category: "winner", badge: "٢٠", maxPoints: 20, defaultReason: "أفضل أخلاق وروح رياضية خلال المؤتمر - باتفاق وأخذ رأي كل الخدام" },
  { name: "أفضل تنكر (ولد)", category: "winner", badge: "٢٠", maxPoints: 20, defaultReason: "اختيار أفضل تنكر ولد في حفلة التنكر" },
  { name: "أفضل تنكر (بنت)", category: "winner", badge: "٢٠", maxPoints: 20, defaultReason: "اختيار أفضل تنكر بنت في حفلة التنكر" },

  // 📊 ترتيب: كل المجموعات بتاخد مركز ودرجة مختلفة
  { name: "التجمع (صلاة/محاضرات)", category: "ranked", badge: "٢٠-١٥-١٠-٠", defaultReason: "ترتيب المجموعات الأربعة حسب الالتزام والانضباط في التجمع", ranks: { r1: 20, r2: 15, r3: 10, r4: 0 } },
  { name: "حفظ اللحن (تسميع)", category: "ranked", badge: "٢٠-١٥-١٠-٥", defaultReason: "تسميع اللحن للمجموعة كلها، وترتيب المستويات الأربعة", ranks: { r1: 20, r2: 15, r3: 10, r4: 5 } },

  // 📝 تقييم مستقل: كل مجموعة تاخد درجتها لوحدها، مش تنافس مباشر
  { name: "تفاعل (دراسة الكتاب/المحاضرات)", category: "independent", badge: "حتى ١٠", maxPoints: 10, defaultReason: "الأسئلة توزع بالتساوي على كل المجموعات لتحقيق مبدأ تكافؤ الفرص" },
  { name: "نظافة الغرف", category: "independent", badge: "حتى ١٠", maxPoints: 10, defaultReason: "لو أفراد الغرفة من مجموعات مختلفة، الدرجة تتضاف لكل واحد لمجموعته" },

  // ➖ خصم / جزاء
  { name: "خصم / جزاء", category: "deduction", badge: "➖", defaultReason: "خصم درجات نتيجة مخالفة" }
];

const CATEGORY_META: Record<PresetCategory, { label: string; icon: any; headerClass: string }> = {
  winner: { label: "🏆 فوز مباشر (فريق واحد ياخد الدرجة)", icon: Crown, headerClass: "text-amber-300" },
  ranked: { label: "📊 ترتيب المجموعات (١-٤)", icon: Medal, headerClass: "text-indigo-300" },
  independent: { label: "📝 تقييم مستقل لكل مجموعة", icon: ClipboardList, headerClass: "text-blue-300" },
  deduction: { label: "➖ خصم / جزاء", icon: UserMinus, headerClass: "text-rose-300" }
};

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
  const [deductionAmount, setDeductionAmount] = useState<number>(5);

  const activePreset = PRESET_ACTIVITIES.find((p) => p.name.trim() === activityName.trim());

  const isFormValid = activityName.trim().length > 0 && customNotes.trim().length > 0;

  const [pointsMap, setPointsMap] = useState<{ [teamId: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    teams.forEach((t) => (initial[t.id] = 0));
    return initial;
  });

  const [ranksMap, setRanksMap] = useState<{ [teamId: string]: number }>(() => {
    const initial: { [key: string]: number } = {};
    teams.forEach((t) => (initial[t.id] = 0));
    return initial;
  });

  const resetAssignments = () => {
    const emptyRanks: { [key: string]: number } = {};
    const emptyPts: { [key: string]: number } = {};
    teams.forEach((t) => {
      emptyRanks[t.id] = 0;
      emptyPts[t.id] = 0;
    });
    setRanksMap(emptyRanks);
    setPointsMap(emptyPts);
  };

  const handleSelectPreset = (preset: ActivityPreset) => {
    setActivityName(preset.name);
    setCustomNotes(preset.defaultReason || "");
    setDeductionAmount(5);
    resetAssignments();
  };

  // 🏆 Winner category: one tap picks the winning team, everyone else is 0
  const handlePickWinner = (teamId: string) => {
    if (!activePreset?.maxPoints) return;
    const next: { [key: string]: number } = {};
    teams.forEach((t) => {
      next[t.id] = t.id === teamId ? activePreset.maxPoints! : 0;
    });
    setPointsMap(next);
  };

  const getWinnerTeamId = () => {
    return Object.keys(pointsMap).find((id) => pointsMap[id] > 0) || "";
  };

  // 📝 Independent category: direct per-team number entry
  const handleIndependentChange = (teamId: string, val: number) => {
    const max = activePreset?.maxPoints ?? 999;
    const num = isNaN(val) ? 0 : Math.min(Math.max(val, 0), max);
    setPointsMap((prev) => ({ ...prev, [teamId]: num }));
  };

  // 📊 Ranked category
  const handleAssignRankToTeam = (rankNum: 1 | 2 | 3 | 4, teamId: string) => {
    if (!activePreset?.ranks) return;
    const rankPts = activePreset.ranks[`r${rankNum}` as keyof typeof activePreset.ranks];

    setRanksMap((prevRanks) => {
      const nextRanks = { ...prevRanks };
      Object.keys(nextRanks).forEach((id) => {
        if (nextRanks[id] === rankNum) nextRanks[id] = 0;
      });
      if (teamId) nextRanks[teamId] = rankNum;
      return nextRanks;
    });

    setPointsMap((prevPts) => {
      const nextPts = { ...prevPts };
      if (teamId) nextPts[teamId] = rankPts;
      return nextPts;
    });
  };

  // ➖ Deduction category: pick team + positive amount, converted to negative on submit
  const handlePickDeductionTeam = (teamId: string) => {
    const next: { [key: string]: number } = {};
    teams.forEach((t) => {
      next[t.id] = t.id === teamId ? -Math.abs(deductionAmount || 0) : 0;
    });
    setPointsMap(next);
  };

  const getDeductionTeamId = () => {
    return Object.keys(pointsMap).find((id) => pointsMap[id] < 0) || "";
  };

  const handleDeductionAmountChange = (val: number) => {
    const amount = isNaN(val) ? 0 : Math.abs(val);
    setDeductionAmount(amount);
    const currentTeamId = getDeductionTeamId();
    if (currentTeamId) {
      setPointsMap((prev) => ({ ...prev, [currentTeamId]: -amount }));
    }
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

  const groupedPresets = (["winner", "ranked", "independent", "deduction"] as PresetCategory[]).map((cat) => ({
    category: cat,
    meta: CATEGORY_META[cat],
    items: PRESET_ACTIVITIES.filter((p) => p.category === cat)
  }));

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
              <p className="text-xs text-amber-200/70">اختر الفقرة، وحدد النتيجة - النقاط بتتوزع تلقائي</p>
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
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">

          {/* 1. Categorized Preset Picker */}
          <div className="space-y-3.5 bg-slate-950/50 p-3.5 rounded-xl border border-white/10">
            <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>١. اختر الفقرة *</span>
            </label>

            {groupedPresets.map((group) => (
              <div key={group.category} className="space-y-1.5">
                <p className={`text-[11px] font-black ${group.meta.headerClass}`}>{group.meta.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((preset) => {
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
            ))}

            {/* Fallback manual entry, collapsed visually below the presets */}
            <details className="pt-1">
              <summary className="text-[11px] text-slate-400 cursor-pointer hover:text-slate-300">
                فقرة تانية مش موجودة في القايمة؟
              </summary>
              <input
                type="text"
                value={activePreset ? "" : activityName}
                onChange={(e) => {
                  setActivityName(e.target.value);
                }}
                placeholder="اكتب اسم الفقرة يدوياً"
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </details>
          </div>

          {/* 2. Result entry — shape depends entirely on the chosen preset's category */}
          {activePreset && (
            <div className="space-y-3 bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-900 p-4 rounded-xl border border-amber-500/30">

              {/* 🏆 WINNER: one-tap team picker */}
              {activePreset.category === "winner" && (
                <>
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                      مين الفريق الفايز في [{activePreset.name}]؟
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-300">دوس على الفريق، وهياخد الـ {activePreset.maxPoints} درجة كاملة أوتوماتيك.</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {teams.map((team) => {
                      const isWinner = getWinnerTeamId() === team.id;
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => handlePickWinner(team.id)}
                          className={`p-3.5 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            isWinner
                              ? "bg-amber-400 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/30 scale-[1.02]"
                              : "bg-slate-950/70 border-white/10 text-white hover:border-amber-500/50"
                          }`}
                        >
                          <span className="text-2xl">{team.logo}</span>
                          <span className="font-bold text-sm truncate w-full text-center">{team.name}</span>
                          {isWinner && (
                            <span className="flex items-center gap-1 text-[10px] font-black bg-slate-950/20 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> الفائز • +{activePreset.maxPoints}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* 📊 RANKED: assign a team to each position */}
              {activePreset.category === "ranked" && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Medal className="w-5 h-5 text-amber-400" />
                      <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                        ترتيب المراكز لفقرة [{activePreset.name}]
                      </h4>
                    </div>
                    <span className="text-[10px] text-amber-200/80 bg-amber-500/20 px-2 py-0.5 rounded font-bold">
                      توزيع تلقائي للنقط
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">اختر الفريق صاحب كل مركز:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {RANK_DEFINITIONS.map((rDef) => {
                      const pts = activePreset.ranks![rDef.key];
                      const currentAssignedTeamId = Object.keys(ranksMap).find((id) => ranksMap[id] === rDef.num) || "";
                      return (
                        <div key={rDef.num} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${rDef.color}`}>
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
                              <option key={t.id} value={t.id}>{t.logo} {t.name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* 📝 INDEPENDENT: direct per-team score entry */}
              {activePreset.category === "independent" && (
                <>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-400 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                      درجة كل مجموعة في [{activePreset.name}]
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-300">كل مجموعة تاخد درجتها الخاصة، من ٠ لحد {activePreset.maxPoints}:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {teams.map((team) => (
                      <div key={team.id} className="p-3 rounded-xl border border-white/10 bg-slate-950/70 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{team.logo}</span>
                          <span className="font-bold text-sm text-white truncate">{team.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <input
                            type="number"
                            min={0}
                            max={activePreset.maxPoints}
                            value={pointsMap[team.id] || 0}
                            onChange={(e) => handleIndependentChange(team.id, parseInt(e.target.value) || 0)}
                            className="w-16 h-9 text-center font-mono font-black text-sm bg-amber-500/10 border border-amber-500/40 rounded-lg text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <span className="text-[10px] text-slate-400 font-bold">/ {activePreset.maxPoints}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ➖ DEDUCTION: pick team + amount to deduct */}
              {activePreset.category === "deduction" && (
                <>
                  <div className="flex items-center gap-2">
                    <UserMinus className="w-5 h-5 text-rose-400 shrink-0" />
                    <h4 className="text-xs sm:text-sm font-bold text-rose-300">خصم درجات من أي مجموعة</h4>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-300 font-bold">قد إيه هتخصم؟</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={deductionAmount}
                        onChange={(e) => handleDeductionAmountChange(parseInt(e.target.value) || 0)}
                        className="w-20 h-10 text-center font-mono font-black text-base bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                      <span className="text-xs text-slate-400 font-bold">نقطة</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 pt-1">من أي مجموعة؟</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {teams.map((team) => {
                      const isSelected = getDeductionTeamId() === team.id;
                      return (
                        <button
                          key={team.id}
                          type="button"
                          onClick={() => handlePickDeductionTeam(team.id)}
                          className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "bg-rose-500/20 border-rose-400 text-rose-200 shadow-md"
                              : "bg-slate-950/70 border-white/10 text-white hover:border-rose-500/50"
                          }`}
                        >
                          <span className="text-xl shrink-0">{team.logo}</span>
                          <span className="font-bold text-sm truncate">{team.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-black bg-rose-500/30 px-1.5 py-0.5 rounded-full mr-auto shrink-0">
                              -{deductionAmount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 2b. Fallback generic entry for a custom/manual activity name (no matching preset) */}
          {!activePreset && activityName.trim().length > 0 && (
            <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                <h4 className="text-xs sm:text-sm font-bold text-amber-300">درجة كل مجموعة في [{activityName.trim()}]</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {teams.map((team) => (
                  <div key={team.id} className="p-3 rounded-xl border border-white/10 bg-slate-950/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{team.logo}</span>
                      <span className="font-bold text-sm text-white truncate">{team.name}</span>
                    </div>
                    <input
                      type="number"
                      value={pointsMap[team.id] || 0}
                      onChange={(e) => handleIndependentChange(team.id, parseInt(e.target.value) || 0)}
                      className="w-16 h-9 text-center font-mono font-black text-sm bg-amber-500/10 border border-amber-500/40 rounded-lg text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Reason field */}
          <div className="space-y-2.5 bg-slate-950/60 p-3.5 rounded-2xl border border-indigo-500/30 shadow-inner">
            <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>تفاصيل/سبب النقاط *</span>
            </label>
            <p className="text-[10px] text-slate-400 -mt-1">بتتملى تلقائي لما تختار فقرة من فوق، وتقدر تعدلها زي ما تحب.</p>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="اكتب سبب/تفاصيل النقاط..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/50 text-slate-100 text-xs font-medium outline-none focus:ring-1 focus:ring-amber-500"
            />
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
