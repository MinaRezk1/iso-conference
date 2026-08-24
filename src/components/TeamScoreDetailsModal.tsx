import React, { useState } from "react";
import {
  X,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Check,
  Calendar,
  Info,
  Clock,
  ShieldCheck,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { Team, ScoreLog } from "../types";
import { db } from "../lib/firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
  collection
} from "firebase/firestore";

interface TeamScoreDetailsModalProps {
  team: Team;
  teams: Team[];
  scoreLogs: ScoreLog[];
  isAdmin: boolean;
  onClose: () => void;
  onRefreshData: () => void;
}

export default function TeamScoreDetailsModal({
  team,
  teams,
  scoreLogs,
  isAdmin,
  onClose,
  onRefreshData
}: TeamScoreDetailsModalProps) {
  // Filter logs where this team has points recorded
  const teamLogs = scoreLogs
    .filter((log) => {
      const pts = (log.points as any)?.[team.id];
      return pts !== undefined && pts !== null;
    })
    .sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA;
    });

  // Calculate sum from logs to ensure consistency
  const calculatedLogsTotal = teamLogs.reduce((acc, log) => {
    return acc + (Number((log.points as any)?.[team.id]) || 0);
  }, 0);

  // States for adding custom points directly to this team
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [customPointsVal, setCustomPointsVal] = useState<number>(10);
  const [customNotes, setCustomNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Editing an existing log entry
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogName, setEditLogName] = useState("");
  const [editLogPoints, setEditLogPoints] = useState<number>(0);
  const [editLogNotes, setEditLogNotes] = useState("");

  // Handle adding custom points specifically for this team
  const handleAddCustomPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customReason.trim()) {
      alert("الرجاء إدخال سبب أونشاط إضافة النقاط!");
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);

      // Create log entry map where this team gets customPointsVal and others 0
      const pointsMap: { [key: string]: number } = {};
      teams.forEach((t) => {
        pointsMap[t.id] = t.id === team.id ? customPointsVal : 0;
      });

      const logColRef = collection(db, "scoreLogs");
      const newLogRef = doc(logColRef);

      const fullNotes = customNotes.trim()
        ? `${customNotes.trim()} • (إضافة مخصصة لـ ${team.name})`
        : `إضافة نقاط مباشرة لـ ${team.name}`;

      batch.set(newLogRef, {
        activityName: customReason.trim(),
        timestamp: new Date(),
        notes: fullNotes,
        points: pointsMap
      });

      // Update team's total score
      const teamRef = doc(db, "teams", team.id);
      const newTotal = (team.totalScore || 0) + customPointsVal;
      batch.update(teamRef, { totalScore: newTotal });

      await batch.commit();
      onRefreshData();

      setCustomReason("");
      setCustomNotes("");
      setCustomPointsVal(10);
      setShowAddCustom(false);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة النقاط.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a log
  const handleStartEditLog = (log: ScoreLog) => {
    setEditingLogId(log.id);
    setEditLogName(log.activityName || "");
    const currentPts = Number((log.points as any)?.[team.id]) || 0;
    setEditLogPoints(currentPts);
    setEditLogNotes(log.notes || "");
  };

  // Save edited log points
  const handleSaveEditLog = async (log: ScoreLog) => {
    if (!editLogName.trim()) {
      alert("الرجاء إدخال اسم النشاط!");
      return;
    }

    setIsSubmitting(true);
    try {
      const oldPts = Number((log.points as any)?.[team.id]) || 0;
      const diff = editLogPoints - oldPts;

      const updatedPoints = {
        ...(log.points || {}),
        [team.id]: editLogPoints
      };

      const batch = writeBatch(db);

      // Update log document
      const logRef = doc(db, "scoreLogs", log.id);
      batch.update(logRef, {
        activityName: editLogName.trim(),
        notes: editLogNotes.trim(),
        points: updatedPoints
      });

      // Update team total score if points changed
      if (diff !== 0) {
        const teamRef = doc(db, "teams", team.id);
        const newTeamScore = Math.max(0, (team.totalScore || 0) + diff);
        batch.update(teamRef, { totalScore: newTeamScore });
      }

      await batch.commit();
      onRefreshData();
      setEditingLogId(null);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ التعديل.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete points/log entry for this team
  const handleDeleteTeamLogPoints = async (log: ScoreLog) => {
    if (!window.confirm(`هل أنت متأكد من حذف نقاط فقرة "${log.activityName}" لهذا الفريق؟`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      const pointsMap = { ...(log.points || {}) };
      const currentPts = Number(pointsMap[team.id]) || 0;

      // Set this team's points in the log to 0
      pointsMap[team.id] = 0;

      const logRef = doc(db, "scoreLogs", log.id);
      batch.update(logRef, { points: pointsMap });

      // Deduct from team total score
      const teamRef = doc(db, "teams", team.id);
      const newScore = Math.max(0, (team.totalScore || 0) - currentPts);
      batch.update(teamRef, { totalScore: newScore });

      await batch.commit();
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف النقاط.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short"
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div
        className="glass-panel max-w-2xl w-full p-4 sm:p-6 shadow-2xl border-indigo-500/30 my-auto rounded-3xl text-slate-100"
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1 bg-white/5 rounded-2xl border border-white/10">{team.logo}</span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[11px] font-black rounded-full border border-amber-500/30 mb-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{isAdmin ? "لوحة الإدارة • كشف حساب النقاط" : "عرض تفصيلي للنقاط"}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white font-serif flex items-center gap-2">
                <span>{team.name}</span>
                <span className="text-amber-300 font-mono text-sm font-bold bg-black/40 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                  الإجمالي: {team.totalScore} نقطة
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-2xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Quick Add Button / Inline Form */}
        {isAdmin && (
          <div className="mb-4">
            {!showAddCustom ? (
              <button
                onClick={() => setShowAddCustom(true)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 rounded-2xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة أو خصم نقاط مباشرة لهذا الفريق (الأدمن) ➕</span>
              </button>
            ) : (
              <form
                onSubmit={handleAddCustomPoints}
                className="bg-black/60 border border-emerald-500/40 rounded-2xl p-3.5 space-y-3 animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>إضافة بند نقاط جديد لـ {team.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    إغلاق ❌
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-[11px] font-bold text-amber-300">اختيار نوع/تفاصيل النقاط من القائمة:</label>
                  <select
                    value={
                      ["أسئلة ومسابقات", "نقط حضور", "بونص حضور مبكر", "نقاط إجابة أسئلة ومسابقات", "نقاط الالتزام ونسبة الحضور", "بونص التواجد والحضور المبكر"].includes(customReason)
                        ? customReason
                        : customReason === "" ? "" : "CUSTOM"
                    }
                    onChange={(e) => {
                      if (e.target.value === "CUSTOM") {
                        setCustomReason("");
                      } else {
                        setCustomReason(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-500/40 bg-slate-900 text-amber-200 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="" disabled className="bg-slate-900 text-slate-400">-- اختر نوع/سبب النقاط --</option>
                    <option value="أسئلة ومسابقات" className="bg-slate-900 text-amber-300 font-bold">❓ أسئلة ومسابقات</option>
                    <option value="نقط حضور" className="bg-slate-900 text-indigo-300 font-bold">📋 نقط حضور</option>
                    <option value="بونص حضور مبكر" className="bg-slate-900 text-emerald-300 font-bold">⚡ بونص حضور مبكر</option>
                    <option value="CUSTOM" className="bg-slate-900 text-slate-300 font-bold">✏️ سبب مخصص / كتابة تفاصيل...</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">السبب / تفاصيل النقاط (تأكيد أو تعديل)</label>
                    <input
                      type="text"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="تفاصيل النقاط (أسئلة، نقط حضور، بونص حضور مبكر...)"
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">النقاط (+ أو -)</label>
                    <input
                      type="number"
                      value={customPointsVal}
                      onChange={(e) => setCustomPointsVal(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-black text-emerald-400 font-mono text-sm font-black text-center outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">ملاحظات توضيحية (اختياري)</label>
                  <input
                    type="text"
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    placeholder="ملاحظات الخادم..."
                    className="w-full px-3 py-1.5 rounded-xl border border-white/10 bg-black text-white text-xs outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    حفظ النقاط 🎯
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Detailed Points Log List */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>بنود وفضل النقاط المضافة بالفئات والتواريخ:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              عدد البنود: {teamLogs.length}
            </span>
          </div>

          {teamLogs.length === 0 ? (
            <div className="text-center py-10 bg-black/30 rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs p-4">
              <Award className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-40" />
              <p className="font-bold">لا توجد نقاط مسجلة لهذا الفريق حتى الآن.</p>
              {isAdmin && <p className="text-[11px] text-amber-300 mt-1">يمكنك استخدام زر الإضافة أعلاه لإدراج نقاط لهذا الفريق.</p>}
            </div>
          ) : (
            teamLogs.map((log) => {
              const pts = Number((log.points as any)?.[team.id]) || 0;
              const isEditingThis = editingLogId === log.id;

              if (isEditingThis && isAdmin) {
                return (
                  <div
                    key={log.id}
                    className="bg-black/80 border border-indigo-500/50 rounded-2xl p-3 space-y-2 animate-fade-in"
                  >
                    <span className="text-xs font-bold text-indigo-300 block">
                      ✏️ تعديل بند النقاط: {log.activityName}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-300 mb-0.5">اسم النشاط</label>
                        <input
                          type="text"
                          value={editLogName}
                          onChange={(e) => setEditLogName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-black text-white text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-300 mb-0.5">النقاط</label>
                        <input
                          type="number"
                          value={editLogPoints}
                          onChange={(e) => setEditLogPoints(Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-black text-amber-400 font-mono text-center text-xs font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-300 mb-0.5">الملاحظات</label>
                      <input
                        type="text"
                        value={editLogNotes}
                        onChange={(e) => setEditLogNotes(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-white/10 bg-black text-white text-xs outline-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingLogId(null)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs rounded-lg"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditLog(log)}
                        disabled={isSubmitting}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md"
                      >
                        حفظ التعديل ✓
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={log.id}
                  className="bg-black/40 hover:bg-black/60 border border-white/10 hover:border-white/20 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs sm:text-sm">
                        {log.activityName}
                      </span>
                      {log.timestamp && (
                        <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                          {formatDate(log.timestamp)}
                        </span>
                      )}
                    </div>

                    {log.notes && (
                      <p className="text-[11px] text-slate-300 font-medium leading-tight line-clamp-2">
                        {log.notes}
                      </p>
                    )}
                  </div>

                  {/* Points Badge & Admin Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-black border flex items-center gap-1 ${
                        pts >= 0
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      <span>{pts >= 0 ? `+${pts}` : pts}</span>
                      <span className="text-[10px] font-sans font-normal">نقطة</span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditLog(log)}
                          className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition cursor-pointer"
                          title="تعديل تفاصيل البند"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTeamLogPoints(log)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="حذف هذا البند"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>محسوب ضمن السكور التراكمي الشامل للمؤتمر</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
