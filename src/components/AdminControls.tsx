import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Lock, ShieldAlert, RefreshCw, KeyRound, Download, Upload, X, ShieldCheck, Eye, EyeOff, Users, UserPlus, Trash2, ChevronRight } from "lucide-react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { seedDatabaseIfEmpty, importDatabaseJSON } from "../lib/seedData";
import { db } from "../lib/firebase";
import { hashPassword } from "../lib/authUtils";
import { AdminUser } from "../types";

interface AdminControlsProps {
  isAdmin: boolean;
  setIsAdmin: (val: boolean) => void;
  onRefreshData?: () => void;
  onExportData?: () => void;
  onImportData?: (jsonData: any) => Promise<void> | void;
  forceOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function AdminControls({ 
  isAdmin, 
  setIsAdmin, 
  onRefreshData, 
  onExportData,
  onImportData,
  forceOpenModal,
  onModalClose
}: AdminControlsProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [internalShowModal, setInternalShowModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Manage admin accounts (add / delete)
  const [showManageAdmins, setShowManageAdmins] = useState(false);
  const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>([]);
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [manageError, setManageError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showModal = forceOpenModal || internalShowModal;

  const closeModal = () => {
    setInternalShowModal(false);
    if (onModalClose) onModalClose();
    setError("");
    setUsername("");
    setPassword("");
    setShowManageAdmins(false);
  };

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedUsername = username.trim();
    const sanitizedPassword = password.trim();

    if (!sanitizedUsername || !sanitizedPassword) {
      setError("من فضلك ادخل اسم المستخدم وكلمة المرور.");
      return;
    }

    setIsLoggingIn(true);
    setError("");
    try {
      const hash = await hashPassword(sanitizedPassword);
      const q = query(
        collection(db, "adminUsers"),
        where("username", "==", sanitizedUsername),
        where("passwordHash", "==", hash)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setIsAdmin(true);
        try {
          localStorage.setItem("reflect_admin_username", sanitizedUsername);
        } catch (e) {
          // ignore
        }
        closeModal();
      } else {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة! حاول مجدداً.");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء تسجيل الدخول، حاول مجدداً.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem("reflect_admin_username");
    } catch (e) {
      // ignore
    }
  };

  // Fetch admin users list only while the manage-admins panel is open
  useEffect(() => {
    if (!showManageAdmins || !isAdmin) return;
    const unsub = onSnapshot(
      collection(db, "adminUsers"),
      (snap) => {
        const list: AdminUser[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AdminUser));
        list.sort((a, b) => a.username.localeCompare(b.username));
        setAdminUsersList(list);
      },
      (err) => console.error("adminUsers snapshot error", err)
    );
    return () => unsub();
  }, [showManageAdmins, isAdmin]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const uname = newAdminUsername.trim();
    const pwd = newAdminPassword.trim();
    setManageError("");

    if (!uname || !pwd) {
      setManageError("من فضلك ادخل اسم مستخدم وكلمة مرور.");
      return;
    }
    if (pwd.length < 4) {
      setManageError("كلمة المرور قصيرة جداً (٤ حروف على الأقل).");
      return;
    }

    setIsAddingAdmin(true);
    try {
      const existing = await getDocs(query(collection(db, "adminUsers"), where("username", "==", uname)));
      if (!existing.empty) {
        setManageError("اسم المستخدم ده مستخدم بالفعل.");
        setIsAddingAdmin(false);
        return;
      }
      const hash = await hashPassword(pwd);
      await addDoc(collection(db, "adminUsers"), {
        username: uname,
        passwordHash: hash,
        createdAt: new Date().toISOString()
      });
      setNewAdminUsername("");
      setNewAdminPassword("");
    } catch (err) {
      console.error(err);
      setManageError("حدث خطأ أثناء إضافة الحساب.");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminUser: AdminUser) => {
    if (!isAdmin) return;
    if (adminUsersList.length <= 1) {
      alert("لازم يفضل حساب أدمن واحد على الأقل، مينفعش تمسح آخر حساب.");
      return;
    }
    if (!window.confirm(`هل أنت متأكد من حذف حساب "${adminUser.username}"؟`)) return;
    try {
      await deleteDoc(doc(db, "adminUsers", adminUser.id));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف الحساب.");
    }
  };

  const triggerSeed = async () => {
    if (!window.confirm("هل أنت متأكد من إعادة تعيين البيانات الروحية وغرف المؤتمر إلى الحالة الافتراضية؟")) {
      return;
    }
    setIsResetting(true);
    try {
      await seedDatabaseIfEmpty(true);
      if (onRefreshData) onRefreshData();
      alert("تمت إعادة تعيين البيانات وتغذيتها بنجاح!");
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء تحديث البيانات.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsedData = JSON.parse(text);

        if (!window.confirm("هل أنت متأكد من استعادة بيانات المؤتمر من هذا الملف المحدد؟ سيتم تحديث وتجميع كافة الجداول بالكامل.")) {
          return;
        }

        setIsImporting(true);
        if (onImportData) {
          await onImportData(parsedData);
        } else {
          const count = await importDatabaseJSON(parsedData);
          alert(`تمت استعادة ${count} مفردة بيانات بنجاح إلى قاعدة بيانات المؤتمر! 🚀`);
        }
      } catch (err: any) {
        console.error("Import error:", err);
        alert(err?.message || "حدث خطأ أثناء قراءة ملف البيانات! تأكد من اختيار ملف JSON صحيح.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Hidden File Input for Data Restore */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isAdmin ? (
        <>
          {/* Mobile View Badge & Menu Trigger */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={() => setInternalShowModal(true)}
              className="flex items-center gap-1.5 bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/40 px-2.5 py-1.5 rounded-xl text-emerald-300 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              <span>الخادم 🔑</span>
            </button>
          </div>

          {/* Desktop Full Toolbar */}
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/90 border border-emerald-500/40 p-1.5 rounded-xl backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-1.5 text-emerald-400 shrink-0 px-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-black text-emerald-300">وضع الخادم</span>
            </div>

            {onExportData && (
              <button
                onClick={onExportData}
                title="تحميل وتصدير كافة بيانات المؤتمر (نسخة احتياطية)"
                className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
                <span>تحميل</span>
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              title="رفع واستعادة ملف بيانات محفوط سابقاً (JSON)"
              className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/50 px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm"
            >
              <Upload className={`w-3.5 h-3.5 text-amber-300 stroke-[2.5] ${isImporting ? 'animate-bounce' : ''}`} />
              <span>رفع بيانات</span>
            </button>

            <button
              onClick={triggerSeed}
              disabled={isResetting}
              title="إعادة تعيين البيانات الافتراضية للمؤتمر"
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline text-xs">ضبط</span>
            </button>

            <button 
              onClick={handleLogout}
              className="text-xs text-rose-300 hover:text-white font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              خروج
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => setInternalShowModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/40 text-white px-3 py-2 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-all backdrop-blur-sm shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
        >
          <Lock className="w-3.5 h-3.5 text-indigo-200" />
          <span>بوابة الخدام</span>
        </button>
      )}

      {/* Admin / Servant Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-sm bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-slate-100 overflow-hidden my-auto" dir="rtl">
            {/* Top Glowing Ambient Accents */}
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {isAdmin ? (
              /* Already Logged In Servant Management View */
              showManageAdmins ? (
                /* Manage Admin Accounts Sub-View */
                <div className="space-y-4 pt-1">
                  <button
                    onClick={() => setShowManageAdmins(false)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>رجوع</span>
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 mb-2 shadow-lg">
                      <Users className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-serif font-black text-white">إدارة حسابات الأدمن</h3>
                    <p className="text-xs text-slate-300 mt-1">أضف أو احذف حسابات دخول للخدام</p>
                  </div>

                  {/* Existing accounts list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {adminUsersList.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">جارٍ التحميل...</p>
                    ) : (
                      adminUsersList.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5"
                        >
                          <span className="text-xs font-bold text-white">{u.username}</span>
                          <button
                            onClick={() => handleDeleteAdmin(u)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add new account form */}
                  <form onSubmit={handleAddAdmin} className="space-y-2.5 pt-3 border-t border-white/10">
                    <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>إضافة حساب جديد</span>
                    </p>
                    <input
                      type="text"
                      value={newAdminUsername}
                      onChange={(e) => {
                        setNewAdminUsername(e.target.value);
                        setManageError("");
                      }}
                      placeholder="اسم المستخدم الجديد"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/80 text-white text-right text-xs font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500"
                    />
                    <input
                      type="text"
                      value={newAdminPassword}
                      onChange={(e) => {
                        setNewAdminPassword(e.target.value);
                        setManageError("");
                      }}
                      placeholder="كلمة المرور اللي هتحطها له"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/80 text-white text-right font-mono text-xs font-bold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-500"
                    />
                    {manageError && (
                      <p className="text-xs text-rose-300 text-center font-bold bg-rose-500/15 border border-rose-500/30 py-2 rounded-xl">
                        {manageError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isAddingAdmin}
                      className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-60 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isAddingAdmin ? "جارٍ الإضافة..." : "إضافة الحساب"}</span>
                    </button>
                  </form>
                </div>
              ) : (
              <div className="space-y-4 pt-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-2 shadow-lg">
                    <ShieldAlert className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    وضع الخادم مفعل 🔑
                  </span>
                  <h3 className="text-lg font-serif font-black text-white mt-1">لوحة خادم المؤتمر</h3>
                  <p className="text-xs text-slate-300 mt-1">إدارة وتحميل واستعادة بيانات مؤتمر RefLect</p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => setShowManageAdmins(true)}
                    className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl hover:border-indigo-400 transition-all text-right cursor-pointer active:scale-98 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-indigo-200">إدارة حسابات الأدمن</div>
                        <div className="text-[10px] text-slate-400 font-medium">إضافة أو حذف حسابات دخول للخدام</div>
                      </div>
                    </div>
                    <span className="text-xs text-indigo-400 font-bold">👥</span>
                  </button>

                  {onExportData && (
                    <button
                      onClick={() => {
                        onExportData();
                        closeModal();
                      }}
                      className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 rounded-2xl hover:border-emerald-400 transition-all text-right cursor-pointer active:scale-98 shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                          <Download className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-emerald-200">تحميل بيانات المؤتمر (تصدير)</div>
                          <div className="text-[10px] text-slate-400 font-medium">حفظ نسخة احتياطية بصيغة JSON على جهازك</div>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold">تنزيل 📥</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      closeModal();
                      setTimeout(() => fileInputRef.current?.click(), 100);
                    }}
                    className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/30 rounded-2xl hover:border-amber-400 transition-all text-right cursor-pointer active:scale-98 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-200">رفع واستعادة بيانات محفوطة</div>
                        <div className="text-[10px] text-slate-400 font-medium">استرجاع ملف JSON تم تحميلة سابقاً</div>
                      </div>
                    </div>
                    <span className="text-xs text-amber-400 font-bold">رفع 📤</span>
                  </button>

                  <button
                    onClick={() => {
                      closeModal();
                      triggerSeed();
                    }}
                    className="w-full flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all text-right cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">إعادة ضبط البيانات الافتراضية</div>
                        <div className="text-[10px] text-slate-400">تحديث جداول وغرف المؤتمر</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      closeModal();
                    }}
                    className="w-full py-3 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold rounded-2xl text-xs transition-all cursor-pointer mt-3"
                  >
                    تسجيل الخروج من وضع الخادم 🚪
                  </button>
                </div>
              </div>
              )
            ) : (
              /* Servant Login View */
              <>
                {/* Header */}
                <div className="flex flex-col items-center text-center pt-1">
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 border border-indigo-300/30 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-100" />
                  </div>
                  <span className="text-[10px] font-black tracking-wider uppercase text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full mb-1">
                    دخول الخدام
                  </span>
                  <h3 className="text-lg font-serif font-black text-white">بوابة الخدام والمنظمين</h3>
                  <p className="text-xs text-slate-300/80 mt-1 max-w-xs leading-relaxed font-medium">
                    ادخل اسم المستخدم وكلمة المرور لتفعيل صلاحيات الخادم ورصد النقاط والبيانات.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>اسم المستخدم</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError("");
                      }}
                      placeholder="اسم المستخدم"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/80 text-white text-right text-xs sm:text-sm font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>كلمة المرور</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        placeholder="كلمة المرور"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-950/80 text-white text-right font-mono font-bold text-xs sm:text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {error && (
                      <p className="text-xs text-rose-300 mt-2 text-center font-bold bg-rose-500/15 border border-rose-500/30 py-2 rounded-xl">
                        {error}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2 mt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 py-2.5 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-indigo-200" />
                      <span>{isLoggingIn ? "جارٍ التحقق..." : "دخول الخادم"}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

