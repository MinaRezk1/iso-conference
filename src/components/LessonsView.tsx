import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  FileText, 
  ArrowLeft,
  CalendarDays,
  User,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  EyeOff,
  Eye,
  HelpCircle,
  CheckCircle2,
  Save,
  Sparkles,
  Trophy
} from "lucide-react";
import { Lesson, ConferenceGroup } from "../types";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc } from "firebase/firestore";
import { hashPassword } from "../lib/authUtils";
import { Book3D } from "./ThreeDIcons";
import QuizView from "./QuizView";

interface LessonsViewProps {
  lessons: Lesson[];
  isAdmin: boolean;
  setIsAdmin?: (val: boolean) => void;
  onRefreshData: () => void;
  conferenceGroups: ConferenceGroup[];
}

export default function LessonsView({ lessons, isAdmin, setIsAdmin, onRefreshData, conferenceGroups }: LessonsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState<Lesson | null>(null);
  
  // Tab control: "public" (الشباب) vs "staff" (الخدام) vs "quiz" (المسابقة)
  const [subTab, setSubTab] = useState<"public" | "staff" | "quiz">("public");

  // Inline Auth Form States
  const [inlineUsername, setInlineUsername] = useState("");
  const [inlinePassword, setInlinePassword] = useState("");
  const [inlineError, setInlineError] = useState("");
  const [inlineLoggingIn, setInlineLoggingIn] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [day, setDay] = useState<number>(1);
  const [formIsStaffOnly, setFormIsStaffOnly] = useState(false);

  // Filter lessons based on subTab and searchTerm
  const tabLessons = lessons.filter(lesson => {
    if (subTab === "staff") {
      return !!lesson.isStaffOnly;
    } else {
      return !lesson.isStaffOnly;
    }
  });

  const filteredLessons = tabLessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (lesson.content && lesson.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lesson.speaker && lesson.speaker.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Automatically select the first lesson of the current filter on tab switch (if on desktop)
  useEffect(() => {
    setSelectedLesson(null);
  }, [subTab]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSpeaker("");
    setDay(1);
    setFormIsStaffOnly(subTab === "staff");
    setIsEditing(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEdit = (lesson: Lesson, e: React.MouseEvent) => {
    e.stopPropagation();
    setTitle(lesson.title);
    setContent(lesson.content);
    setSpeaker(lesson.speaker || "");
    setDay(lesson.day || 1);
    setFormIsStaffOnly(!!lesson.isStaffOnly);
    setIsEditing(lesson);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!title || !content) {
      alert("الرجاء ملء عنوان الشرح والمحتوى الروحي!");
      return;
    }

    try {
      if (isEditing) {
        const docRef = doc(db, "lessons", isEditing.id);
        await setDoc(docRef, {
          title,
          content,
          speaker,
          day: Number(day),
          isStaffOnly: formIsStaffOnly
        }, { merge: true });
        if (selectedLesson?.id === isEditing.id) {
          setSelectedLesson({ 
            id: isEditing.id, 
            title, 
            content, 
            speaker, 
            day: Number(day), 
            isStaffOnly: formIsStaffOnly 
          });
        }
      } else {
        const colRef = collection(db, "lessons");
        await addDoc(colRef, {
          title,
          content,
          speaker,
          day: Number(day),
          isStaffOnly: formIsStaffOnly
        });
      }
      onRefreshData();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ مادة الشرح.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm("هل أنت متأكد من حذف هذا الشرح الدراسي نهائياً؟")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "lessons", id));
      if (selectedLesson?.id === id) {
        setSelectedLesson(null);
      }
      onRefreshData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف.");
    }
  };

  const handleInlineLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setIsAdmin) return;
    const u = inlineUsername.trim();
    const p = inlinePassword.trim();

    if (!u || !p) {
      setInlineError("من فضلك ادخل اسم المستخدم وكلمة المرور.");
      return;
    }

    setInlineLoggingIn(true);
    setInlineError("");
    try {
      const hash = await hashPassword(p);
      const q = query(
        collection(db, "adminUsers"),
        where("username", "==", u),
        where("passwordHash", "==", hash)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setIsAdmin(true);
        try {
          localStorage.setItem("reflect_admin_username", u);
        } catch (e) {
          // ignore
        }
        setInlineUsername("");
        setInlinePassword("");
      } else {
        setInlineError("اسم المستخدم أو كلمة المرور غير صحيحة! حاول مجدداً.");
      }
    } catch (err) {
      console.error(err);
      setInlineError("حدث خطأ أثناء تسجيل الدخول، حاول مجدداً.");
    } finally {
      setInlineLoggingIn(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-white" dir="rtl">
      
      {/* Header and Add button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-70 block mb-1">Studies & Manuals</span>
          <h2 className="text-3xl font-serif font-black text-white flex items-center gap-2">
            <Book3D className="w-10 h-10 shrink-0" />
            <span>الشروحات والدراسات الروحية</span>
          </h2>
          <p className="text-xs text-slate-300 mt-2 font-medium">
            دراسات كتابية، المنهج الدراسي للمؤتمر "ISO" ودليل التحضير للخدام.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 self-start glass-button px-5 py-3 text-xs tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ملخص/شرح جديد</span>
          </button>
        )}
      </div>

      {/* Sub-Tabs Switcher for Content Separation */}
      <div className="flex gap-2" dir="rtl">
        <button
          onClick={() => setSubTab("public")}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-xs sm:text-sm font-bold uppercase transition-all duration-300 cursor-pointer ${
            subTab === "public"
              ? "bg-indigo-600/30 border-t border-x border-indigo-400/50 text-white shadow-[0_-4px_15px_rgba(99,102,241,0.1)] backdrop-blur-md relative z-10"
              : "bg-black/20 text-slate-400 hover:text-white border-t border-x border-white/5 relative top-1"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>دراسات الشباب العامة</span>
        </button>

        <button
          onClick={() => setSubTab("staff")}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-xs sm:text-sm font-bold uppercase transition-all duration-300 cursor-pointer ${
            subTab === "staff"
              ? "bg-indigo-600/30 border-t border-x border-indigo-400/50 text-white shadow-[0_-4px_15px_rgba(99,102,241,0.1)] backdrop-blur-md relative z-10"
              : "bg-black/20 text-slate-400 hover:text-white border-t border-x border-white/5 relative top-1"
          }`}
        >
          {isAdmin ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
          <span>ركن الخدام الخاص</span>
          {!isAdmin && (
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-md font-bold border border-rose-500/30">
              مغلق 🔒
            </span>
          )}
        </button>

        <button
          onClick={() => setSubTab("quiz")}
          className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-xs sm:text-sm font-bold uppercase transition-all duration-300 cursor-pointer ${
            subTab === "quiz"
              ? "bg-amber-600/30 border-t border-x border-amber-400/50 text-white shadow-[0_-4px_15px_rgba(217,119,6,0.1)] backdrop-blur-md relative z-10"
              : "bg-black/20 text-slate-400 hover:text-white border-t border-x border-white/5 relative top-1"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>مسابقة سفر الأمثال</span>
        </button>
      </div>

      <div className="-mt-px relative z-0">
      {/* Grid view: List & Content / Locked Screen for Staff tab / Quiz tab */}
      {subTab === "quiz" ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tr-none p-4 sm:p-6 backdrop-blur-sm">
          <QuizView isAdmin={isAdmin} groups={conferenceGroups} />
        </div>
      ) : subTab === "staff" && !isAdmin ? (
        /* GORGEOUS LOCKED STATE PANEL */
        <div className="glass-panel p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 animate-fade-in border-t-0 rounded-tr-none">
          <div className="inline-flex bg-rose-500/10 text-rose-400 p-4 rounded-full border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <Lock className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-serif font-black text-white">قسم خاص بالخدام والمنظمين</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium max-w-md mx-auto">
              هذا الركن يحتوي على الملازم التحضيرية للخدام، دليل قائد المجموعة لدراسة الكتاب المقدس، التعليمات السرية، الملاحظات الإدارية، وتوزيع الأدوار التنظيمية للمؤتمر.
            </p>
          </div>

          {/* Inline Login Form */}
          <div className="border-t border-white/10 pt-6 mt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>تسجيل الدخول السريع للخدام</span>
            </h4>

            <form onSubmit={handleInlineLoginSubmit} className="space-y-3.5 max-w-xs mx-auto">
              <div>
                <input
                  type="text"
                  value={inlineUsername}
                  onChange={(e) => {
                    setInlineUsername(e.target.value);
                    setInlineError("");
                  }}
                  placeholder="اسم المستخدم"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/80 text-white text-center text-xs font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={inlinePassword}
                  onChange={(e) => {
                    setInlinePassword(e.target.value);
                    setInlineError("");
                  }}
                  placeholder="كلمة المرور"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700/80 bg-slate-950/80 text-white text-center font-mono font-bold text-xs tracking-wider focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
                />
              </div>

              {inlineError && (
                <p className="text-xs text-rose-300 font-bold text-center bg-rose-500/15 border border-rose-500/30 py-2 rounded-xl">
                  {inlineError}
                </p>
              )}

              <button
                type="submit"
                disabled={inlineLoggingIn}
                className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Unlock className="w-4 h-4 text-indigo-200" />
                <span>{inlineLoggingIn ? "جارٍ التحقق..." : "فتح القسم وتفعيل وضع الخادم"}</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* NORMAL LIST AND DETAILS GRID */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/5 border border-white/10 rounded-2xl rounded-tr-none p-4 backdrop-blur-sm">
          
          {/* Studies List */}
          <div className={`md:col-span-1 space-y-4 ${selectedLesson ? 'hidden md:block' : 'block'}`}>
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بالعنوان، المتحدث، أو المحتوى..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-10 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder-slate-400 outline-none transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* List items */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 pb-4">
              {filteredLessons.length === 0 ? (
                <div className="text-center py-10 glass-panel rounded-xl text-slate-400 text-xs border-dashed">
                  لا توجد مواد دراسية في هذا القسم حالياً.
                </div>
              ) : (
                filteredLessons.map(lesson => (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`group p-4 rounded-xl transition-all cursor-pointer text-right flex flex-col gap-2 relative border ${
                      selectedLesson?.id === lesson.id
                        ? "bg-indigo-600/30 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/20"
                        : "glass-card text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase bg-white/10 text-white px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm">
                        اليوم {lesson.day || 1}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {lesson.isStaffOnly && (
                          <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold">
                            خدام 🔑
                          </span>
                        )}
                        
                        {isAdmin && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                            <button
                              onClick={(e) => handleOpenEdit(lesson, e)}
                              className="p-1.5 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition"
                              title="تعديل الشرح"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(lesson.id, e)}
                              className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition"
                              title="حذف الشرح"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xs md:text-sm font-bold truncate leading-tight mt-1 text-white">{lesson.title}</h3>
                    
                    {lesson.speaker && (
                      <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{lesson.speaker}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Selected Study Content Details */}
          <div className={`md:col-span-2 ${selectedLesson ? 'block' : 'hidden md:flex flex-col items-center justify-center glass-panel border-dashed p-8 min-h-[400px]'}`}>
            {selectedLesson ? (
              <div className="glass-panel p-6 sm:p-8 space-y-6 relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="md:hidden self-start flex items-center gap-1 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>العودة للقائمة</span>
                  </button>
                  
                  <div className="space-y-2 flex-1 text-right">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 backdrop-blur-sm">
                        اليوم {selectedLesson.day || 1} من المؤتمر
                      </span>
                      {selectedLesson.isStaffOnly && (
                        <span className="text-[11px] font-bold bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30 backdrop-blur-sm">
                          قسم الخدام السري 🔑
                        </span>
                      )}
                      {selectedLesson.speaker && (
                        <span className="text-xs text-slate-400 font-medium bg-black/20 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                          إعداد: {selectedLesson.speaker}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-3xl font-serif font-black text-white mt-2 leading-tight drop-shadow-md">
                      {selectedLesson.title}
                    </h3>
                  </div>
                </div>

                {/* Study text view */}
                <div className="bg-black/20 border border-white/5 p-5 sm:p-8 rounded-2xl max-h-[550px] overflow-y-auto relative z-10 custom-scrollbar">
                  <FormattedStudyContent 
                    content={selectedLesson.content} 
                    lessonId={selectedLesson.id}
                    isStaffOnly={!!selectedLesson.isStaffOnly}
                  />
                </div>

                <div className="text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase relative z-10">
                  مؤتمر ISO ٢٠٢٦ • "ناظرين مجد الرب بوجه مكشوف، نتغير إلى تلك الصورة عينها"
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 py-8 relative z-10">
                <div className="bg-indigo-500/20 text-indigo-300 p-5 rounded-full w-fit mx-auto border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <BookOpen className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-serif font-black text-white">
                  {subTab === "staff" ? "دليل وملازم تحضير الخدام" : "تأملات ومسودة الكتيب"}
                </h4>
                <p className="text-sm text-slate-400 font-medium max-w-sm leading-relaxed mx-auto">
                  {subTab === "staff" 
                    ? "اختر دليلاً تنظيمياً أو تحضيرياً من القائمة لقراءة الإرشادات والأسئلة الخاصة بالخدام." 
                    : "اضغط على أي عنوان مادة دراسية من القائمة لقراءة ملخصات المحاضرات وورش مجموعات العمل كاملة."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Add / Edit Lesson Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white uppercase tracking-wider font-serif">
                {isEditing ? "تعديل المادة الروحية" : "إضافة مادة شرح/محاضرة"}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">اليوم المخصص</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium outline-none transition-all"
                  >
                    <option value={1}>اليوم الأول</option>
                    <option value={2}>اليوم الثاني</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المحاضر / الكاتب</label>
                  <input
                    type="text"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    placeholder="مثال: د. هاني فيكتور"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان المحاضرة أو ورقة العمل</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: الشرح الثاني: مفسدات البصمة"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder-slate-500 outline-none transition-all"
                />
              </div>

              {/* isStaffOnly Toggle check */}
              <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 backdrop-blur-sm">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={formIsStaffOnly}
                      onChange={(e) => setFormIsStaffOnly(e.target.checked)}
                      className="w-4 h-4 text-rose-500 bg-black/20 border-white/10 rounded focus:ring-rose-500 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 inline" />
                      <span>مادة مخصصة للخدام فقط (سري)</span>
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 leading-relaxed">
                      عند التفعيل، لن يظهر هذا الملف للشباب وسيكون متاحاً فقط للخدام بعد تسجيل دخولهم في ركن الخدام الخاص.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">المحتوى الدراسي بالتفصيل</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="اكتب نقاط المحاضرة أو أسئلة الورشة بالتفصيل هنا..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium placeholder-slate-500 outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                >
                  {isEditing ? "حفظ التغييرات" : "إضافة مادة الشرح"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface FormattedStudyContentProps {
  content: string;
  lessonId: string;
  isStaffOnly: boolean;
}

function FormattedStudyContent({ content, lessonId, isStaffOnly }: FormattedStudyContentProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Load user answers from localStorage on mount/lesson change
  useEffect(() => {
    const loadedAnswers: Record<string, string> = {};
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("س") || trimmed.startsWith("سؤال")) {
        const key = `lesson_${lessonId}_q_${index}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          loadedAnswers[key] = saved;
        }
      }
    });
    setUserAnswers(loadedAnswers);
  }, [content, lessonId]);

  const handleAnswerChange = (qIndex: number, val: string) => {
    const key = `lesson_${lessonId}_q_${qIndex}`;
    setUserAnswers(prev => ({ ...prev, [key]: val }));
    localStorage.setItem(key, val);
    
    // Show a temporary "Saved" indicator
    setSavedStatus(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [key]: false }));
    }, 1200);
  };

  const toggleAnswerReveal = (index: number) => {
    const key = `reveal_${lessonId}_a_${index}`;
    setRevealedAnswers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const lines = content.split("\n");
  
  return (
    <div className="space-y-4 text-right leading-relaxed text-slate-300" dir="rtl">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={index} className="h-2" />;
        }

        // 1. Check for main document headers
        const isTarget = trimmed.startsWith("الهدف:");
        const isIntroduction = trimmed.startsWith("المقدمة") || trimmed.startsWith("مقدمة");
        const isFirst = trimmed.startsWith("أولاً:") || trimmed.startsWith("أولاً ");
        const isSecond = trimmed.startsWith("ثانياً:") || trimmed.startsWith("ثانياً ");
        const isThird = trimmed.startsWith("ثالثاً:") || trimmed.startsWith("ثالثاً ");
        const isFourth = trimmed.startsWith("رابعاً:") || trimmed.startsWith("رابعاً ");
        const isFifth = trimmed.startsWith("خامساً:") || trimmed.startsWith("خامساً ");
        const isApplication = trimmed.startsWith("تطبيق ومناقشة") || trimmed.startsWith("تطبيق عملي") || trimmed.startsWith("تطبيق ومناقشة لتثبيت الهدف");
        const isQuestionsHeader = trimmed.startsWith("الأسئلة") || trimmed.startsWith("الأسئلة الخاصة") || trimmed.startsWith("الأسئلة الروحية");
        const isCauses = trimmed.startsWith("الأسباب الرئيسية") || trimmed.startsWith("الأسباب:");
        const isSteps = trimmed.startsWith("خطوات عملية") || trimmed.startsWith("الخطوات:");

        if (isTarget || isIntroduction || isFirst || isSecond || isThird || isFourth || isFifth || isApplication || isQuestionsHeader || isCauses || isSteps) {
          let headingColor = "text-amber-400";
          let badgeText = "دراسة";
          let badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";

          if (isTarget) {
            headingColor = "text-emerald-400";
            badgeText = "الهدف الروحي";
            badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
          } else if (isIntroduction) {
            headingColor = "text-blue-400";
            badgeText = "تهيئة ومقدمة";
            badgeColor = "bg-blue-500/20 text-blue-300 border-blue-500/30";
          } else if (isQuestionsHeader) {
            headingColor = "text-rose-400";
            badgeText = "أسئلة للحل";
            badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
          } else if (isApplication) {
            headingColor = "text-violet-400";
            badgeText = "تطبيق عملي";
            badgeColor = "bg-violet-500/20 text-violet-300 border-violet-500/30";
          }

          return (
            <div key={index} className="mt-8 mb-4 border-b border-white/10 pb-3">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border backdrop-blur-sm ${badgeColor}`}>
                  {badgeText}
                </span>
              </div>
              <h4 className={`text-base sm:text-lg md:text-xl font-serif font-black flex items-center gap-2 drop-shadow-md ${headingColor}`}>
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
                <span>{trimmed}</span>
              </h4>
            </div>
          );
        }

        // 2. Check for Bible Verses
        const isVerse = trimmed.startsWith("«") || (trimmed.includes("»") && (trimmed.includes("تكوين") || trimmed.includes("كورنثوس") || trimmed.includes("جامعة") || trimmed.includes("أفسس") || trimmed.includes("كولوسي") || trimmed.includes("لوقا") || trimmed.includes("يوحنا") || trimmed.includes("رومية")));
        if (isVerse) {
          return (
            <div 
              key={index} 
              className="my-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute left-2 -bottom-4 text-amber-500/10 font-black text-8xl select-none font-serif">
                ❞
              </div>
              <div className="flex items-start gap-3 relative z-10">
                <span className="text-amber-400 text-xl leading-none shrink-0 mt-1">📖</span>
                <p className="font-serif italic text-xs sm:text-sm md:text-base leading-relaxed text-amber-100 font-medium drop-shadow-sm">
                  {trimmed}
                </p>
              </div>
            </div>
          );
        }

        // 3. Check for Questions
        const isQuestion = trimmed.startsWith("س1") || trimmed.startsWith("س2") || trimmed.startsWith("س3") || trimmed.startsWith("س4") || trimmed.startsWith("س5") || trimmed.startsWith("سؤال") || trimmed.startsWith("س ");
        if (isQuestion) {
          const qKey = `lesson_${lessonId}_q_${index}`;
          const currentAnswer = userAnswers[qKey] || "";
          const isSaved = savedStatus[qKey] || false;
          const isTraineeWorkbook = lessonId === "lesson_questions_day1" || lessonId.includes("question") || lessonId.includes("workbook");

          return (
            <div 
              key={index} 
              className="my-6 bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-md border border-indigo-500/30 shrink-0">
                  سؤال للمجموعة
                </span>
                <p className="font-serif font-black text-xs sm:text-sm md:text-base text-white leading-snug drop-shadow-md">
                  {trimmed}
                </p>
              </div>

              {isTraineeWorkbook && (
                <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold text-slate-400">
                      مساحة مخصصة لكتابة إجابتك وتأملاتك الفردية:
                    </label>
                    {isSaved && (
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        تم الحفظ تلقائياً في جهازك 💾
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="اكتب إجابتك أو تأملاتك الشخصية هنا لحفظها على جهازك للمناقشة في مجموعة العمل..."
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed text-right placeholder-slate-500 transition-all resize-none custom-scrollbar"
                  />
                </div>
              )}
            </div>
          );
        }

        // 4. Check for Answers/Responses (starts with ج: or الإجابة:)
        const isAnswer = trimmed.startsWith("ج:") || trimmed.startsWith("الإجابة:") || trimmed.startsWith("ج ") || trimmed.startsWith("أ) ") || trimmed.startsWith("ب) ");
        if (isAnswer) {
          const revealKey = `reveal_${lessonId}_a_${index}`;
          const isRevealed = revealedAnswers[revealKey] || false;

          return (
            <div key={index} className="my-4">
              <button
                type="button"
                onClick={() => toggleAnswerReveal(index)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold cursor-pointer hover:bg-emerald-500/20 transition-all mb-2 backdrop-blur-sm"
              >
                {isRevealed ? <EyeOff className="w-3.5 h-3.5 shrink-0" /> : <Eye className="w-3.5 h-3.5 shrink-0" />}
                <span>{isRevealed ? "إخفاء الإجابة النموذجية 🙈" : "عرض الإجابة النموذجية 👁️"}</span>
              </button>

              {isRevealed && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 sm:p-5 my-3 animate-fade-in backdrop-blur-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <p className="text-xs sm:text-sm md:text-base font-medium leading-relaxed text-emerald-100">
                    {trimmed}
                  </p>
                </div>
              )}
            </div>
          );
        }

        // 5. Bullet list items
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("• ");
        if (isBullet) {
          return (
            <div key={index} className="flex items-start gap-3 my-2.5 pr-2">
              <span className="text-indigo-400 text-sm shrink-0 mt-0.5">•</span>
              <p className="text-xs sm:text-sm md:text-base font-medium leading-relaxed text-slate-300">
                {trimmed.substring(trimmed.startsWith("- ") ? 2 : 1).trim()}
              </p>
            </div>
          );
        }

        // 6. Numbered items
        const isNumberItem = /^[0-9١٢٣٤٥٦٧٨٩]+\.?\s*-?\s*/.test(trimmed);
        if (isNumberItem) {
          const match = trimmed.match(/^([0-9١٢٣٤٥٦٧٨٩]+)\.?\s*-?\s*(.*)$/);
          if (match) {
            const num = match[1];
            const rest = match[2];
            return (
              <div key={index} className="flex items-start gap-3 my-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold shrink-0 mt-0.5">
                  {num}
                </span>
                <p className="text-xs sm:text-sm md:text-base font-medium leading-relaxed text-slate-300">
                  {rest}
                </p>
              </div>
            );
          }
        }

        // Default: Render as regular paragraph
        return (
          <p key={index} className="text-xs sm:text-sm md:text-base font-medium leading-relaxed text-slate-300 my-2.5">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
