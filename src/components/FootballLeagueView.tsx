import React, { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  CalendarDays, 
  Play, 
  CheckCircle2, 
  Award,
  Shield,
  Flame,
  Activity,
  Eye,
  Check,
  Star,
  Sparkles,
  Crown,
  Save,
  RefreshCw,
  GitBranch,
  Users,
  Settings2,
  Zap,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Team, FootballMatch, FootballMatchEvent, FootballAwards, TournamentConfig } from "../types";
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  setDoc,
  onSnapshot,
  writeBatch
} from "firebase/firestore";
import { SoccerBall3D } from "./ThreeDIcons";

interface FootballLeagueViewProps {
  teams: Team[];
  isAdmin: boolean;
}

const DEFAULT_MATCHES: FootballMatch[] = [
  {
    id: "match1",
    team1Id: "team1",
    team2Id: "team2",
    team1Score: 2,
    team2Score: 1,
    status: "completed",
    time: "اليوم الأول - 04:30 PM",
    round: "الجولة الأولى",
    stage: "league",
    manOfTheMatch: "كيرلس وفيق",
    manOfTheMatchTeamId: "team1",
    manOfTheMatchNotes: "سجل هدف التقدم وصنع فرصتين حاسمتين",
    events: [
      { id: "e1", type: "goal", teamId: "team1", playerName: "كيرلس وفيق", minute: "12'" },
      { id: "e2", type: "goal", teamId: "team1", playerName: "ماريو عريان", minute: "34'" },
      { id: "e3", type: "assist", teamId: "team1", playerName: "كيرلس وفيق", minute: "34'" },
      { id: "e4", type: "goal", teamId: "team2", playerName: "مينا مجدي", minute: "41'" },
      { id: "e5", type: "yellow_card", teamId: "team2", playerName: "جوني أديب", minute: "25'" }
    ]
  },
  {
    id: "match2",
    team1Id: "team3",
    team2Id: "team4",
    team1Score: 0,
    team2Score: 2,
    status: "completed",
    time: "اليوم الأول - 05:30 PM",
    round: "الجولة الأولى",
    stage: "league",
    manOfTheMatch: "يوسف سمير",
    manOfTheMatchTeamId: "team4",
    manOfTheMatchNotes: "سجل هدفي الفوز بمجهود فردي مميز",
    events: [
      { id: "e6", type: "goal", teamId: "team4", playerName: "يوسف سمير", minute: "18'" },
      { id: "e7", type: "goal", teamId: "team4", playerName: "يوسف سمير", minute: "52'" },
      { id: "e8", type: "yellow_card", teamId: "team3", playerName: "باسم سعيد", minute: "30'" },
      { id: "e9", type: "red_card", teamId: "team3", playerName: "ناجي وليم", minute: "58'" }
    ]
  },
  {
    id: "match3",
    team1Id: "team1",
    team2Id: "team3",
    team1Score: 1,
    team2Score: 1,
    status: "completed",
    time: "اليوم الثاني - 04:30 PM",
    round: "الجولة الثانية",
    stage: "league",
    manOfTheMatch: "باسم سعيد",
    manOfTheMatchTeamId: "team3",
    manOfTheMatchNotes: "أحرز هدف التعادل القاتل ودافع ببراعة",
    events: [
      { id: "e10", type: "goal", teamId: "team1", playerName: "ماريو عريان", minute: "10'" },
      { id: "e11", type: "goal", teamId: "team3", playerName: "باسم سعيد", minute: "44'" }
    ]
  }
];

const DEFAULT_AWARDS: FootballAwards = {
  bestPlayer: "يوسف سمير",
  bestPlayerTeamId: "team4",
  bestGoalkeeper: "مارك ميخائيل",
  bestGoalkeeperTeamId: "team1",
  fairPlayTeamId: "team2"
};

const DEFAULT_TOURNAMENT_CONFIG: TournamentConfig = {
  format: "league",
  name: "دوري مؤتمر ISO الكروي",
  autoScheduleGenerated: false
};

