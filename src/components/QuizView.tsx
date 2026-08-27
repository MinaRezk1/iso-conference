import React, { useState, useEffect, useMemo } from "react";
import {
  Trophy,
  CheckCircle2,
  Send,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Loader2,
  Eye
} from "lucide-react";
import { QuizQuestion, QuizAnswer, QuizSubmission, ConferenceGroup } from "../types";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { seedQuizQuestionsIfEmpty, INITIAL_QUIZ_QUESTIONS } from "../lib/seedData";

interface QuizViewProps {
  isAdmin: boolean;
  groups: ConferenceGroup[];
}

const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670]/g;

function normalizeArabic(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\u0600-\u06FF\s]/g, " ")
    .toLowerCase()
    .trim();
}

function similarityHint(answer: string, reference: string): { pct: number; label: string; className: string } {
  if (!answer.trim() || !reference.trim()) {
    return { pct: 0, label: "بدون إجابة", className: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
  }
  const answerWords = new Set(normalizeArabic(answer).split(/\s+/).filter((w) => w.length > 2));
  const refWords = new Set(normalizeArabic(reference).split(/\s+/).filter((w) => w.length > 2));
  if (refWords.size === 0) return { pct: 0, label: "—", className: "bg-slate-500/15 text-slate-400 border-slate-500/30" };

  let overlap = 0;
  refWords.forEach((w) => {
    if (answerWords.has(w)) overlap++;
  });
  const pct = Math.round((overlap / refWords.size) * 100);

  if (pct >= 60) return { pct, label: `🟢 تطابق ${pct}٪`, className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
  if (pct >= 30) return { pct, label: `🟡 تطابق ${pct}٪`, className: "bg-amber-500/15 text-amber-300 border-amber-500/30" };
  return { pct, label: `🔴 تطابق ${pct}٪`, className: "bg-rose-500/15 text-rose-300 border-rose-500/30" };
}

const LOCAL_STORAGE_KEY = "iso_quiz_proverbs_submitted_v1";

export default function QuizView({ isAdmin, groups }: QuizViewProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUIZ_QUESTIONS);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Public form state
  const [participantName, setParticipantName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<{ score: number; max: number } | null>(null);

  // Admin dashboard state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "quizQuestions"),
      (snap) => {
        if (snap.empty) {
          seedQuizQuestionsIfEmpty();
          setQuestions(INITIAL_QUIZ_QUESTIONS);
          return;
        }
        const data: QuizQuestion[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as QuizQuestion));
        data.sort((a, b) => a.order - b.order);
        setQuestions(data);
      },
      (err) => {
        console.warn("quizQuestions snapshot error", err?.message || err);
        setQuestions(INITIAL_QUIZ_QUESTIONS);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) setAlreadySubmitted(true);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    setLoadingSubmissions(true);
    const unsub = onSnapshot(
      collection(db, "quizSubmissions"),
      (snap) => {
        const data: QuizSubmission[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as QuizSubmission));
        data.sort((a, b) => {
          const ta = a.submittedAt ? new Date(a.submittedAt as any).getTime() || 0 : 0;
          const tb = b.submittedAt ? new Date(b.submittedAt as any).getTime() || 0 : 0;
          return tb - ta;
        });
        setSubmissions(data);
        setLoadingSubmissions(false);
      },
      (err) => {
        console.error("quizSubmissions snapshot error", err);
        setLoadingSubmissions(false);
      }
    );
    return () => unsub();
  }, [isAdmin]);

  const sections = useMemo(() => {
    const map = new Map<string, QuizQuestion[]>();
    for (const q of questions) {
      if (!map.has(q.section)) map.set(q.section, []);
      map.get(q.section)!.push(q);
    }
    return Array.from(map.entries());
  }, [questions]);

  const mcqCount = questions.filter((q) => q.type === "mcq").length;

  const handleSelectMcq = (q: QuizQuestion, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [q.id]: { questionId: q.id, type: "mcq", selectedOptionIndex: optionIndex }
    }));
  };

  const handleTextChange = (q: QuizQuestion, text: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: { questionId: q.id, type: "text", textAnswer: text } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (previewMode) {
      alert("ده وضع معاينة بس للأدمن — مفيش بيانات هتتحفظ فعلياً.");
      return;
    }

    const name = participantName.trim();
    if (!name) {
      setError("من فضلك اكتب اسمك.");
      return;
    }
    if (!groupId) {
      setError("من فضلك اختر مجموعتك.");
      return;
    }
    const unanswered = questions.filter(
      (q) => !answers[q.id] || (q.type === "text" && !answers[q.id].textAnswer?.trim())
    );
    if (unanswered.length > 0) {
      setError(`في ${unanswered.length} سؤال لسه محتاج إجابة قبل الإرسال.`);
      return;
    }

    setSubmitting(true);
    try {
      let autoScore = 0;
      questions.forEach((q) => {
        if (q.type === "mcq") {
          const a = answers[q.id];
          if (a && a.selectedOptionIndex === q.correctOptionIndex) autoScore++;
        }
      });

      const group = groups.find((g) => g.id === groupId);
      const submission = {
        participantName: name,
        groupId,
        groupName: group ? group.name : groupId,
        answers: questions.map((q) => answers[q.id]),
        autoScore,
        autoScoreMax: mcqCount,
        manualScore: null,
        submittedAt: serverTimestamp()
      };

      await addDoc(collection(db, "quizSubmissions"), submission);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, "true");
      } catch (e) {
        // ignore
      }
      setAlreadySubmitted(true);
      setLastResult({ score: autoScore, max: mcqCount });
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إرسال إجابتك، حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualScoreChange = async (submissionId: string, value: string) => {
    if (!isAdmin) return;
    const num = value === "" ? null : Number(value);
    try {
      await updateDoc(doc(db, "quizSubmissions", submissionId), { manualScore: num });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCsv = () => {
    const headers = [
      "الاسم",
      "المجموعة",
      "درجة الاختيار من متعدد",
      "الدرجة النهائية",
      ...questions.map((q) => q.prompt)
    ];
    const rows = submissions.map((s) => {
      const answerMap = new Map((s.answers || []).map((a) => [a.questionId, a]));
      const answerCells = questions.map((q) => {
        const a = answerMap.get(q.id);
        if (!a) return "";
        if (a.type === "mcq") {
          const opt = q.options && a.selectedOptionIndex !== undefined ? q.options[a.selectedOptionIndex] : "";
          return opt || "";
        }
        return a.textAnswer || "";
      });
      return [
        s.participantName,
        s.groupName,
        `${s.autoScore}/${s.autoScoreMax}`,
        s.manualScore !== null && s.manualScore !== undefined ? String(s.manualScore) : "",
        ...answerCells
      ];
    });

    const csvEscape = (val: string) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "نتائج_مسابقة_سفر_الأمثال.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------- ADMIN RESULTS DASHBOARD ----------
  if (isAdmin && !previewMode) {
    return (
      <div className="space-y-6 animate-fade-in text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-2xl font-serif font-black text-white flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-400 shrink-0" />
              <span>نتائج مسابقة سفر الأمثال</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 font-medium">
              {submissions.length} إجابة مسجلة حتى الآن
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPreviewMode(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 shrink-0" />
              <span>معاينة نموذج المسابقة</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              disabled={submissions.length === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600/80 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500/40 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>تحميل النتائج (Excel)</span>
            </button>
          </div>
        </div>

        {loadingSubmissions ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>جارٍ تحميل النتائج...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass-panel p-10 text-center text-slate-400 text-sm">
            لسه محدش سلّم إجابته على المسابقة.
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((s) => {
              const isOpen = expandedId === s.id;
              const answerMap = new Map((s.answers || []).map((a) => [a.questionId, a]));
              return (
                <div
                  key={s.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : s.id)}
                    className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-3 text-right">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300 shrink-0">
                        {s.participantName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{s.participantName}</p>
                        <p className="text-[11px] text-slate-400">{s.groupName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                        اختيارات: {s.autoScore}/{s.autoScoreMax}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-4 sm:p-5 border-t border-white/10 space-y-5 bg-black/20">
                      <div className="flex items-center gap-2 max-w-xs">
                        <label className="text-xs font-bold text-slate-300 shrink-0">
                          الدرجة النهائية (بعد المراجعة):
                        </label>
                        <input
                          type="number"
                          defaultValue={s.manualScore ?? ""}
                          onBlur={(e) => handleManualScoreChange(s.id, e.target.value)}
                          placeholder="اكتب الدرجة"
                          className="w-24 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700 text-white text-xs text-center font-bold outline-none focus:border-indigo-500"
                        />
                      </div>

                      {questions.map((q) => {
                        const a = answerMap.get(q.id);
                        const userOption =
                          a?.type === "mcq" && a.selectedOptionIndex !== undefined && q.options
                            ? q.options[a.selectedOptionIndex]
                            : null;
                        const isCorrect = q.type === "mcq" && a?.selectedOptionIndex === q.correctOptionIndex;
                        return (
                          <div key={q.id} className="text-xs">
                            <p className="font-bold text-slate-300 mb-1.5">{q.prompt}</p>
                            {q.type === "mcq" ? (
                              <p
                                className={`font-bold px-3 py-1.5 rounded-lg inline-block ${
                                  isCorrect
                                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                    : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                                }`}
                              >
                                {userOption || "لم يُجب"} {isCorrect ? "✓" : `✗ (الصح: ${q.options?.[q.correctOptionIndex ?? 0]})`}
                              </p>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-slate-200 leading-relaxed">
                                    {a?.textAnswer || "لم يُجب"}
                                  </p>
                                  {a?.textAnswer && q.referenceAnswer && (() => {
                                    const hint = similarityHint(a.textAnswer || "", q.referenceAnswer || "");
                                    return (
                                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 ${hint.className}`}>
                                        {hint.label}
                                      </span>
                                    );
                                  })()}
                                </div>
                                {q.referenceAnswer && (
                                  <p className="text-emerald-300/80 text-[11px] flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <span>الإجابة النموذجية: {q.referenceAnswer}</span>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ---------- THANK YOU SCREEN ----------
  if (alreadySubmitted && !previewMode) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4 animate-fade-in text-white">
        <div className="inline-flex bg-emerald-500/10 text-emerald-400 p-5 rounded-full border border-emerald-500/30">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-serif font-black">تم إرسال إجاباتك بنجاح! 🎉</h3>
        {lastResult && (
          <p className="text-slate-300 text-sm leading-relaxed">
            حصلت على <span className="font-black text-emerald-400">{lastResult.score}</span> من{" "}
            <span className="font-black">{lastResult.max}</span> في أسئلة الاختيار من متعدد.
            <br />
            باقي الأسئلة هتتراجع مع الدرجة النهائية من الخدام.
          </p>
        )}
        <p className="text-slate-400 text-xs">شكراً لمشاركتك، ربنا يبارك تعبك 🙏</p>
      </div>
    );
  }

  // ---------- PUBLIC FORM / ADMIN PREVIEW ----------
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in text-white">
      {previewMode && isAdmin && (
        <button
          onClick={() => setPreviewMode(false)}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span>عودة إلى لوحة النتائج</span>
        </button>
      )}

      <div className="text-center space-y-2 border-b border-white/10 pb-6">
        <div className="inline-flex bg-amber-500/10 text-amber-400 p-4 rounded-full border border-amber-500/30 mb-2">
          <Trophy className="w-8 h-8" />
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif font-black">مسابقة سفر الأمثال</h3>
        <p className="text-slate-400 text-xs">الإصحاح التاسع والعاشر — اقرأ كل سؤال بعناية وجاوب بأمانة 🙏</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid sm:grid-cols-2 gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">الاسم بالكامل</label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="اكتب اسمك"
              className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/80 text-white text-right text-sm font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">المجموعة</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/80 text-white text-right text-sm font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">اختر مجموعتك</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sections.map(([sectionName, sectionQuestions]) => (
          <div key={sectionName} className="space-y-4">
            <h4 className="text-sm sm:text-base font-serif font-black text-amber-400 border-b border-amber-500/20 pb-2">
              {sectionName}
            </h4>
            {sectionQuestions.map((q) => (
              <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
                <p className="font-bold text-sm text-white mb-3">{q.prompt}</p>
                {q.type === "mcq" ? (
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {q.options?.map((opt, idx) => {
                      const selected = answers[q.id]?.selectedOptionIndex === idx;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleSelectMcq(q, idx)}
                          className={`text-right px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selected
                              ? "bg-indigo-600/40 border-indigo-400 text-white"
                              : "bg-black/20 border-white/10 text-slate-300 hover:border-indigo-500/50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={answers[q.id]?.textAnswer || ""}
                    onChange={(e) => handleTextChange(q, e.target.value)}
                    placeholder="اكتب إجابتك هنا..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed text-right placeholder-slate-500 transition-all resize-none"
                  />
                )}
              </div>
            ))}
          </div>
        ))}

        {error && (
          <p className="text-xs text-rose-300 font-bold text-center bg-rose-500/15 border border-rose-500/30 py-3 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          <span>{submitting ? "جارٍ الإرسال..." : previewMode ? "إرسال (وضع معاينة)" : "إرسال الإجابات"}</span>
        </button>
      </form>
    </div>
  );
}
