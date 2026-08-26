import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Music, 
  BookOpen, 
  Trophy, 
  Home, 
  Lock, 
  Menu, 
  X,
  Sparkles,
  Heart,
  Fingerprint,
  Aperture,
  Download,
  Upload,
  RefreshCw,
  ShieldAlert,
  Sun,
  BedDouble
} from "lucide-react";
import { db, auth } from "./lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import IntroScreen from "./components/IntroScreen";
import PrayersView from "./components/PrayersView";
import { 
  seedDatabaseIfEmpty, 
  resetAllTeamScoresToZero, 
  seedConferenceGroupsIfEmpty,
  importDatabaseJSON,
  syncIsoScheduleAndLessons,
  DEFAULT_TEAMS, 
  INITIAL_SCHEDULE, 
  INITIAL_SONGS, 
  INITIAL_ALHAN,
  INITIAL_LESSONS, 
  INITIAL_ROOMS, 
  INITIAL_SCORE_LOGS,
  INITIAL_CONFERENCE_GROUPS
} from "./lib/seedData";

// Components
const SoccerBall = (props: any) => (
  <span className={props.className} style={{ display: 'inline-flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', lineHeight: 1 }}>⚽</span>
);

import FingerprintLogo from "./components/FingerprintLogo";
import AdminControls from "./components/AdminControls";
import ScheduleView from "./components/ScheduleView";
import HymnsView from "./components/HymnsView";
import AlhanView from "./components/AlhanView";
import LessonsView from "./components/LessonsView";
import ScoreboardView from "./components/ScoreboardView";
import RoomsView from "./components/RoomsView";
import ConferenceGroupsView from "./components/ConferenceGroupsView";
import InstallPrompt from "./components/InstallPrompt";
import NotificationManager from "./components/NotificationManager";
import HomeView from "./components/HomeView";
import { Trophy3D, SoccerBall3D, Calendar3D, Music3D, Book3D, Home3D, CopticCross3D } from "./components/ThreeDIcons";
import { Users } from "lucide-react";

// Types
import { Team, EventSchedule, Song, CopticHymn, Lesson, Room, ScoreLog, ConferenceGroup } from "./types";


