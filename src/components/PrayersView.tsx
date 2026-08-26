import React, { useState, useEffect } from "react";
import { Sun, Flame, Moon, ChevronRight, BookOpen } from "lucide-react";
import { Prayer } from "../types";
import { db } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { seedPrayersIfEmpty } from "../lib/seedData";
import { INITIAL_PRAYERS } from "../lib/prayersData";

const PRAYER_ICONS: Record<string, any> = {
  prayer_prime: Sun,
  prayer_vespers: Flame,
  prayer_sleep: Moon
};

// Full static class strings per prayer (Tailwind's build-time scanner can't
// detect dynamically-interpolated class names like `bg-${color}-500`, so
// every combination is written out in full here instead).
const PRAYER_STYLES: Record<string, { badge: string; card: string; iconBox: string }> = {
  prayer_prime: {
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    card: "hover:border-amber-500/40",
    iconBox: "bg-amber-500/10 text-amber-400 border border-amber-500/30"
  },
  prayer_vespers: {
    badge: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
    card: "hover:border-orange-500/40",
    iconBox: "bg-orange-500/10 text-orange-400 border border-orange-500/30"
  },
  prayer_sleep: {
    badge: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
    card: "hover:border-indigo-500/40",
    iconBox: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
  }
};

const DEFAULT_STYLE = {
  badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
  card: "hover:border-amber-500/40",
  iconBox: "bg-amber-500/10 text-amber-400 border border-amber-500/30"
};

function renderSectionText(text: string) {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((para, idx) => {
    const trimmed = para.trim();
    const boldMatch = trimmed.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      return (
        <h5
          key={idx}
          className="text-sm sm:text-base font-serif font-black text-amber-300 mt-5 mb-2 first:mt-0 border-b border-amber-500/20 pb-1.5"
        >
          {boldMatch[1]}
        </h5>
      );
    }
    if (trimmed.startsWith("ثم يقول المُصلى") || trimmed.startsWith("ثم يقول المصلي") || trimmed.startsWith("ثم يُقال")) {
      return (
        <p key={idx} className="text-[11px] sm:text-xs text-indigo-300/80 italic my-2.5">
          {trimmed}
        </p>
      );
    }
    return (
      <p key={idx} className="text-sm sm:text-[15px] text-slate-200 leading-[2] my-2.5 text-justify">
        {trimmed}
      </p>
    );
  });
}

export default function PrayersView() {
  const [prayers, setPrayers] = useState<Prayer[]>(INITIAL_PRAYERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "prayers"),
      (snap) => {
        if (snap.empty) {
          seedPrayersIfEmpty();
          setPrayers(INITIAL_PRAYERS);
          return;
        }
        const data: Prayer[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() } as Prayer));
        data.sort((a, b) => a.order - b.order);
        setPrayers(data);
      },
      (err) => {
        console.warn("prayers snapshot error", err?.message || err);
        setPrayers(INITIAL_PRAYERS);
      }
    );
    return () => unsub();
  }, []);

  const selected = prayers.find((p) => p.id === selectedId);

  if (selected) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-white">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span>الرجوع لكل الصلوات</span>
        </button>

        <div className="text-center space-y-2 border-b border-white/10 pb-6">
          <div className={`inline-flex p-4 rounded-full mb-2 ${(PRAYER_STYLES[selected.id] || DEFAULT_STYLE).badge}`}>
            {(() => {
              const Icon = PRAYER_ICONS[selected.id] || BookOpen;
              return <Icon className="w-8 h-8" />;
            })()}
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-black">{selected.title}</h3>
          {selected.subtitle && <p className="text-slate-400 text-xs px-4">{selected.subtitle}</p>}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6">
          {selected.sections.map((section) => (
            <div key={section.id} className="mb-2">
              {renderSectionText(section.text)}
            </div>
          ))}
        </div>

        <button
          onClick={() => setSelectedId(null)}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
          <span>الرجوع لكل الصلوات</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in text-white">
      <div className="text-center space-y-2 pb-2">
        <h3 className="text-2xl sm:text-3xl font-serif font-black">الصلوات</h3>
        <p className="text-slate-400 text-xs">صلوات الأجبية المقدسة — اختر الصلاة</p>
      </div>

      <div className="space-y-3">
        {prayers.map((p) => {
          const Icon = PRAYER_ICONS[p.id] || BookOpen;
          const style = PRAYER_STYLES[p.id] || DEFAULT_STYLE;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full text-right flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group ${style.card}`}
            >
              <div className={`p-3 rounded-2xl shrink-0 group-hover:scale-105 transition-transform ${style.iconBox}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif font-black text-base sm:text-lg text-white">{p.title}</p>
                {p.subtitle && <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">{p.subtitle}</p>}
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 shrink-0 rotate-180" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
