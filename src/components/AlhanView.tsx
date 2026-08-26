import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Music, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Volume2, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Type, 
  Layers, 
  Play, 
  Flame,
  X
} from "lucide-react";
import { CopticHymn } from "../types";
import { CopticCross3D } from "./ThreeDIcons";
import { db } from "../lib/firebase";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";

interface AlhanViewProps {
  alhan: CopticHymn[];
  isAdmin: boolean;
  onRefreshData?: () => void;
}

export default function AlhanView({ alhan, isAdmin, onRefreshData }: AlhanViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"all" | "arabic" | "coptic" | "meaning">("all");
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("large");
  const [expandedHymnId, setExpandedHymnId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Admin Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHymn, setEditingHymn] = useState<CopticHymn | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [occasion, setOccasion] = useState("ألحان مؤتمر ISO");
  const [copticText, setCopticText] = useState("");
  const [copticArabicText, setCopticArabicText] = useState("");
  const [arabicMeaning, setArabicMeaning] = useState("");
  const [hazzatNotes, setHazzatNotes] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter occasions
  const occasionsList = useMemo(() => {
    const set = new Set<string>();
    alhan.forEach(h => {
      if (h.occasion) set.add(h.occasion);
    });
    return ["all", ...Array.from(set)];
  }, [alhan]);

  const filteredAlhan = useMemo(() => {
    return alhan.filter(hymn => {
      const matchSearch = 
        hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hymn.copticArabicText && hymn.copticArabicText.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hymn.copticText && hymn.copticText.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (hymn.arabicMeaning && hymn.arabicMeaning.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchOccasion = selectedOccasion === "all" || hymn.occasion === selectedOccasion;
      return matchSearch && matchOccasion;
    });
  }, [alhan, searchTerm, selectedOccasion]);

  const handleCopyText = (hymn: CopticHymn) => {
    const textToCopy = `🎶 ${hymn.title}\n\n[القبطي المعرب]:\n${hymn.copticArabicText || ""}\n\n[النص القبطي]:\n${hymn.copticText || ""}\n\n[الترجمة العربية]:\n${hymn.arabicMeaning || ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(hymn.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (hymn: CopticHymn, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHymn(hymn);
    setTitle(hymn.title);
    setOccasion(hymn.occasion || "ألحان مؤتمر ISO");
    setCopticText(hymn.copticText || "");
    setCopticArabicText(hymn.copticArabicText || "");
    setArabicMeaning(hymn.arabicMeaning || "");
    setHazzatNotes(hymn.hazzatNotes || "");
    setAudioUrl(hymn.audioUrl || "");
    setDuration(hymn.duration || "");
    setIsAddModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingHymn(null);
    setTitle("");
    setOccasion("ألحان مؤتمر ISO");
    setCopticText("");
    setCopticArabicText("");
    setArabicMeaning("");
    setHazzatNotes("");
    setAudioUrl("");
    setDuration("");
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا اللحن نهائياً؟")) return;
    try {
      await deleteDoc(doc(db, "alhan", id));
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error deleting hymn:", err);
      alert("حدث خطأ أثناء حذف اللحن!");
    }
  };

  const handleSaveHymn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!title.trim()) {
      alert("يرجى كتابة عنوان اللحن");
      return;
    }

    setIsSubmitting(true);
    try {
      const hymnId = editingHymn ? editingHymn.id : `hymn_${Date.now()}`;
      const hymnData: CopticHymn = {
        id: hymnId,
        title: title.trim(),
        occasion: occasion.trim(),
        copticText: copticText.trim(),
        copticArabicText: copticArabicText.trim(),
        arabicMeaning: arabicMeaning.trim(),
        hazzatNotes: hazzatNotes.trim(),
        audioUrl: audioUrl.trim(),
        duration: duration.trim()
      };

      await setDoc(doc(db, "alhan", hymnId), hymnData);
      setIsAddModalOpen(false);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error("Error saving hymn:", err);
      alert("حدث خطأ أثناء حفظ بيانات اللحن!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "normal": return "text-sm sm:text-base leading-relaxed";
      case "xlarge": return "text-lg sm:text-2xl leading-loose font-bold";
      case "large":
      default: return "text-base sm:text-xl leading-relaxed";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900/90 to-amber-900/60 p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.25)] shrink-0">
              <CopticCross3D className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  كتاب التسبحة والألحان
                </span>
                <span className="text-xs font-bold text-amber-400/80 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  مؤتمر ISO 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-black text-white mt-1 tracking-tight">
                قسم الألحان الكنسية 🎶
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-2xl font-medium">
                النصوص القبطية، القبطي المعرب، الترجمة العربية، وتوجيهات الهزات لفقرات حفظ اللحن والتسبيح.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            {isAdmin && (
              <button
                onClick={handleOpenAdd}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>إضافة لحن جديد ➕</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Control Bar: Search, Filters, Display Mode, Font Size */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-4">
        
        {/* Search & Font Size */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم اللحن أو الكلمات القبطية أو المعنى..."
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white placeholder-slate-400 text-xs font-medium focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Display Mode Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0">
            <span className="text-[10px] text-slate-400 px-2 font-bold hidden sm:inline">العرض:</span>
            <button
              onClick={() => setViewMode("all")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "all" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setViewMode("arabic")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "arabic" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              معرّب
            </button>
            <button
              onClick={() => setViewMode("coptic")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "coptic" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              قبطي
            </button>
            <button
              onClick={() => setViewMode("meaning")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "meaning" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
              }`}
            >
              الترجمة
            </button>
          </div>

          {/* Font Size Adjuster */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 self-end sm:self-auto">
            <span className="text-[10px] text-slate-400 px-1.5 font-bold">الخط:</span>
            <button
              onClick={() => setFontSize("normal")}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                fontSize === "normal" ? "bg-white/20 text-white font-black" : "text-slate-400 hover:text-white"
              }`}
              title="خط عادي"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("large")}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm font-bold transition-all cursor-pointer ${
                fontSize === "large" ? "bg-amber-500/30 text-amber-300 border border-amber-500/40 font-black" : "text-slate-400 hover:text-white"
              }`}
              title="خط كبير"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize("xlarge")}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-base font-bold transition-all cursor-pointer ${
                fontSize === "xlarge" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400 hover:text-white"
              }`}
              title="خط عريض جداً للتسبيح"
            >
              A++
            </button>
          </div>
        </div>

        {/* Occasions / Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {occasionsList.map((occ) => {
            const isSelected = selectedOccasion === occ;
            return (
              <button
                key={occ}
                onClick={() => setSelectedOccasion(occ)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isSelected 
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]" 
                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {occ === "all" ? "جميع الألحان" : occ}
              </button>
            );
          })}
        </div>

      </div>

      {/* Hymns Cards List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAlhan.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-white/10 space-y-3">
            <Music className="w-12 h-12 text-amber-400/40 mx-auto" />
            <h3 className="text-base font-bold text-white">لا توجد ألحان مطابقة للبحث</h3>
            <p className="text-xs text-slate-400">جرب البحث بكلمات أخرى أو اختر فئة مختلفة.</p>
          </div>
        ) : (
          filteredAlhan.map((hymn, index) => {
            const isExpanded = expandedHymnId === hymn.id || filteredAlhan.length === 1;
            const isCopied = copiedId === hymn.id;

            return (
              <motion.div
                key={hymn.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`glass-card rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isExpanded 
                    ? "border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)] bg-slate-900/90" 
                    : "border-white/10 hover:border-amber-500/30 bg-slate-900/60"
                }`}
              >
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedHymnId(isExpanded ? null : hymn.id)}
                  className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                      <Music className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {hymn.occasion || "ألحان المؤتمر"}
                        </span>
                        {hymn.duration && (
                          <span className="text-[10px] text-slate-400 font-medium">⏱️ {hymn.duration}</span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-xl font-bold text-white mt-1 truncate">
                        {hymn.title}
                      </h3>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyText(hymn);
                      }}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="نسخ كلمات اللحن"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenEdit(hymn, e)}
                          className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                          title="تعديل اللحن"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(hymn.id, e)}
                          className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                          title="حذف اللحن"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="p-2 rounded-xl bg-white/5 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/10 bg-black/30 p-5 sm:p-7 space-y-6"
                    >
                      
                      {/* Audio / Video Embed or Player button if URL exists */}
                      {hymn.audioUrl && (
                        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-inner">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                              <Volume2 className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">تسجيل صوتي / فيديو تعليمي للحن</div>
                              <div className="text-[11px] text-amber-300/80 font-medium">استمع لضبط النغمات والوقفات اللحنية</div>
                            </div>
                          </div>
                          <a
                            href={hymn.audioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow"
                          >
                            <Play className="w-3.5 h-3.5 fill-slate-950" />
                            <span>تشغيل الرابط / يوتيوب</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {/* Main Texts Display */}
                      <div className="space-y-5">
                        
                        {/* 1. Coptic Arabic Transliteration (القبطي المعرب) */}
                        {(viewMode === "all" || viewMode === "arabic") && hymn.copticArabicText && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs font-black text-amber-400 border-b border-white/10 pb-2">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                النطق بالقبطي المعرب (للتسبيح والأداء):
                              </span>
                              <span className="text-[10px] text-slate-400">حروف عربية</span>
                            </div>
                            <p className={`${getFontSizeClass()} text-amber-100 whitespace-pre-line font-medium leading-relaxed tracking-wide pt-1`}>
                              {hymn.copticArabicText}
                            </p>
                          </div>
                        )}

                        {/* 2. Coptic Text (النص القبطي) */}
                        {(viewMode === "all" || viewMode === "coptic") && hymn.copticText && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2" dir="ltr">
                            <div className="flex items-center justify-between text-xs font-black text-indigo-300 border-b border-white/10 pb-2" dir="rtl">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                النص القبطي الأصلي (Ⲙⲉⲧⲣⲉⲙⲛ̀ⲭⲏⲙⲓ):
                              </span>
                              <span className="text-[10px] text-slate-400">Coptic Unicode</span>
                            </div>
                            <p className={`${getFontSizeClass()} text-indigo-100 whitespace-pre-line font-serif leading-relaxed tracking-wide text-left pt-1`}>
                              {hymn.copticText}
                            </p>
                          </div>
                        )}

                        {/* 3. Arabic Translation / Meaning (الترجمة والمعنى) */}
                        {(viewMode === "all" || viewMode === "meaning") && hymn.arabicMeaning && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                            <div className="flex items-center justify-between text-xs font-black text-emerald-400 border-b border-white/10 pb-2">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                                الترجمة والمعنى الروحي بالعربية:
                              </span>
                              <span className="text-[10px] text-slate-400">عربي</span>
                            </div>
                            <p className={`${getFontSizeClass()} text-emerald-100/90 whitespace-pre-line font-medium leading-relaxed pt-1`}>
                              {hymn.arabicMeaning}
                            </p>
                          </div>
                        )}

                        {/* 4. Hazzat & Musical Notes (توجيهات الهزات) */}
                        {hymn.hazzatNotes && (
                          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-black text-purple-300 border-b border-white/10 pb-2">
                              <Flame className="w-3.5 h-3.5 text-purple-400" />
                              <span>ملاحظات الهزات وتوجيهات الأداء للمعلم:</span>
                            </div>
                            <p className="text-xs sm:text-sm text-purple-100/90 whitespace-pre-line leading-relaxed pt-1">
                              {hymn.hazzatNotes}
                            </p>
                          </div>
                        )}

                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })
        )}
      </div>

      {/* Admin Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Music className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingHymn ? "تعديل بيانات اللحن" : "إضافة لحن قبطي جديد"}
                  </h3>
                  <p className="text-xs text-slate-400">إدخال النصوص القبطية والمعربة والترجمة</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHymn} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم اللحن *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: لحن إبؤورو (يا ملك السلام)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white text-xs font-medium focus:ring-2 focus:ring-amber-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المناسبة / التصنيف</label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="مثال: ألحان مؤتمر ISO، سنوي، قداس..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white text-xs font-medium focus:ring-2 focus:ring-amber-500/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1">
                  القبطي المعرب (حروف عربية للنطق) *
                </label>
                <textarea
                  rows={4}
                  value={copticArabicText}
                  onChange={(e) => setCopticArabicText(e.target.value)}
                  placeholder="اكتب النطق بحروف عربية، مثل: إبؤورو إنتي تي هيريني..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-black/30 text-white text-xs font-medium focus:ring-2 focus:ring-amber-500/50 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-indigo-300 mb-1">
                  النص القبطي (Coptic Unicode)
                </label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={copticText}
                  onChange={(e) => setCopticText(e.target.value)}
                  placeholder="Ⲡⲟⲩⲣⲟ ⲛ̀ⲧⲉ ϯϩⲓⲣⲏⲛⲏ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-500/30 bg-black/30 text-white text-xs font-serif focus:ring-2 focus:ring-indigo-500/50 outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  الترجمة والمعنى الروحي بالعربية
                </label>
                <textarea
                  rows={3}
                  value={arabicMeaning}
                  onChange={(e) => setArabicMeaning(e.target.value)}
                  placeholder="المعنى بالعربية: يا ملك السلام أعطنا سلامك..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-500/30 bg-black/30 text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500/50 outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-300 mb-1">توجيهات الهزات / الأداء</label>
                  <input
                    type="text"
                    value={hazzatNotes}
                    onChange={(e) => setHazzatNotes(e.target.value)}
                    placeholder="مثال: وقفة بعد الكوبليه الأول، نغمة فرايحي..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white text-xs font-medium focus:ring-2 focus:ring-purple-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رابط التسجيل الصوتي أو يوتيوب</label>
                  <input
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/30 text-white text-xs font-medium focus:ring-2 focus:ring-amber-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الحفظ..." : "حفظ اللحن 💾"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
