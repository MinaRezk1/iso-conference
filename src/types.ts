export interface Team {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  logo: string;
  totalScore: number;
}

export interface ScoreLog {
  id: string;
  activityName: string;
  timestamp: any; // Firestore Timestamp
  points: {
    team1: number;
    team2: number;
    team3: number;
    team4: number;
  };
  notes?: string;
}

export interface EventSchedule {
  id: string;
  title: string;
  time: string;
  day: number; // 1, 2
  speaker?: string;
  description?: string;
  icon?: string;
  location?: string;
  responsible?: string;
  completed?: boolean;
  isCurrent?: boolean;
  status?: 'live' | 'upcoming' | 'completed';
  maxPoints?: number;
  awardedPoints?: { [teamId: string]: number };
  scoredBy?: string;
  scoreNotes?: string;
}

export interface Song {
  id: string;
  title: string;
  lyrics: string;
  youtubeUrl?: string;
}

export interface CopticHymn {
  id: string;
  title: string;
  occasion?: string;
  copticText?: string;
  copticArabicText?: string; // قبطي معرب (النطق بحروف عربية)
  arabicMeaning?: string; // المعنى والترجمة بالعربي
  hazzatNotes?: string; // الهزات وتوجيهات الأداء اللحني
  audioUrl?: string; // رابط يوتيوب أو تسجيل صوتي
  duration?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  speaker?: string;
  day?: number;
  isStaffOnly?: boolean;
}

export interface Occupant {
  name: string;
  role: 'boy' | 'servant';
}

export interface Room {
  id: string;
  roomNumber: string;
  building: string;
  floor: string;
  type: 'boys' | 'servants';
  capacity: number;
  occupants: Occupant[];
}

export interface FootballMatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'assist';
  teamId: string;
  playerName: string;
  minute?: string;
  notes?: string;
}

export interface FootballMatch {
  id: string;
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  status: 'upcoming' | 'completed';
  time: string;
  round: string;
  stage?: 'league' | 'knockout';
  bracketRound?: 'quarter' | 'semi' | 'final';
  nextMatchId?: string;
  nextMatchSlot?: 1 | 2;
  events?: FootballMatchEvent[];
  manOfTheMatch?: string;
  manOfTheMatchTeamId?: string;
  manOfTheMatchNotes?: string;
}

export interface TournamentConfig {
  format: 'league' | 'knockout' | 'hybrid';
  name: string;
  autoScheduleGenerated?: boolean;
}

export interface FootballAwards {
  bestPlayer?: string;
  bestPlayerTeamId?: string;
  bestGoalkeeper?: string;
  bestGoalkeeperTeamId?: string;
  topScorerOverride?: string;
  fairPlayTeamId?: string;
}

export interface ConferenceMember {
  id: string;
  name: string;
  role?: 'boy' | 'servant';
  notes?: string;
}

export interface ConferenceGroup {
  id: string;
  name: string;
  code: string;
  color: string;
  bgColor: string;
  borderColor: string;
  members: ConferenceMember[];
}

export interface PrayerSection {
  id: string;
  heading: string;
  text: string;
}

export interface Prayer {
  id: string;
  title: string;
  subtitle?: string;
  order: number;
  sections: PrayerSection[];
}

export interface QuizQuestion {
  id: string;
  section: string; // e.g. "أولاً: اختر الإجابة الصحيحة"
  order: number;
  type: 'mcq' | 'text';
  prompt: string;
  options?: string[]; // for type = 'mcq'
  correctOptionIndex?: number; // for type = 'mcq'
  referenceAnswer?: string; // model/expected answer, shown to admin only
}

export interface QuizAnswer {
  questionId: string;
  type: 'mcq' | 'text';
  selectedOptionIndex?: number;
  textAnswer?: string;
}

export interface QuizSubmission {
  id: string;
  participantName: string;
  groupId: string;
  groupName: string;
  answers: QuizAnswer[];
  autoScore: number;
  autoScoreMax: number;
  manualScore?: number | null;
  submittedAt: any; // Firestore Timestamp
}

