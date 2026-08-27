import React, { useState, useEffect, useRef } from "react";
import { History, User, Clock, Trash2, Download, Upload } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, getDocs, writeBatch, doc, addDoc } from "firebase/firestore";
import { ActivityLogEntry } from "../types";

// شاشة سجل النشاط - تظهر بس للمسؤول الأساسي (MinaRezk) عشان يتابع
// مين ضاف نقط أو عدّل أي حاجة في الموقع ومتى.
export default function ActivityLogView() {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "activityLog"),
      (snap) => {
        const list: ActivityLogEntry[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as ActivityLogEntry));
        // نرتب في المتصفح بدل ما نطلب من قاعدة البيانات ترتب - نفس الطريقة
        // المستخدمة في باقي الموقع، عشان أي سجل فيه أي اختلاف بسيط في شكل
        // التاريخ يفضل ظاهر بدل ما يختفي بصمت.
        list.sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tb - ta;
        });
        setEntries(list.slice(0, 200));
        setLoading(false);
      },
      (err) => {
        console.error("activityLog snapshot error", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
    } catch (e) {
      return ts;
    }
  };

  const handleDownloadLog = () => {
    const dataToExport = {
      exportedAt: new Date().toISOString(),
      entries
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `سجل-النشاط-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);
        const entriesToRestore: ActivityLogEntry[] = Array.isArray(parsed?.entries) ? parsed.entries : Array.isArray(parsed) ? parsed : [];

        if (entriesToRestore.length === 0) {
          alert("الملف ده مفيهوش سجل نشاط صالح للاستعادة.");
          return;
        }
        if (
          !window.confirm(
            `هيتم إضافة ${entriesToRestore.length} سجل من الملف ده لسجل النشاط الحالي (من غير ما يمسح الموجود). متأكد؟`
          )
        ) {
          return;
        }

        setIsRestoring(true);
        const chunkSize = 400;
        for (let i = 0; i < entriesToRestore.length; i += chunkSize) {
          const chunk = entriesToRestore.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach((entry) => {
            const { id, ...rest } = entry;
            const docRef = doc(collection(db, "activityLog"));
            batch.set(docRef, rest);
          });
          await batch.commit();
        }
        alert(`تمت استعادة ${entriesToRestore.length} سجل بنجاح! هتظهر تلقائي في القائمة.`);
      } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء قراءة أو استعادة الملف - تأكد إنه ملف سجل نشاط صحيح.");
      } finally {
        setIsRestoring(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleClearLog = async () => {
    if (!window.confirm("هيتم حذف كل سجل النشاط نهائياً. متأكد؟")) return;
    setIsClearing(true);
    try {
      const snap = await getDocs(collection(db, "activityLog"));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء مسح السجل.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-black text-white">سجل النشاط 📋</h3>
            <p className="text-[11px] text-slate-400">آخر {entries.length} حركة — مين عمل إيه وإمتى</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleRestoreFile}
            className="hidden"
          />
          <button
            onClick={handleDownloadLog}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل</span>
          </button>
          <button
            onClick={handleRestoreClick}
            disabled={isRestoring}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isRestoring ? "جارٍ الاستعادة..." : "استعادة"}</span>
          </button>
          <button
            onClick={handleClearLog}
            disabled={isClearing || entries.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-slate-400 text-xs py-10">جارٍ التحميل...</p>
      ) : entries.length === 0 ? (
        <div className="text-center text-slate-400 text-xs py-10 bg-white/5 rounded-2xl border border-white/10">
          لسه مفيش أي نشاط مسجل.
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-indigo-300">{entry.username}</span>
                  <span className="text-[10px] text-slate-500">•</span>
                  <span className="text-xs font-bold text-white">{entry.action}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{entry.details}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(entry.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