export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [isAdmin, setIsAdminState] = useState<boolean>(() => {
    try {
      return localStorage.getItem("reflect_is_admin") === "true";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    // Source of truth for admin/write access is now the actual Firebase Auth
    // session (checked server-side by firestore.rules), not this local flag.
    // This keeps the UI in sync if the session expires or signs in elsewhere.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminState(!!user);
      try {
        if (user) {
          localStorage.setItem("reflect_is_admin", "true");
        } else {
          localStorage.removeItem("reflect_is_admin");
        }
      } catch (e) {
        console.error(e);
      }
    });
    return () => unsubscribe();
  }, []);

  const setIsAdmin = (val: boolean) => {
    setIsAdminState(val);
    try {
      if (val) {
        localStorage.setItem("reflect_is_admin", "true");
      } else {
        localStorage.removeItem("reflect_is_admin");
        signOut(auth).catch(() => {});
      }
    } catch (e) {
      console.error(e);
    }
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [forceOpenAdminModal, setForceOpenAdminModal] = useState<boolean>(false);

  // Firestore Data State
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [schedule, setSchedule] = useState<EventSchedule[]>(INITIAL_SCHEDULE);
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [alhan, setAlhan] = useState<CopticHymn[]>(INITIAL_ALHAN);
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [scoreLogs, setScoreLogs] = useState<ScoreLog[]>(INITIAL_SCORE_LOGS);
  const [conferenceGroups, setConferenceGroups] = useState<ConferenceGroup[]>(INITIAL_CONFERENCE_GROUPS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(false);

  const handleStartIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem("reflect_intro_seen", "true");
    } catch (e) {
      console.error(e);
    }
  };

  // Set up real-time snapshot listeners immediately and run seeding/migrations in the background
  useEffect(() => {
    let active = true;
    const unsubscribes: (() => void)[] = [];

    // Safety timeout to ensure loading spinner disappears quickly even if Firestore is slow or offline
    const safetyTimer = setTimeout(() => {
      if (active) {
        setIsLoading(false);
        setTeams(prev => prev.length ? prev : DEFAULT_TEAMS);
        setSchedule(prev => prev.length ? prev : INITIAL_SCHEDULE);
        setSongs(prev => prev.length ? prev : INITIAL_SONGS);
        setAlhan(prev => prev.length ? prev : INITIAL_ALHAN);
        setLessons(prev => prev.length ? prev : INITIAL_LESSONS);
        setRooms(prev => prev.length ? prev : INITIAL_ROOMS);
        setScoreLogs(prev => prev.length ? prev : INITIAL_SCORE_LOGS);
        setConferenceGroups(prev => prev.length ? prev : INITIAL_CONFERENCE_GROUPS);
      }
    }, 1200);

    // 1. Immediately set up Real-time listeners
    const unsubTeams = onSnapshot(
      collection(db, "teams"),
      (snapshot) => {
        if (!active) return;
        const teamsData: Team[] = [];
        snapshot.forEach((doc) => {
          teamsData.push({ id: doc.id, ...doc.data() } as Team);
        });
        setTeams(teamsData.length ? teamsData : DEFAULT_TEAMS);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore 'teams' snapshot note:", err?.message || err);
        if (active) {
          setTeams(prev => prev.length ? prev : DEFAULT_TEAMS);
          setIsLoading(false);
        }
      }
    );
    unsubscribes.push(unsubTeams);

    const unsubSched = onSnapshot(
      collection(db, "schedule"),
      (snapshot) => {
        if (!active) return;
        const scheduleData: EventSchedule[] = [];
        snapshot.forEach((doc) => {
          scheduleData.push({ id: doc.id, ...doc.data() } as EventSchedule);
        });
        setSchedule(scheduleData.length ? scheduleData : INITIAL_SCHEDULE);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore 'schedule' snapshot note:", err?.message || err);
        if (active) {
          setSchedule(prev => prev.length ? prev : INITIAL_SCHEDULE);
          setIsLoading(false);
        }
      }
    );
    unsubscribes.push(unsubSched);

    const unsubSongs = onSnapshot(
      collection(db, "songs"),
      (snapshot) => {
        if (!active) return;
        const songsData: Song[] = [];
        snapshot.forEach((doc) => {
          songsData.push({ id: doc.id, ...doc.data() } as Song);
        });
        setSongs(songsData.length ? songsData : INITIAL_SONGS);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore 'songs' snapshot note:", err?.message || err);
        if (active) {
          setSongs(prev => prev.length ? prev : INITIAL_SONGS);
          setIsLoading(false);
        }
      }
    );
    unsubscribes.push(unsubSongs);

    const unsubAlhan = onSnapshot(
      collection(db, "alhan"),
      (snapshot) => {
        if (!active) return;
        const alhanData: CopticHymn[] = [];
        snapshot.forEach((doc) => {
          alhanData.push({ id: doc.id, ...doc.data() } as CopticHymn);
        });
        setAlhan(alhanData.length ? alhanData : INITIAL_ALHAN);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore 'alhan' snapshot note:", err?.message || err);
        if (active) {
          setAlhan(prev => prev.length ? prev : INITIAL_ALHAN);
          setIsLoading(false);
        }
      }
    );
    unsubscribes.push(unsubAlhan);

    const unsubLessons = onSnapshot(
      collection(db, "lessons"),
      (snapshot) => {
        if (!active) return;
        const lessonsData: Lesson[] = [];
        snapshot.forEach((doc) => {
          lessonsData.push({ id: doc.id, ...doc.data() } as Lesson);
        });
        setLessons(lessonsData.length ? lessonsData : INITIAL_LESSONS);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore 'lessons' snapshot note:", err?.message || err);
        if (active) {
          setLessons(prev => prev.length ? prev : INITIAL_LESSONS);
          setIsLoading(false);
        }
      }
    );
    unsubscribes.push(unsubLessons);

    const unsubRooms = onSnapshot(
      collection(db, "rooms"),
      (snapshot) => {
        if (!active) return;
        const roomsData: Room[] = [];
        snapshot.forEach((doc) => {
          roomsData.push({ id: doc.id, ...doc.data() } as Room);
        });
        setRooms(roomsData.length ? roomsData : INITIAL_ROOMS);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore 'rooms' snapshot note:", err?.message || err);
        if (active) {
          setRooms(prev => prev.length ? prev : INITIAL_ROOMS);
          setIsLoading(false);
        }
      }
    );
    unsubscribes.push(unsubRooms);

    const unsubLogs = onSnapshot(
      collection(db, "scoreLogs"),
      (snapshot) => {
        if (!active) return;
        const logsData: ScoreLog[] = [];
        snapshot.forEach((doc) => {
          logsData.push({ id: doc.id, ...doc.data() } as ScoreLog);
        });
        setScoreLogs(logsData.length ? logsData : INITIAL_SCORE_LOGS);
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore 'scoreLogs' snapshot note:", err?.message || err);
        if (active) {
          setScoreLogs(prev => prev.length ? prev : INITIAL_SCORE_LOGS);
          setIsLoading(false);
        }
      }
    );
    unsubscribes.push(unsubLogs);

    const unsubConfGroups = onSnapshot(
      collection(db, "conferenceGroups"),
      (snapshot) => {
        if (!active) return;
        if (snapshot.empty) {
          seedConferenceGroupsIfEmpty();
          setConferenceGroups(INITIAL_CONFERENCE_GROUPS);
        } else {
          const groupsData: ConferenceGroup[] = [];
          snapshot.forEach((docSnap) => {
            groupsData.push({ id: docSnap.id, ...docSnap.data() } as ConferenceGroup);
          });
          groupsData.sort((a, b) => a.id.localeCompare(b.id));
          setConferenceGroups(groupsData);
        }
        setIsLoading(false);
      },
      (err) => {
        console.warn("Firestore 'conferenceGroups' snapshot note:", err?.message || err);
        if (active) {
          setConferenceGroups(prev => prev.length ? prev : INITIAL_CONFERENCE_GROUPS);
          setIsLoading(false);
        }
      }
    );
    unsubscribes.push(unsubConfGroups);

    // 2. Asynchronously run database seeding & self-healing migrations in the background
    const runBackgroundMigrations = async () => {
      if (!navigator.onLine) return;
      try {
        await seedDatabaseIfEmpty();
        await seedConferenceGroupsIfEmpty();
        await syncIsoScheduleAndLessons();

        // Automatic ISO songs and lessons synchronization is handled in syncIsoScheduleAndLessons()

      } catch (err) {
        console.warn("Background migration note:", err);
      }
    };

    runBackgroundMigrations();

    // 3. Fallback timeout safety: force isLoading = false after 800ms if still loading
    const timeoutId = setTimeout(() => {
      if (active) {
        setIsLoading(false);
        setTeams(prev => prev.length ? prev : DEFAULT_TEAMS);
        setSchedule(prev => prev.length ? prev : INITIAL_SCHEDULE);
        setSongs(prev => prev.length ? prev : INITIAL_SONGS);
        setAlhan(prev => prev.length ? prev : INITIAL_ALHAN);
        setLessons(prev => prev.length ? prev : INITIAL_LESSONS);
        setRooms(prev => prev.length ? prev : INITIAL_ROOMS);
        setScoreLogs(prev => prev.length ? prev : INITIAL_SCORE_LOGS);
      }
    }, 800);

    return () => {
      active = false;
      clearTimeout(timeoutId);
      unsubscribes.forEach((unsub) => {
        try { unsub(); } catch { /* ignore */ }
      });
    };
  }, []);

  const handleRefreshData = () => {
    // Just trigger a state refresh, or snapshots will auto handle it
    console.log("Data refreshed successfully via Firebase snapshots.");
  };

  const handleExportData = () => {
    const dataToExport = {
      timestamp: new Date().toISOString(),
      teams,
      schedule,
      songs,
      alhan,
      lessons,
      rooms,
      scoreLogs,
      conferenceGroups
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iso-conference-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (jsonData: any) => {
    try {
      const count = await importDatabaseJSON(jsonData);
      alert(`تمت استعادة وتحديث ${count} مفردة من بيانات المؤتمر بنجاح! 🚀`);
    } catch (err: any) {
      console.error("Import error:", err);
      alert(err?.message || "حدث خطأ أثناء استعادة البيانات!");
    }
  };

  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsedData = JSON.parse(text);

        if (!window.confirm("هل أنت متأكد من رفع واستعادة بيانات المؤتمر من هذا الملف؟ سيتم دمج وتحديث الجداول بالكامل.")) {
          return;
        }

        await handleImportData(parsedData);
        setIsMobileMenuOpen(false);
      } catch (err: any) {
        console.error("Mobile import error:", err);
        alert(err?.message || "حدث خطأ أثناء قراءة ملف البيانات! تأكد من اختيار ملف JSON صحيح.");
      } finally {
        if (mobileFileInputRef.current) mobileFileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  // Nav Links
  const navItems = [
    { id: "home", label: "الرئيسية", shortLabel: "الرئيسية", icon: Home },
    { id: "prayers", label: "الصلوات", shortLabel: "الصلوات", icon: Sun },
    { id: "schedule", label: "البرنامج والجدول", shortLabel: "البرنامج", icon: Calendar3D },
    { id: "alhan", label: "الألحان القبطية", shortLabel: "الألحان", icon: CopticCross3D },
    { id: "songs", label: "ترانيم مؤتمر ISO", shortLabel: "الترانيم", icon: Music3D },
    { id: "lessons", label: "الشروحات والدراسات", shortLabel: "الدراسات", icon: Book3D },
    { id: "groups", label: "مجموعات المؤتمر", shortLabel: "الجروبات", icon: Users },
    { id: "rooms", label: "غرف الإقامة", shortLabel: "الغرف", icon: BedDouble },
    { id: "scoreboard", label: "السكور بورد", shortLabel: "السكور", icon: Trophy },
  ];

  if (showIntro) {
    return (
      <>
        <div className="fixed top-0 inset-x-0 z-[100]">
          <InstallPrompt />
        </div>
        <IntroScreen onStart={handleStartIntro} />
      </>
    );
  }

  return (
    <div className="text-slate-100 transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white pb-16 lg:pb-0" dir="rtl">
      
      {/* PWA Install Promotion Banner & Guide */}
      <div className="fixed top-0 inset-x-0 z-[100]">
        <InstallPrompt />
      </div>

      {/* Automatic Voice and Sound Alerts for schedule */}
      <NotificationManager schedule={schedule} />

      {/* Dynamic Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2 sm:gap-4 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="bg-white/10 text-indigo-300 p-2 border border-white/20 rounded-xl shadow-lg flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0">
              <img 
                src="https://img.icons8.com/ios/150/a78bfa/fingerprint.png" 
                alt="Fingerprint Logo" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain animate-pulse" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-xl md:text-2xl font-serif font-black tracking-tight text-white block leading-none truncate">
                مؤتمر ISO 2026
              </span>
              <span className="text-[9px] sm:text-[11px] font-bold text-indigo-300 block mt-1 truncate max-w-[180px] sm:max-w-none">
                كنيسة الشهيد العظيم مارمينا
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer rounded-full border ${
                    isActive 
                      ? "bg-indigo-500/20 text-white border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                      : "text-slate-300 border-transparent hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'scale-110' : 'opacity-70 group-hover:opacity-100'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Admin Switch Port */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <AdminControls 
              isAdmin={isAdmin} 
              setIsAdmin={setIsAdmin} 
              onRefreshData={handleRefreshData} 
              onExportData={handleExportData}
              onImportData={handleImportData}
              forceOpenModal={forceOpenAdminModal}
              onModalClose={() => setForceOpenAdminModal(false)}
            />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 border border-white/20 text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer rounded-lg shrink-0 transition-colors"
              title="كل الأقسام"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 px-4 py-4 space-y-3 absolute w-full left-0 right-0 z-50 shadow-2xl animate-fade-in" dir="rtl">
            {/* Hidden Mobile JSON File Selector */}
            <input
              type="file"
              ref={mobileFileInputRef}
              accept=".json"
              onChange={handleMobileFileChange}
              className="hidden"
            />

            {isAdmin ? (
              <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>وضع الخادم نشط 🔑</span>
                  </span>
                  <button
                    onClick={() => {
                      signOut(auth).catch((err) => console.error("Sign out error", err));
                      setIsAdmin(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-300 hover:text-white font-bold bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
                  >
                    تسجيل الخروج 🚪
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  <button
                    onClick={() => {
                      handleExportData();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between py-2.5 px-3.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-emerald-300 stroke-[2.5]" />
                      <span>تحميل بيانات المؤتمر (نسخة احتياطية)</span>
                    </div>
                    <span className="text-emerald-400">📥</span>
                  </button>

                  <button
                    onClick={() => {
                      mobileFileInputRef.current?.click();
                    }}
                    className="w-full flex items-center justify-between py-2.5 px-3.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4 text-amber-300 stroke-[2.5]" />
                      <span>رفع واستعادة ملف بيانات (JSON)</span>
                    </div>
                    <span className="text-amber-400">📤</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setForceOpenAdminModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full p-3.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/40 hover:border-indigo-400 rounded-2xl flex items-center justify-between text-white font-bold transition-all shadow-md active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-indigo-200">بوابة الخدام والمنظمين</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">تسجيل الدخول لتعديل السكور ورصد النقاط والبيانات</div>
                  </div>
                </div>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl font-bold shrink-0">
                  دخول 🔑
                </span>
              </button>
            )}

            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-right transition-all rounded-xl border ${
                      isActive 
                        ? "bg-indigo-500/20 text-white border-indigo-400/30" 
                        : "text-slate-300 border-transparent hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className={`w-6 h-6 transition-all duration-200 ${isActive ? 'scale-110' : 'opacity-70'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Premium iOS/Android Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-start gap-1 py-1.5 px-2 overflow-x-auto scrollbar-none pb-safe-bottom shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex flex-col items-center justify-center min-w-[62px] flex-shrink-0 py-1 px-1.5 gap-0.5 transition-all duration-300 cursor-pointer rounded-xl ${
                isActive 
                  ? "text-indigo-300 font-bold bg-indigo-500/15 border border-indigo-400/30 scale-102" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <div className={`p-1 rounded-lg transition-all ${
                isActive ? 'text-indigo-300' : 'text-slate-400'
              }`}>
                <Icon className="w-5 h-5 transition-all duration-200" />
              </div>
              <span className="text-[10px] tracking-tight text-center whitespace-nowrap font-bold">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Arena */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 min-h-[calc(100vh-180px)] pb-24 lg:pb-10 relative z-0">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
            <div className="text-center">
              <h4 className="text-sm font-bold text-white">جاري تحميل بيانات مؤتمر ISO...</h4>
              <p className="text-xs text-indigo-300/70 mt-1">يتم الآن تهيئة السكور، الغرف، ومواد الشرح.</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === "home" && (
              <HomeView 
                teams={teams} 
                schedule={schedule} 
                songs={songs}
                alhan={alhan}
                lessons={lessons}
                rooms={rooms}
                conferenceGroups={conferenceGroups}
                setActiveTab={setActiveTab} 
              />
            )}
            {activeTab === "prayers" && (
              <PrayersView />
            )}
            {activeTab === "schedule" && (
              <ScheduleView 
                schedule={schedule} 
                teams={teams}
                isAdmin={isAdmin} 
                onRefreshData={handleRefreshData} 
              />
            )}
            {activeTab === "alhan" && (
              <AlhanView 
                alhan={alhan} 
                isAdmin={isAdmin} 
                onRefreshData={handleRefreshData} 
              />
            )}
            {activeTab === "songs" && (
              <HymnsView 
                songs={songs} 
                isAdmin={isAdmin} 
                onRefreshData={handleRefreshData} 
              />
            )}
            {activeTab === "lessons" && (
              <LessonsView 
                lessons={lessons} 
                isAdmin={isAdmin} 
                setIsAdmin={setIsAdmin}
                onRefreshData={handleRefreshData} 
                conferenceGroups={conferenceGroups}
              />
            )}
            {activeTab === "groups" && (
              <ConferenceGroupsView 
                groups={conferenceGroups} 
                isAdmin={isAdmin} 
                onRefreshData={handleRefreshData} 
              />
            )}
            {activeTab === "rooms" && (
              <RoomsView 
                rooms={rooms} 
                isAdmin={isAdmin} 
                onRefreshData={handleRefreshData} 
              />
            )}
            {activeTab === "scoreboard" && (
              <ScoreboardView 
                teams={teams} 
                scoreLogs={scoreLogs}
                isAdmin={isAdmin} 
                onRefreshData={handleRefreshData} 
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