export default function FootballLeagueView({ teams: propTeams, isAdmin }: FootballLeagueViewProps) {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [awards, setAwards] = useState<FootballAwards>(DEFAULT_AWARDS);
  const [config, setConfig] = useState<TournamentConfig>(DEFAULT_TOURNAMENT_CONFIG);
  const [customTeams, setCustomTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Navigation Tabs
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "scorers" | "cards" | "awards" | "settings">("standings");

  // Modals & UI states
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [isEditing, setIsEditing] = useState<FootballMatch | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<FootballMatch | null>(null);
  const [showEditAwardsModal, setShowEditAwardsModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  // Match Form states
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [team1Score, setTeam1Score] = useState("0");
  const [team2Score, setTeam2Score] = useState("0");
  const [status, setStatus] = useState<"upcoming" | "completed">("upcoming");
  const [time, setTime] = useState("");
  const [round, setRound] = useState("الجولة الأولى");
  const [stage, setStage] = useState<"league" | "knockout">("league");
  const [matchEvents, setMatchEvents] = useState<FootballMatchEvent[]>([]);

  // Man of the Match states
  const [manOfTheMatch, setManOfTheMatch] = useState("");
  const [manOfTheMatchTeamId, setManOfTheMatchTeamId] = useState("");
  const [manOfTheMatchNotes, setManOfTheMatchNotes] = useState("");

  // Edit Awards Form states
  const [editBestPlayer, setEditBestPlayer] = useState("");
  const [editBestPlayerTeamId, setEditBestPlayerTeamId] = useState("");
  const [editBestGoalkeeper, setEditBestGoalkeeper] = useState("");
  const [editBestGoalkeeperTeamId, setEditBestGoalkeeperTeamId] = useState("");
  const [editFairPlayTeamId, setEditFairPlayTeamId] = useState("");

  // Event Input Form states
  const [newEventPlayer, setNewEventPlayer] = useState("");
  const [newEventTeamId, setNewEventTeamId] = useState("");
  const [newEventType, setNewEventType] = useState<"goal" | "assist" | "yellow_card" | "red_card">("goal");
  const [newEventMinute, setNewEventMinute] = useState("");

  // Add/Edit Custom Team states
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogo, setNewTeamLogo] = useState("⚽");
  const [newTeamColor, setNewTeamColor] = useState("from-indigo-500 to-purple-600");

  // Effective Teams (combines prop teams or custom teams)
  const allTeams = useMemo(() => {
    if (customTeams.length > 0) return customTeams;
    return propTeams;
  }, [propTeams, customTeams]);

  // Load Firestore Data
  useEffect(() => {
    let active = true;

    // Matches listener
    const unsubMatches = onSnapshot(
      collection(db, "footballMatches"),
      (snapshot) => {
        if (!active) return;
        if (snapshot.empty) {
          setMatches(DEFAULT_MATCHES);
        } else {
          const list: FootballMatch[] = [];
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() } as FootballMatch);
          });
          setMatches(list);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Firestore footballMatches note:", err);
        if (active) {
          setMatches(DEFAULT_MATCHES);
          setIsLoading(false);
        }
      }
    );

    // Awards listener
    const unsubAwards = onSnapshot(
      doc(db, "footballAwards", "main"),
      (docSnap) => {
        if (!active) return;
        if (docSnap.exists()) {
          setAwards(docSnap.data() as FootballAwards);
        } else {
          setAwards(DEFAULT_AWARDS);
        }
      },
      () => {
        if (active) setAwards(DEFAULT_AWARDS);
      }
    );

    // Tournament Config listener
    const unsubConfig = onSnapshot(
      doc(db, "footballTournament", "config"),
      (docSnap) => {
        if (!active) return;
        if (docSnap.exists()) {
          setConfig(docSnap.data() as TournamentConfig);
        } else {
          setConfig(DEFAULT_TOURNAMENT_CONFIG);
        }
      },
      () => {
        if (active) setConfig(DEFAULT_TOURNAMENT_CONFIG);
      }
    );

    // Custom Football Teams listener
    const unsubCustomTeams = onSnapshot(
      collection(db, "footballTeams"),
      (snapshot) => {
        if (!active) return;
        if (!snapshot.empty) {
          const tList: Team[] = [];
          snapshot.forEach(docSnap => {
            tList.push({ id: docSnap.id, ...docSnap.data() } as Team);
          });
          setCustomTeams(tList);
        }
      },
      () => { /* fallback to default propTeams */ }
    );

    return () => {
      active = false;
      unsubMatches();
      unsubAwards();
      unsubConfig();
      unsubCustomTeams();
    };
  }, []);

  // Sync selected match if matches list updates
  useEffect(() => {
    if (selectedMatch) {
      const updated = matches.find(m => m.id === selectedMatch.id);
      if (updated) setSelectedMatch(updated);
    }
  }, [matches]);

  // Default team selections
  useEffect(() => {
    if (allTeams.length >= 2) {
      if (!team1Id) setTeam1Id(allTeams[0].id);
      if (!team2Id) setTeam2Id(allTeams[1].id);
    }
  }, [allTeams]);

  // Recalculate League Standings (Win = 3 pts, Draw = 1 pt each)
  const standings = useMemo(() => {
    return allTeams.map((team) => {
      let played = 0;
      let wins = 0;
      let draws = 0;
      let losses = 0;
      let gf = 0;
      let ga = 0;

      matches.forEach((match) => {
        if (match.status !== "completed") return;
        if (match.stage === "knockout") return; // Knockout matches don't affect league table

        const isTeam1 = match.team1Id === team.id;
        const isTeam2 = match.team2Id === team.id;

        if (isTeam1) {
          played += 1;
          gf += match.team1Score;
          ga += match.team2Score;
          if (match.team1Score > match.team2Score) wins += 1;
          else if (match.team1Score === match.team2Score) draws += 1;
          else losses += 1;
        } else if (isTeam2) {
          played += 1;
          gf += match.team2Score;
          ga += match.team1Score;
          if (match.team2Score > match.team1Score) wins += 1;
          else if (match.team2Score === match.team1Score) draws += 1;
          else losses += 1;
        }
      });

      const gd = gf - ga;
      const points = wins * 3 + draws * 1;

      return {
        ...team,
        played,
        wins,
        draws,
        losses,
        gd,
        gf,
        ga,
        points
      };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });
  }, [allTeams, matches]);

  // Top Scorers list
  const topScorers = useMemo(() => {
    const scorerMap: { [key: string]: { name: string; teamId: string; goals: number } } = {};

    matches.forEach(match => {
      if (!match.events) return;
      match.events.forEach(ev => {
        if (ev.type === "goal") {
          const key = `${ev.playerName.trim()}_${ev.teamId}`;
          if (!scorerMap[key]) {
            scorerMap[key] = { name: ev.playerName.trim(), teamId: ev.teamId, goals: 0 };
          }
          scorerMap[key].goals += 1;
        }
      });
    });

    return Object.values(scorerMap).sort((a, b) => b.goals - a.goals);
  }, [matches]);

  // Top Assists list
  const topAssists = useMemo(() => {
    const assistMap: { [key: string]: { name: string; teamId: string; assists: number } } = {};

    matches.forEach(match => {
      if (!match.events) return;
      match.events.forEach(ev => {
        if (ev.type === "assist") {
          const key = `${ev.playerName.trim()}_${ev.teamId}`;
          if (!assistMap[key]) {
            assistMap[key] = { name: ev.playerName.trim(), teamId: ev.teamId, assists: 0 };
          }
          assistMap[key].assists += 1;
        }
      });
    });

    return Object.values(assistMap).sort((a, b) => b.assists - a.assists);
  }, [matches]);

  // Discipline & Cards list
  const disciplineList = useMemo(() => {
    const cardMap: { [key: string]: { name: string; teamId: string; yellow: number; red: number } } = {};

    matches.forEach(match => {
      if (!match.events) return;
      match.events.forEach(ev => {
        if (ev.type === "yellow_card" || ev.type === "red_card") {
          const key = `${ev.playerName.trim()}_${ev.teamId}`;
          if (!cardMap[key]) {
            cardMap[key] = { name: ev.playerName.trim(), teamId: ev.teamId, yellow: 0, red: 0 };
          }
          if (ev.type === "yellow_card") cardMap[key].yellow += 1;
          if (ev.type === "red_card") cardMap[key].red += 1;
        }
      });
    });

    return Object.values(cardMap).sort((a, b) => (b.red * 3 + b.yellow) - (a.red * 3 + a.yellow));
  }, [matches]);

  // Man of the Match Leaderboard
  const motmLeaderboard = useMemo(() => {
    const map: { [key: string]: { name: string; teamId: string; count: number; matches: string[] } } = {};
    matches.forEach(m => {
      if (m.manOfTheMatch && m.manOfTheMatch.trim()) {
        const key = `${m.manOfTheMatch.trim()}_${m.manOfTheMatchTeamId || ''}`;
        if (!map[key]) {
          map[key] = {
            name: m.manOfTheMatch.trim(),
            teamId: m.manOfTheMatchTeamId || m.team1Id,
            count: 0,
            matches: []
          };
        }
        map[key].count += 1;
        map[key].matches.push(m.round || m.time);
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [matches]);

  // Form Reset
  const resetForm = () => {
    if (allTeams.length >= 2) {
      setTeam1Id(allTeams[0].id);
      setTeam2Id(allTeams[1].id);
      setNewEventTeamId(allTeams[0].id);
      setManOfTheMatchTeamId(allTeams[0].id);
    }
    setTeam1Score("0");
    setTeam2Score("0");
    setStatus("upcoming");
    setTime("");
    setRound("الجولة الأولى");
    setStage("league");
    setMatchEvents([]);
    setManOfTheMatch("");
    setManOfTheMatchNotes("");
    setIsEditing(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddMatch(true);
  };

  const handleOpenEdit = (match: FootballMatch) => {
    setTeam1Id(match.team1Id);
    setTeam2Id(match.team2Id);
    setTeam1Score(String(match.team1Score));
    setTeam2Score(String(match.team2Score));
    setStatus(match.status);
    setTime(match.time);
    setRound(match.round);
    setStage(match.stage || "league");
    setMatchEvents(match.events || []);
    setNewEventTeamId(match.team1Id);
    setManOfTheMatch(match.manOfTheMatch || "");
    setManOfTheMatchTeamId(match.manOfTheMatchTeamId || match.team1Id);
    setManOfTheMatchNotes(match.manOfTheMatchNotes || "");
    setIsEditing(match);
    setShowAddMatch(true);
  };

  const handleOpenEditAwards = () => {
    setEditBestPlayer(awards.bestPlayer || "");
    setEditBestPlayerTeamId(awards.bestPlayerTeamId || (allTeams[0]?.id || ""));
    setEditBestGoalkeeper(awards.bestGoalkeeper || "");
    setEditBestGoalkeeperTeamId(awards.bestGoalkeeperTeamId || (allTeams[0]?.id || ""));
    setEditFairPlayTeamId(awards.fairPlayTeamId || (allTeams[0]?.id || ""));
    setShowEditAwardsModal(true);
  };

  const handleSaveAwards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const payload: FootballAwards = {
        bestPlayer: editBestPlayer.trim(),
        bestPlayerTeamId: editBestPlayerTeamId,
        bestGoalkeeper: editBestGoalkeeper.trim(),
        bestGoalkeeperTeamId: editBestGoalkeeperTeamId,
        fairPlayTeamId: editFairPlayTeamId
      };
      await setDoc(doc(db, "footballAwards", "main"), payload, { merge: true });
      setAwards(payload);
      setShowEditAwardsModal(false);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ لوحة الشرف والجوائز.");
    }
  };

  // Switch Tournament Format Mode (League / Knockout / Hybrid)
  const handleFormatChange = async (newFormat: 'league' | 'knockout' | 'hybrid') => {
    if (!isAdmin) return;
    try {
      const updatedConfig: TournamentConfig = {
        ...config,
        format: newFormat
      };
      await setDoc(doc(db, "footballTournament", "config"), updatedConfig, { merge: true });
      setConfig(updatedConfig);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تغيير نظام البطولة.");
    }
  };

  // Winner Tournament Maker: Auto-generate Fixtures (Round Robin or Knockout Bracket)
  const handleAutoGenerateSchedule = async () => {
    if (!isAdmin) return;
    if (allTeams.length < 2) {
      alert("الرجاء التأكد من وجود فريقين على الأقل لتوليد جدول المباريات!");
      return;
    }

    const confirmText = config.format === "knockout" 
      ? "هل أنت متأكد من إنشاء شجرة تصفيات خروج المغلوب تلقائياً؟ سيتم إعادة هيكلة مباريات التصفيات."
      : "هل أنت متأكد من توليد جدول الدوري التلقائي (Round Robin) بين جميع الفرق؟";

    if (!window.confirm(confirmText)) return;

    try {
      const batch = writeBatch(db);

      if (config.format === "knockout") {
        // Generate Knockout Bracket
        // Example: Semi Finals -> Final
        const semi1Ref = doc(collection(db, "footballMatches"));
        const semi2Ref = doc(collection(db, "footballMatches"));
        const finalRef = doc(collection(db, "footballMatches"));

        const team1 = allTeams[0]?.id || "t1";
        const team2 = allTeams[1]?.id || "t2";
        const team3 = allTeams[2]?.id || "t3";
        const team4 = allTeams[3]?.id || "t4";

        const semi1Match: FootballMatch = {
          id: semi1Ref.id,
          team1Id: team1,
          team2Id: team2,
          team1Score: 0,
          team2Score: 0,
          status: "upcoming",
          time: "اليوم الثاني - 05:00 PM",
          round: "نصف النهائي (مباراة 1)",
          stage: "knockout",
          bracketRound: "semi",
          nextMatchId: finalRef.id,
          nextMatchSlot: 1
        };

        const semi2Match: FootballMatch = {
          id: semi2Ref.id,
          team1Id: team3,
          team2Id: team4,
          team1Score: 0,
          team2Score: 0,
          status: "upcoming",
          time: "اليوم الثاني - 06:00 PM",
          round: "نصف النهائي (مباراة 2)",
          stage: "knockout",
          bracketRound: "semi",
          nextMatchId: finalRef.id,
          nextMatchSlot: 2
        };

        const finalMatch: FootballMatch = {
          id: finalRef.id,
          team1Id: "winner_sf1",
          team2Id: "winner_sf2",
          team1Score: 0,
          team2Score: 0,
          status: "upcoming",
          time: "اليوم الثالث - 07:00 PM",
          round: "النهائي الكبيير 🏆",
          stage: "knockout",
          bracketRound: "final"
        };

        batch.set(semi1Ref, semi1Match);
        batch.set(semi2Ref, semi2Match);
        batch.set(finalRef, finalMatch);

      } else {
        // Generate Round Robin League Schedule
        const n = allTeams.length;
        const teamsList = [...allTeams];
        if (n % 2 !== 0) {
          teamsList.push({ id: "bye", name: "استراحة", color: "", bgColor: "", borderColor: "", logo: "⏸️", totalScore: 0 });
        }
        const totalNum = teamsList.length;
        const rounds = totalNum - 1;

        let matchCount = 1;
        for (let r = 0; r < rounds; r++) {
          const roundName = `الجولة ${r + 1}`;
          for (let i = 0; i < totalNum / 2; i++) {
            const t1 = teamsList[i];
            const t2 = teamsList[totalNum - 1 - i];

            if (t1.id !== "bye" && t2.id !== "bye") {
              const newMatchRef = doc(collection(db, "footballMatches"));
              const matchObj: FootballMatch = {
                id: newMatchRef.id,
                team1Id: t1.id,
                team2Id: t2.id,
                team1Score: 0,
                team2Score: 0,
                status: "upcoming",
                time: `اليوم ${Math.floor(matchCount / 3) + 1} - 0${(matchCount % 4) + 4}:00 PM`,
                round: roundName,
                stage: "league"
              };
              batch.set(newMatchRef, matchObj);
              matchCount++;
            }
          }

          // Rotate array for Round Robin
          teamsList.splice(1, 0, teamsList.pop()!);
        }
      }

      await batch.commit();

      // Update config autoScheduleGenerated flag
      await setDoc(doc(db, "footballTournament", "config"), { autoScheduleGenerated: true }, { merge: true });

      alert("تمت أوتوماتيكياً كتابة وتوليد جدول المباريات والتصفيات بنجاح! 🎉");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء توليد الجدول.");
    }
  };

  // Add Match Event
  const handleAddMatchEvent = () => {
    if (!newEventPlayer.trim()) {
      alert("الرجاء إدخال اسم اللاعب!");
      return;
    }

    const newEv: FootballMatchEvent = {
      id: "ev_" + Date.now(),
      type: newEventType,
      teamId: newEventTeamId || team1Id,
      playerName: newEventPlayer.trim(),
      minute: newEventMinute.trim() ? `${newEventMinute.replace(/[^0-9]/g, '')}'` : ""
    };

    setMatchEvents(prev => [...prev, newEv]);

    // Auto increment score if goal
    if (newEventType === "goal") {
      if (newEv.teamId === team1Id) {
        setTeam1Score(prev => String((Number(prev) || 0) + 1));
      } else if (newEv.teamId === team2Id) {
        setTeam2Score(prev => String((Number(prev) || 0) + 1));
      }
    }

    setNewEventPlayer("");
    setNewEventMinute("");
  };

  const handleRemoveMatchEvent = (eventId: string) => {
    const target = matchEvents.find(e => e.id === eventId);
    setMatchEvents(prev => prev.filter(e => e.id !== eventId));

    if (target && target.type === "goal") {
      if (target.teamId === team1Id) {
        setTeam1Score(prev => String(Math.max(0, (Number(prev) || 0) - 1)));
      } else if (target.teamId === team2Id) {
        setTeam2Score(prev => String(Math.max(0, (Number(prev) || 0) - 1)));
      }
    }
  };

  // Save / Submit Match
  const handleSubmitMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (team1Id === team2Id) {
      alert("الرجاء اختيار فريقين مختلفين للمباراة!");
      return;
    }
    if (!time.trim()) {
      alert("الرجاء تحديد موعد وتوقيت المباراة!");
      return;
    }

    try {
      const s1 = Number(team1Score) || 0;
      const s2 = Number(team2Score) || 0;

      const payload: Omit<FootballMatch, "id"> = {
        team1Id,
        team2Id,
        team1Score: s1,
        team2Score: s2,
        status,
        time,
        round,
        stage,
        events: matchEvents,
        manOfTheMatch: manOfTheMatch.trim() || undefined,
        manOfTheMatchTeamId: manOfTheMatchTeamId || undefined,
        manOfTheMatchNotes: manOfTheMatchNotes.trim() || undefined
      };

      if (isEditing) {
        await updateDoc(doc(db, "footballMatches", isEditing.id), payload);

        // Auto Advance Winner in Knockout Bracket if completed
        if (status === "completed" && isEditing.nextMatchId && isEditing.nextMatchSlot) {
          const winnerTeamId = s1 > s2 ? team1Id : s2 > s1 ? team2Id : team1Id; // Penalty winner assumption
          const targetRef = doc(db, "footballMatches", isEditing.nextMatchId);
          if (isEditing.nextMatchSlot === 1) {
            await updateDoc(targetRef, { team1Id: winnerTeamId });
          } else {
            await updateDoc(targetRef, { team2Id: winnerTeamId });
          }
        }
      } else {
        await addDoc(collection(db, "footballMatches"), payload);
      }

      setShowAddMatch(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ تفاصيل المباراة.");
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm("هل أنت متأكد من حذف هذه المباراة نهائياً؟")) return;
    try {
      await deleteDoc(doc(db, "footballMatches", id));
      if (selectedMatch?.id === id) setSelectedMatch(null);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف المباراة.");
    }
  };

  // Add Custom Team (Winner Maker Style)
  const handleAddCustomTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newTeamName.trim()) {
      alert("الرجاء إدخال اسم الفريق!");
      return;
    }

    try {
      const teamObj: Omit<Team, "id"> = {
        name: newTeamName.trim(),
        logo: newTeamLogo.trim() || "⚽",
        color: "text-white",
        bgColor: newTeamColor,
        borderColor: "border-white/20",
        totalScore: 0
      };

      await addDoc(collection(db, "footballTeams"), teamObj);
      setNewTeamName("");
      setShowAddTeamModal(false);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة الفريق.");
    }
  };

  const handleDeleteCustomTeam = async (teamId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الفريق من الدوري؟")) return;
    try {
      await deleteDoc(doc(db, "footballTeams", teamId));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حذف الفريق.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-white" dir="rtl">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-widest">
              Winner Engine • ISO League
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
              {config.format === "league" ? "نظام الدوري (النقاط)" : config.format === "knockout" ? "نظام خروج المغلوب" : "مجموعات + تصفيات"}
            </span>
          </div>
          
          <h2 className="text-3xl font-serif font-black text-white flex items-center gap-3">
            <SoccerBall3D className="w-10 h-10" />
            <span>{config.name || "دوري كرة القدم لمؤتمر ISO"}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-2 font-medium">
            نظام متكامل لتوليد مواجهات الدوري وإدارتها، شجرة التصفيات النهائية، إحصائيات الأهداف والأسيست، والبطاقات.
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={handleAutoGenerateSchedule}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer"
              title="توليد جدول المواجهات أوتوماتيكياً"
            >
              <Zap className="w-4 h-4 fill-amber-950" />
              <span>توليد جدول {config.format === 'knockout' ? 'التصفيات' : 'الدوري'}</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 glass-button px-4 py-2.5 text-xs tracking-wider"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مباراة</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab("standings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "standings" 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>الترتيب والشجرة الإقصائية</span>
        </button>

        <button
          onClick={() => setActiveTab("fixtures")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "fixtures" 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <CalendarDays className="w-4 h-4 text-indigo-300" />
          <span>المباريات والنتائج ({matches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("scorers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "scorers" 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <Flame className="w-4 h-4 text-orange-400" />
          <span>الهدافين والأسيست ({topScorers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("cards")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "cards" 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <Shield className="w-4 h-4 text-yellow-400" />
          <span>الكروت والإنذارات ({disciplineList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("awards")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "awards" 
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
              : "bg-white/5 text-slate-300 hover:bg-white/10"
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>لوحة الشرف والجوائز ⭐</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "settings" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" 
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span>إدارة الفرق والإعدادات ⚙️</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400">جاري تحميل بيانات الدوري الكروي...</p>
        </div>
      ) : activeTab === "standings" ? (
        /* Standings & Knockout Bracket View */
        <div className="space-y-8">
          
          {/* Format Switch Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-black/30 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">نظام البطولة الحالي:</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              {isAdmin ? (
                <>
                  <button
                    onClick={() => handleFormatChange("league")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      config.format === "league" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    دوري كامل (النقاط)
                  </button>
                  <button
                    onClick={() => handleFormatChange("knockout")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      config.format === "knockout" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    خروج المغلوب (الأدوار الإقصائية)
                  </button>
                  <button
                    onClick={() => handleFormatChange("hybrid")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      config.format === "hybrid" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
              >
                مجموعات + تصفيات
              </button>
            </div>
          </div>

          {/* 1. League Standings Table */}
          {(config.format === "league" || config.format === "hybrid") && (
            <div className="glass-panel p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-5.5 h-5.5 text-amber-400" />
                  <h3 className="text-xs uppercase tracking-widest font-bold py-1 px-3 bg-white/10 text-white rounded-lg border border-white/5 w-fit backdrop-blur-sm">
                    جدول ترتيب الدوري
                  </h3>
                </div>
                <div className="text-[11px] font-bold text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  الفوز = 3 نقاط | التعادل = نقطة
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right border-collapse text-[11px] sm:text-xs md:text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold text-[9px] sm:text-xs uppercase tracking-wider">
                      <th className="py-3 px-2 text-center w-12">#</th>
                      <th className="py-3 px-2">الفريق</th>
                      <th className="py-3 px-2 text-center">لعب</th>
                      <th className="py-3 px-2 text-center text-emerald-400">فوز</th>
                      <th className="py-3 px-2 text-center text-slate-400">تعادل</th>
                      <th className="py-3 px-2 text-center text-rose-400">خسارة</th>
                      <th className="py-3 px-2 text-center">له/عليه</th>
                      <th className="py-3 px-2 text-center">فرق الأهداف</th>
                      <th className="py-3 px-2 text-center font-black text-white">النقاط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {standings.map((team, idx) => {
                      const isTop = idx === 0;
                      return (
                        <tr 
                          key={team.id}
                          className={`transition-colors ${isTop ? "bg-amber-500/10 font-bold" : "hover:bg-white/5"}`}
                        >
                          <td className="py-3.5 px-2 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-black rounded-full shadow-lg ${
                              idx === 0 ? "bg-amber-400 text-amber-950 shadow-amber-400/20" : 
                              idx === 1 ? "bg-slate-300 text-slate-800 shadow-slate-300/20" :
                              idx === 2 ? "bg-amber-600 text-white shadow-amber-600/20" : "bg-white/10 text-slate-400 border border-white/5"
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="flex items-center gap-3">
                              <span className="text-xl leading-none drop-shadow-md">{team.logo}</span>
                              <span className="font-serif font-black text-white">{team.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-center font-bold">{team.played}</td>
                          <td className="py-3.5 px-2 text-center text-emerald-400 font-bold">{team.wins}</td>
                          <td className="py-3.5 px-2 text-center text-slate-400 font-bold">{team.draws}</td>
                          <td className="py-3.5 px-2 text-center text-rose-400 font-bold">{team.losses}</td>
                          <td className="py-3.5 px-2 text-center font-mono text-xs text-slate-300" dir="ltr">
                            {team.gf} - {team.ga}
                          </td>
                          <td className="py-3.5 px-2 text-center font-mono font-bold" dir="ltr">
                            <span className={`px-2 py-0.5 rounded ${team.gd > 0 ? 'text-emerald-400' : team.gd < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                              {team.gd > 0 ? `+${team.gd}` : team.gd}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-center font-serif font-black text-base text-white">
                            <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30 min-w-[40px] inline-block shadow-inner">
                              {team.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. Interactive Knockout Brackets Tree (Winner Maker Style) */}
          {(config.format === "knockout" || config.format === "hybrid") && (
            <div className="glass-panel p-6 md:p-8 space-y-6 border-indigo-500/30">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <GitBranch className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h3 className="text-base font-black text-white font-serif">شجرة تصفيات الأدوار الإقصائية (Knockout Brackets)</h3>
                    <p className="text-xs text-slate-300">يتأهل الفائز تلقائياً للدور التالي بمجرد تسجيل النتيجة وإكمال المباراة.</p>
                  </div>
                </div>
              </div>

              {/* Bracket Matches Visualizer */}
              {(() => {
                const knockoutMatches = matches.filter(m => m.stage === "knockout" || m.bracketRound);
                if (knockoutMatches.length === 0) {
                  return (
                    <div className="text-center py-12 border border-dashed border-white/20 rounded-2xl bg-black/20 space-y-3">
                      <GitBranch className="w-10 h-10 text-slate-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-300">لا توجد مواجهات إقصائية منشأة بعد.</p>
                      {isAdmin && (
                        <button
                          onClick={handleAutoGenerateSchedule}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
                        >
                          + توليد شجرة التصفيات أوتوماتيكياً
                        </button>
                      )}
                    </div>
                  );
                }

                const semiMatches = knockoutMatches.filter(m => m.bracketRound === "semi");
                const finalMatch = knockoutMatches.find(m => m.bracketRound === "final");

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
                    {/* Semi Finals Column */}
                    <div className="space-y-6">
                      <div className="text-xs font-black text-indigo-300 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg w-fit border border-indigo-500/20">
                        مرحلة نصف النهائي (Semi-Finals)
                      </div>

                      {semiMatches.map((m, idx) => {
                        const t1 = allTeams.find(t => t.id === m.team1Id) || { name: m.team1Id, logo: "⚽" };
                        const t2 = allTeams.find(t => t.id === m.team2Id) || { name: m.team2Id, logo: "⚽" };
                        const isWinner1 = m.status === "completed" && m.team1Score > m.team2Score;
                        const isWinner2 = m.status === "completed" && m.team2Score > m.team1Score;

                        return (
                          <div 
                            key={m.id}
                            onClick={() => setSelectedMatch(m)}
                            className="bg-black/30 border border-white/10 hover:border-indigo-400/50 p-4 rounded-2xl transition-all cursor-pointer relative group space-y-3"
                          >
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                              <span>مباراة #{idx + 1} • {m.round}</span>
                              <span className={`px-2 py-0.5 rounded ${m.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                {m.status === 'completed' ? 'مكتملة' : 'قادمة'}
                              </span>
                            </div>

                            {/* Team 1 */}
                            <div className={`flex items-center justify-between p-2.5 rounded-xl transition ${isWinner1 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{t1.logo}</span>
                                <span className={`text-xs font-bold ${isWinner1 ? 'text-emerald-300 font-black' : 'text-white'}`}>{t1.name}</span>
                              </div>
                              <span className="font-mono font-black text-sm">{m.status === 'completed' ? m.team1Score : '-'}</span>
                            </div>

                            {/* Team 2 */}
                            <div className={`flex items-center justify-between p-2.5 rounded-xl transition ${isWinner2 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{t2.logo}</span>
                                <span className={`text-xs font-bold ${isWinner2 ? 'text-emerald-300 font-black' : 'text-white'}`}>{t2.name}</span>
                              </div>
                              <span className="font-mono font-black text-sm">{m.status === 'completed' ? m.team2Score : '-'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Final Column */}
                    {finalMatch && (
                      <div className="space-y-6">
                        <div className="text-xs font-black text-amber-300 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-lg w-fit border border-amber-500/20 flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-amber-400" />
                          <span>النهائي الكبير (The Final 🏆)</span>
                        </div>

                        {(() => {
                          const t1 = allTeams.find(t => t.id === finalMatch.team1Id) || { name: finalMatch.team1Id.includes("winner") ? "متأهل نصف النهائي 1" : finalMatch.team1Id, logo: "❓" };
                          const t2 = allTeams.find(t => t.id === finalMatch.team2Id) || { name: finalMatch.team2Id.includes("winner") ? "متأهل نصف النهائي 2" : finalMatch.team2Id, logo: "❓" };
                          const isWinner1 = finalMatch.status === "completed" && finalMatch.team1Score > finalMatch.team2Score;
                          const isWinner2 = finalMatch.status === "completed" && finalMatch.team2Score > finalMatch.team1Score;

                          return (
                            <div 
                              onClick={() => setSelectedMatch(finalMatch)}
                              className="bg-gradient-to-br from-amber-500/20 via-indigo-900/40 to-black/40 border-2 border-amber-400/40 p-5 rounded-2xl transition-all cursor-pointer relative group space-y-4 shadow-xl shadow-amber-500/10"
                            >
                              <div className="flex justify-between items-center text-xs text-amber-300 font-extrabold">
                                <span>{finalMatch.round}</span>
                                <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded border border-amber-400/30">
                                  {finalMatch.time}
                                </span>
                              </div>

                              {/* Team 1 */}
                              <div className={`flex items-center justify-between p-3 rounded-xl transition ${isWinner1 ? 'bg-amber-500/30 border border-amber-400' : 'bg-black/40 border border-white/10'}`}>
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl">{t1.logo}</span>
                                  <span className={`text-sm font-bold ${isWinner1 ? 'text-amber-300 font-serif font-black text-base' : 'text-white'}`}>{t1.name}</span>
                                </div>
                                <span className="font-mono font-black text-lg">{finalMatch.status === 'completed' ? finalMatch.team1Score : '-'}</span>
                              </div>

                              {/* Team 2 */}
                              <div className={`flex items-center justify-between p-3 rounded-xl transition ${isWinner2 ? 'bg-amber-500/30 border border-amber-400' : 'bg-black/40 border border-white/10'}`}>
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl">{t2.logo}</span>
                                  <span className={`text-sm font-bold ${isWinner2 ? 'text-amber-300 font-serif font-black text-base' : 'text-white'}`}>{t2.name}</span>
                                </div>
                                <span className="font-mono font-black text-lg">{finalMatch.status === 'completed' ? finalMatch.team2Score : '-'}</span>
                              </div>

                              {finalMatch.status === "completed" && (
                                <div className="bg-amber-400 text-amber-950 font-serif font-black text-center py-2 rounded-xl text-xs flex items-center justify-center gap-2">
                                  <Trophy className="w-4 h-4" />
                                  <span>بطل البطولة: {isWinner1 ? t1.name : t2.name} 🏆</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      ) : activeTab === "fixtures" ? (
        /* Matches & Schedule List */
        <div className="glass-panel p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-5.5 h-5.5 text-indigo-400" />
              <h3 className="text-base font-black text-white font-serif">جدول ومواعيد مباريات البطولة</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs border border-dashed border-white/20 rounded-xl bg-black/10">
                لا توجد مباريات مسجلة حالياً.
              </div>
            ) : (
              matches
                .sort((a, b) => b.time.localeCompare(a.time))
                .map((match) => {
                  const t1 = allTeams.find(t => t.id === match.team1Id) || { name: match.team1Id, logo: "⚽" };
                  const t2 = allTeams.find(t => t.id === match.team2Id) || { name: match.team2Id, logo: "⚽" };
                  const goalsCount = match.events?.filter(e => e.type === "goal").length || 0;
                  const cardsCount = match.events?.filter(e => e.type === "yellow_card" || e.type === "red_card").length || 0;

                  return (
                    <div 
                      key={match.id}
                      className="bg-black/20 p-5 border border-white/10 rounded-2xl space-y-4 backdrop-blur-sm hover:bg-white/5 transition-colors relative group"
                    >
                      <div className="flex justify-between items-center text-[11px] text-slate-400 font-bold">
                        <span>{match.round}</span>
                        <span className="flex items-center gap-1">
                          {match.status === "completed" ? (
                            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> مكتملة
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                              <Play className="w-3.5 h-3.5" /> قادمة
                            </span>
                          )}
                        </span>
                      </div>

                      <div 
                        onClick={() => setSelectedMatch(match)}
                        className="flex justify-between items-center gap-2 py-1 cursor-pointer hover:opacity-90 transition"
                      >
                        <div className="flex items-center gap-2 flex-1 justify-end">
                          <span className="text-xs font-black text-white text-right line-clamp-1">{t1.name}</span>
                          <span className="text-2xl shrink-0">{t1.logo}</span>
                        </div>

                        <div className="bg-white/10 text-white px-3.5 py-2 rounded-xl font-serif font-black text-base min-w-[75px] text-center border border-white/20 shadow-inner">
                          {match.status === "completed" ? (
                            <span>{match.team1Score} - {match.team2Score}</span>
                          ) : (
                            <span className="text-xs uppercase font-sans tracking-wider opacity-60">VS</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-1 justify-start">
                          <span className="text-2xl shrink-0">{t2.logo}</span>
                          <span className="text-xs font-black text-white text-left line-clamp-1">{t2.name}</span>
                        </div>
                      </div>

                      {match.manOfTheMatch && (
                        <div className="bg-amber-500/15 border border-amber-400/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                            <span className="text-[10px] text-amber-300 font-bold shrink-0">نجم المباراة:</span>
                            <span className="font-bold text-white truncate text-[11px]">{match.manOfTheMatch}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-slate-400 font-medium">
                        <span className="bg-black/30 px-2.5 py-1 rounded-lg border border-white/5">{match.time}</span>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedMatch(match)}
                            className="text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>التفاصيل</span>
                          </button>

                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => handleOpenEdit(match)}
                                className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 p-1 rounded transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteMatch(match.id)}
                                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 p-1 rounded transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      ) : activeTab === "scorers" ? (
        /* Top Scorers & Top Assists Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Scorers */}
          <div className="glass-panel p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-6 border-b border-white/10 pb-4">
              <Flame className="w-6 h-6 text-orange-400" />
              <div>
                <h3 className="text-base font-black text-white font-serif">جدول الهدافين (Top Scorers ⚽)</h3>
                <p className="text-xs text-slate-300">قائمة اللاعبين الأكثر تسجيلاً للأهداف في البطولة.</p>
              </div>
            </div>

            {topScorers.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-white/20 rounded-xl bg-black/10">
                لا توجد أهداف مسجلة حتى الآن.
              </div>
            ) : (
              <div className="space-y-3">
                {topScorers.map((scorer, idx) => {
                  const team = allTeams.find(t => t.id === scorer.teamId);
                  return (
                    <div 
                      key={`${scorer.name}_${scorer.teamId}`}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        idx === 0 ? "bg-amber-500/15 border-amber-400/40" : "bg-black/20 border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 flex items-center justify-center font-black rounded-full text-xs ${
                          idx === 0 ? "bg-amber-400 text-amber-950 font-black" : "bg-white/10 text-slate-300"
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1">
                            <span>{scorer.name}</span>
                            {idx === 0 && <span className="text-amber-400 text-xs">👑 هداف البطولة</span>}
                          </div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                            <span>{team?.logo}</span>
                            <span>{team?.name || "فريق"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 font-serif font-black text-amber-400 text-base">
                        {scorer.goals} أهداف ⚽
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Assists */}
          <div className="glass-panel p-6 md:p-8">
            <div className="flex items-center gap-2.5 mb-6 border-b border-white/10 pb-4">
              <Zap className="w-6 h-6 text-indigo-400" />
              <div>
                <h3 className="text-base font-black text-white font-serif">جدول صناع الأهداف (Top Assists 👟)</h3>
                <p className="text-xs text-slate-300">أكثر اللاعبين صناعة للتمريرات الحاسمة والأسيست.</p>
              </div>
            </div>

            {topAssists.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-white/20 rounded-xl bg-black/10">
                لا توجد تمريرات حاسمة مسجلة بعد.
              </div>
            ) : (
              <div className="space-y-3">
                {topAssists.map((assist, idx) => {
                  const team = allTeams.find(t => t.id === assist.teamId);
                  return (
                    <div 
                      key={`${assist.name}_${assist.teamId}`}
                      className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 flex items-center justify-center font-bold bg-white/10 rounded-full text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-white">{assist.name}</div>
                          <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                            <span>{team?.logo}</span>
                            <span>{team?.name || "فريق"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 font-serif font-black text-indigo-300 text-base">
                        {assist.assists} أسيست 👟
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : activeTab === "cards" ? (
        /* Discipline Tab */
        <div className="glass-panel p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5 mb-6 border-b border-white/10 pb-4">
            <Shield className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-base font-black text-white font-serif">سجل الانضباط والكروت 🟨 🟥</h3>
              <p className="text-xs text-slate-300">متابعة الإنذارات والطرد المباشر للاعبي الفرق.</p>
            </div>
          </div>

          {disciplineList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-white/20 rounded-xl bg-black/10">
              لا توجد كروت أو إنذارات مسجلة في البطولة (سجل نظيف ✨).
            </div>
          ) : (
            <div className="space-y-3">
              {disciplineList.map((item, idx) => {
                const team = allTeams.find(t => t.id === item.teamId);
                return (
                  <div 
                    key={`${item.name}_${item.teamId}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-400 w-5 text-center">#{idx + 1}</span>
                      <div>
                        <div className="font-bold text-sm text-white">{item.name}</div>
                        <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5">
                          <span>{team?.logo}</span>
                          <span>{team?.name || "فريق"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.yellow > 0 && (
                        <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-3 py-1 rounded-lg text-xs font-bold">
                          <span>🟨</span>
                          <span>{item.yellow} إنذار</span>
                        </span>
                      )}
                      {item.red > 0 && (
                        <span className="flex items-center gap-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-lg text-xs font-bold">
                          <span>🟥</span>
                          <span>{item.red} طرد</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeTab === "awards" ? (
        /* Honors & Awards Tab */
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-400/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-amber-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white font-serif flex items-center gap-2">
                  <span>لوحة الشرف والجوائز الفردية</span>
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  تكريم المتميزين في بطولة كرة القدم (أحسن لاعب، الهداف، أفضل حارس، والفريق المثالي)
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={handleOpenEditAwards}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black px-5 py-3 rounded-xl text-xs transition shadow-lg shadow-amber-500/20 self-start md:self-auto cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>تحديد جوائز البطولة</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Best Player */}
            <div className="glass-panel p-6 border-amber-400/30 relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-black/20 to-black/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold uppercase text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                  🌟 أحسن لاعب
                </span>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              {awards.bestPlayer ? (
                <div className="space-y-3">
                  <div className="text-lg font-black text-white font-serif">{awards.bestPlayer}</div>
                  {(() => {
                    const bpTeam = allTeams.find(t => t.id === awards.bestPlayerTeamId);
                    return bpTeam ? (
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                        <span>{bpTeam.logo}</span>
                        <span className="font-bold">{bpTeam.name}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs italic">لم يتم الاختيار بعد</div>
              )}
            </div>

            {/* Top Scorer */}
            <div className="glass-panel p-6 border-orange-500/30 relative overflow-hidden bg-gradient-to-b from-orange-500/10 via-black/20 to-black/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold uppercase text-orange-300 bg-orange-500/20 px-2.5 py-1 rounded-full border border-orange-500/30">
                  ⚽ هداف الدوري
                </span>
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              {topScorers.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-lg font-black text-white font-serif">{topScorers[0].name}</div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-amber-400 text-sm bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30">
                      {topScorers[0].goals} أهداف
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs italic">جاري احتساب الأهداف</div>
              )}
            </div>

            {/* Best Goalkeeper */}
            <div className="glass-panel p-6 border-indigo-500/30 relative overflow-hidden bg-gradient-to-b from-indigo-500/10 via-black/20 to-black/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold uppercase text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full border border-indigo-500/30">
                  🧤 أفضل حارس
                </span>
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              {awards.bestGoalkeeper ? (
                <div className="space-y-3">
                  <div className="text-lg font-black text-white font-serif">{awards.bestGoalkeeper}</div>
                  {(() => {
                    const bgTeam = allTeams.find(t => t.id === awards.bestGoalkeeperTeamId);
                    return bgTeam ? (
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 w-fit">
                        <span>{bgTeam.logo}</span>
                        <span className="font-bold">{bgTeam.name}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs italic">لم يتم الاختيار بعد</div>
              )}
            </div>

            {/* Fair Play */}
            <div className="glass-panel p-6 border-emerald-500/30 relative overflow-hidden bg-gradient-to-b from-emerald-500/10 via-black/20 to-black/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold uppercase text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  🤝 الفريق المثالي
                </span>
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              {(() => {
                const fpTeam = allTeams.find(t => t.id === awards.fairPlayTeamId) || allTeams[0];
                return fpTeam ? (
                  <div className="space-y-3">
                    <div className="text-lg font-black text-white font-serif flex items-center gap-2">
                      <span className="text-2xl">{fpTeam.logo}</span>
                      <span>{fpTeam.name}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs italic">لم يتم التحديد بعد</div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        /* Settings & Teams Management Tab (Admin Only) */
        <div className="glass-panel p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-black text-white font-serif">إدارة الفرق المشاركة في البطولة</h3>
                <p className="text-xs text-slate-300">إضافة وتعديل فرق كروية مخصصة للبطولة (Winner Tournament Maker)</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddTeamModal(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فريق جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allTeams.map((t) => (
              <div 
                key={t.id}
                className="bg-black/30 p-4 rounded-xl border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.logo}</span>
                  <div>
                    <div className="font-bold text-sm text-white">{t.name}</div>
                    <div className="text-[10px] text-slate-400">ID: {t.id}</div>
                  </div>
                </div>

                {customTeams.some(ct => ct.id === t.id) && (
                  <button
                    onClick={() => handleDeleteCustomTeam(t.id)}
                    className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition cursor-pointer"
                    title="حذف الفريق"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full p-6 shadow-2xl border-white/20 space-y-6" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-indigo-300 uppercase font-bold block">{selectedMatch.round}</span>
                <h3 className="text-base font-black text-white font-serif">تقرير وتفاصيل المباراة</h3>
              </div>
              <button 
                onClick={() => setSelectedMatch(null)}
                className="text-slate-300 hover:text-white bg-white/5 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const t1 = allTeams.find(t => t.id === selectedMatch.team1Id) || { name: selectedMatch.team1Id, logo: "⚽" };
              const t2 = allTeams.find(t => t.id === selectedMatch.team2Id) || { name: selectedMatch.team2Id, logo: "⚽" };

              return (
                <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900/40 p-6 rounded-2xl border border-white/10 text-center space-y-4 shadow-inner">
                  <div className="text-[11px] font-bold text-slate-300">{selectedMatch.time}</div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 text-center space-y-1">
                      <span className="text-3xl block drop-shadow-lg">{t1.logo}</span>
                      <span className="text-sm font-black text-white block line-clamp-1">{t1.name}</span>
                    </div>

                    <div className="bg-white/10 px-4 py-2 rounded-xl text-2xl font-serif font-black text-white border border-white/20 shadow-xl min-w-[90px]">
                      {selectedMatch.status === "completed" ? (
                        <span>{selectedMatch.team1Score} - {selectedMatch.team2Score}</span>
                      ) : (
                        <span className="text-xs uppercase font-sans tracking-widest text-indigo-300">لم تبدأ</span>
                      )}
                    </div>

                    <div className="flex-1 text-center space-y-1">
                      <span className="text-3xl block drop-shadow-lg">{t2.logo}</span>
                      <span className="text-sm font-black text-white block line-clamp-1">{t2.name}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Match Events List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 border-b border-white/10 pb-2">أحداث ومجريات المباراة:</h4>
              
              {!selectedMatch.events || selectedMatch.events.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-black/10 rounded-xl border border-white/5">
                  لا توجد أهداف أو كروت مسجلة لهذه المباراة.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pl-1">
                  {selectedMatch.events.map(ev => {
                    const evTeam = allTeams.find(t => t.id === ev.teamId);
                    return (
                      <div 
                        key={ev.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">
                            {ev.type === "goal" ? "⚽" : ev.type === "assist" ? "👟" : ev.type === "yellow_card" ? "🟨" : "🟥"}
                          </span>
                          <span className="font-bold text-white">{ev.playerName}</span>
                          <span className="text-[10px] text-slate-400">({evTeam?.name})</span>
                        </div>
                        {ev.minute && (
                          <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded text-indigo-200">
                            {ev.minute}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMatch(null)}
              className="w-full px-4 py-3 text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Match Modal */}
      {showAddMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel max-w-lg w-full p-6 shadow-2xl border-white/20 my-8" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white font-serif">
                {isEditing ? "تعديل أحداث وتفاصيل المباراة" : "إضافة مباراة كروية جديدة"}
              </h3>
              <button 
                onClick={() => setShowAddMatch(false)}
                className="text-slate-300 hover:text-white bg-white/5 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMatch} className="space-y-5">
              
              {/* Teams Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الفريق الأول</label>
                  <select
                    value={team1Id}
                    onChange={(e) => setTeam1Id(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium outline-none"
                  >
                    {allTeams.map(t => <option key={t.id} value={t.id} className="bg-slate-800">{t.logo} {t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الفريق الثاني</label>
                  <select
                    value={team2Id}
                    onChange={(e) => setTeam2Id(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium outline-none"
                  >
                    {allTeams.map(t => <option key={t.id} value={t.id} className="bg-slate-800">{t.logo} {t.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Status & Stage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">حالة المباراة</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium outline-none"
                  >
                    <option value="upcoming" className="bg-slate-800">قادمة (لم تبدأ)</option>
                    <option value="completed" className="bg-slate-800">مكتملة (نتيجة نهائية)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">المرحلة</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-medium outline-none"
                  >
                    <option value="league" className="bg-slate-800">دور المجموعات / الدوري</option>
                    <option value="knockout" className="bg-slate-800">الأدوار الإقصائية (خروج المغلوب)</option>
                  </select>
                </div>
              </div>

              {/* Score Inputs with Quick Increment Buttons */}
              {status === "completed" && (
                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">أهداف الفريق الأول</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTeam1Score(prev => String(Math.max(0, (Number(prev) || 0) - 1)))}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-lg text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={team1Score}
                        onChange={(e) => setTeam1Score(e.target.value)}
                        className="w-full text-center px-3 py-2 rounded-xl border border-white/10 bg-black/30 text-white font-mono text-base font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setTeam1Score(prev => String((Number(prev) || 0) + 1))}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-lg text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">أهداف الفريق الثاني</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTeam2Score(prev => String(Math.max(0, (Number(prev) || 0) - 1)))}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-2 rounded-lg text-sm cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={team2Score}
                        onChange={(e) => setTeam2Score(e.target.value)}
                        className="w-full text-center px-3 py-2 rounded-xl border border-white/10 bg-black/30 text-white font-mono text-base font-bold outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setTeam2Score(prev => String((Number(prev) || 0) + 1))}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded-lg text-sm cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Man of the Match Section */}
              {status === "completed" && (
                <div className="space-y-3 bg-amber-500/10 p-4 rounded-xl border border-amber-400/30">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>تحديد نجم المباراة (Man of the Match ⭐)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-bold">اسم اللاعب</label>
                      <input
                        type="text"
                        value={manOfTheMatch}
                        onChange={(e) => setManOfTheMatch(e.target.value)}
                        placeholder="اسم نجم المباراة"
                        className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-black/40 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-300 mb-1 font-bold">فريق اللاعب</label>
                      <select
                        value={manOfTheMatchTeamId}
                        onChange={(e) => setManOfTheMatchTeamId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-black/40 text-white text-xs outline-none"
                      >
                        {allTeams.filter(t => t.id === team1Id || t.id === team2Id).map(t => (
                          <option key={t.id} value={t.id} className="bg-slate-800">{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Builder */}
              <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/10">
                <h4 className="text-xs font-bold text-slate-200">⚽ تسجل الأحداث والإنذارات</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <input
                    type="text"
                    value={newEventPlayer}
                    onChange={(e) => setNewEventPlayer(e.target.value)}
                    placeholder="اسم اللاعب"
                    className="px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                  />

                  <select
                    value={newEventTeamId}
                    onChange={(e) => setNewEventTeamId(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                  >
                    {allTeams.filter(t => t.id === team1Id || t.id === team2Id).map(t => (
                      <option key={t.id} value={t.id} className="bg-slate-800">{t.name}</option>
                    ))}
                  </select>

                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                  >
                    <option value="goal" className="bg-slate-800">⚽ هدف</option>
                    <option value="assist" className="bg-slate-800">👟 أسيست (تمريرة حاسمة)</option>
                    <option value="yellow_card" className="bg-slate-800">🟨 كارت أصفر</option>
                    <option value="red_card" className="bg-slate-800">🟥 كارت أحمر</option>
                  </select>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newEventMinute}
                      onChange={(e) => setNewEventMinute(e.target.value)}
                      placeholder="الدقيقة"
                      className="w-1/2 px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddMatchEvent}
                      className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                    >
                      + إضافة
                    </button>
                  </div>
                </div>

                {matchEvents.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {matchEvents.map(ev => {
                      const evTeam = allTeams.find(t => t.id === ev.teamId);
                      return (
                        <div key={ev.id} className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg text-[11px]">
                          <span>{ev.type === "goal" ? "⚽" : ev.type === "assist" ? "👟" : ev.type === "yellow_card" ? "🟨" : "🟥"}</span>
                          <span className="font-bold text-white">{ev.playerName}</span>
                          <span className="text-[9px] text-slate-400">({evTeam?.name})</span>
                          <button type="button" onClick={() => handleRemoveMatchEvent(ev.id)} className="text-slate-400 hover:text-rose-400 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Round & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">الجولة / المرحلة</label>
                  <input
                    type="text"
                    value={round}
                    onChange={(e) => setRound(e.target.value)}
                    placeholder="مثال: الجولة الأولى"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">التوقيت</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="مثال: اليوم الأول - 05:00 PM"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMatch(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold text-slate-300 bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition cursor-pointer shadow-lg shadow-indigo-500/30"
                >
                  حفظ المباراة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Awards Modal */}
      {showEditAwardsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full p-6 shadow-2xl border-amber-400/30 my-8" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-base font-black text-white font-serif flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>تعديل وحفظ جوائز البطولة</span>
              </h3>
              <button onClick={() => setShowEditAwardsModal(false)} className="text-slate-300 hover:text-white bg-white/5 p-1.5 rounded-full transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAwards} className="space-y-5">
              <div className="space-y-2 bg-amber-500/10 p-4 rounded-xl border border-amber-400/20">
                <label className="block text-xs font-bold text-amber-300">🌟 أحسن لاعب في البطولة</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editBestPlayer}
                    onChange={(e) => setEditBestPlayer(e.target.value)}
                    placeholder="اسم اللاعب"
                    className="px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                  />
                  <select
                    value={editBestPlayerTeamId}
                    onChange={(e) => setEditBestPlayerTeamId(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                  >
                    {allTeams.map(t => <option key={t.id} value={t.id} className="bg-slate-800">{t.logo} {t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                <label className="block text-xs font-bold text-indigo-300">🧤 أفضل حارس مرمى</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editBestGoalkeeper}
                    onChange={(e) => setEditBestGoalkeeper(e.target.value)}
                    placeholder="اسم الحارس"
                    className="px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                  />
                  <select
                    value={editBestGoalkeeperTeamId}
                    onChange={(e) => setEditBestGoalkeeperTeamId(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                  >
                    {allTeams.map(t => <option key={t.id} value={t.id} className="bg-slate-800">{t.logo} {t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <label className="block text-xs font-bold text-emerald-300">🤝 الفريق المثالي (Fair Play)</label>
                <select
                  value={editFairPlayTeamId}
                  onChange={(e) => setEditFairPlayTeamId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-white/10 bg-black/30 text-white text-xs outline-none"
                >
                  {allTeams.map(t => <option key={t.id} value={t.id} className="bg-slate-800">{t.logo} {t.name}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditAwardsModal(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold text-slate-300 bg-white/5 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  حفظ الجوائز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Team Modal */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full p-6 shadow-2xl border-white/20" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <h3 className="text-base font-black text-white font-serif">إضافة فريق كروي جديد</h3>
              <button onClick={() => setShowAddTeamModal(false)} className="text-slate-300 hover:text-white bg-white/5 p-1.5 rounded-full transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم الفريق</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="مثال: الفرسان"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs font-bold outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الشعار / إيموجي الفريق</label>
                <input
                  type="text"
                  value={newTeamLogo}
                  onChange={(e) => setNewTeamLogo(e.target.value)}
                  placeholder="مثال: 🦁 أو ⚡"
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white text-xs outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="flex-1 px-4 py-3 text-xs font-bold text-slate-300 bg-white/5 rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  إضافة الفريق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
