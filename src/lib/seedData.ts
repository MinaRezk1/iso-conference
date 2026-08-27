import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc,
  doc, 
  writeBatch 
} from "firebase/firestore";
import { Team, EventSchedule, Song, CopticHymn, Lesson, Room, ScoreLog, ConferenceGroup, QuizQuestion } from "../types";
import { INITIAL_PRAYERS } from "./prayersData";

export const INITIAL_CONFERENCE_GROUPS: ConferenceGroup[] = [
  {
    id: "g1",
    name: "مدرسة عاشور",
    code: "G1",
    color: "#10b981",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    members: [
      { id: "m_g1_01", name: "ماريا ماجد", role: "makhdooma" },
      { id: "m_g1_02", name: "مريم فايز", role: "makhdooma" },
      { id: "m_g1_03", name: "جومانا ايهاب", role: "makhdooma" },
      { id: "m_g1_04", name: "كيرلس سعيد", role: "makhdoom" },
      { id: "m_g1_05", name: "فيلوباتير سعيد", role: "makhdoom" },
      { id: "m_g1_06", name: "مينا ميلاد", role: "makhdoom" },
      { id: "m_g1_07", name: "فادي مفيد", role: "makhdoom" },
      { id: "m_g1_08", name: "مارك عادل", role: "makhdoom" },
      { id: "m_g1_09", name: "ماريو اميل", role: "makhdoom" }
    ]
  },
  {
    id: "g2",
    name: "ايس كريم",
    code: "G2",
    color: "#8b5cf6",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    members: [
      { id: "m_g2_01", name: "ايريني اسامه", role: "makhdooma" },
      { id: "m_g2_02", name: "ساندرا بهاء", role: "makhdooma" },
      { id: "m_g2_03", name: "كارين مجدي", role: "makhdooma" },
      { id: "m_g2_04", name: "مونيكا وديع", role: "makhdooma" },
      { id: "m_g2_05", name: "مارينا وديع", role: "makhdooma" },
      { id: "m_g2_06", name: "كيرلس هاني", role: "makhdoom" },
      { id: "m_g2_07", name: "مينا هاني", role: "makhdoom" },
      { id: "m_g2_08", name: "يوسف نحميا", role: "makhdoom" },
      { id: "m_g2_09", name: "رافي سعيد", role: "makhdoom" }
    ]
  },
  {
    id: "g3",
    name: "ايس كوفي",
    code: "G3",
    color: "#f59e0b",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    members: [
      { id: "m_g3_01", name: "كاتي حسني", role: "makhdooma" },
      { id: "m_g3_02", name: "جيسيكا نعيم", role: "makhdooma" },
      { id: "m_g3_03", name: "جوليا جميل", role: "makhdooma" },
      { id: "m_g3_04", name: "كيريا سامح", role: "makhdooma" },
      { id: "m_g3_05", name: "ايريني فريد", role: "makhdooma" },
      { id: "m_g3_06", name: "مريم فايز", role: "makhdooma" },
      { id: "m_g3_07", name: "مينا مرقص", role: "makhdoom" },
      { id: "m_g3_08", name: "فادي عصام", role: "makhdoom" },
      { id: "m_g3_09", name: "مجدي عادل", role: "makhdoom" }
    ]
  },
  {
    id: "g4",
    name: "بطاطس محمرة",
    code: "G4",
    color: "#f43f5e",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    members: [
      { id: "m_g4_01", name: "فيرينا فتح الله", role: "makhdooma" },
      { id: "m_g4_02", name: "ندي ريمون", role: "makhdooma" },
      { id: "m_g4_03", name: "جاسمين عوض", role: "makhdooma" },
      { id: "m_g4_04", name: "مريم عماد", role: "makhdooma" },
      { id: "m_g4_05", name: "سوسنا عماد", role: "makhdooma" },
      { id: "m_g4_06", name: "كيرلس جرجس", role: "makhdoom" },
      { id: "m_g4_07", name: "بافلي عزمي", role: "makhdoom" },
      { id: "m_g4_08", name: "اندرو ماجد", role: "makhdoom" }
    ]
  }
];

export const DEFAULT_TEAMS: Team[] = [
  { 
    id: "team1", 
    name: "مدرسة عاشور", 
    color: "#10b981", 
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20", 
    borderColor: "border-emerald-200 dark:border-emerald-900", 
    logo: "🟢",
    totalScore: 0
  },
  { 
    id: "team2", 
    name: "ايس كريم", 
    color: "#8b5cf6", 
    bgColor: "bg-violet-50 dark:bg-violet-950/20", 
    borderColor: "border-violet-200 dark:border-violet-900", 
    logo: "🟣",
    totalScore: 0
  },
  { 
    id: "team3", 
    name: "ايس كوفي", 
    color: "#f59e0b", 
    bgColor: "bg-amber-50 dark:bg-amber-950/20", 
    borderColor: "border-amber-200 dark:border-amber-900", 
    logo: "🟡",
    totalScore: 0
  },
  { 
    id: "team4", 
    name: "بطاطس محمرة", 
    color: "#f43f5e", 
    bgColor: "bg-rose-50 dark:bg-rose-950/20", 
    borderColor: "border-rose-200 dark:border-rose-900", 
    logo: "🔴",
    totalScore: 0
  }
];

export const INITIAL_SCHEDULE: EventSchedule[] = [
  // Day 1
  { id: "event1_1", title: "التجمع", time: "06:30 AM - 07:00 AM", day: 1, location: "نقطة التجمع", responsible: "كل الخدام", icon: "Sun", completed: false },
  { id: "event1_2", title: "التحرك بالأتوبيسات", time: "07:00 AM - 08:00 AM", day: 1, location: "الطريق", responsible: "كل الخدام", icon: "Compass", completed: false },
  { id: "event1_3", title: "الوصول والقداس الإلهي", time: "08:00 AM - 10:00 AM", day: 1, location: "الكنيسة", responsible: "الآباء والخدام", icon: "BookOpen", completed: false },
  { id: "event1_4", title: "فطار", time: "10:00 AM - 11:00 AM", day: 1, location: "المطعم", responsible: "لجنة التغذية", icon: "Smile", completed: false },
  { id: "event1_5", title: "تجمع في القاعة وافتتاحية اليوم", time: "11:00 AM - 11:30 AM", day: 1, location: "القاعة الرئيسية", responsible: "خدام المؤتمر", icon: "Sparkles", completed: false },
  { id: "event1_6", title: "دراسة كتاب أمثال 9 و 10", time: "11:30 AM - 12:30 PM", day: 1, location: "القاعة الرئيسية", responsible: "خدام دراسة الكتاب", icon: "BookOpen", completed: false, maxPoints: 100 },
  { id: "event1_7", title: "مسابقة دراسة الكتاب", time: "12:30 PM - 01:00 PM", day: 1, location: "القاعة الرئيسية", responsible: "لجنة المسابقات", icon: "Trophy", completed: false, maxPoints: 100 },
  { id: "event1_8", title: "استلام الغرف وتسكين المشتركين", time: "01:00 PM - 01:30 PM", day: 1, location: "مبنى الغرف", responsible: "لجنة التسكين", icon: "DoorOpen", completed: false },
  { id: "event1_9", title: "حفظ اللحن", time: "01:30 PM - 02:00 PM", day: 1, location: "القاعة الرئيسية", responsible: "معلم اللحن", icon: "Music", completed: false, maxPoints: 100 },
  { id: "event1_10", title: "محاضرة: (كونوا رجالاً)", time: "02:00 PM - 03:00 PM", day: 1, speaker: "أ. إيهاب", location: "القاعة الرئيسية", responsible: "أ. إيهاب", icon: "Compass", completed: false },
  { id: "event1_11", title: "الغداء", time: "03:00 PM - 04:00 PM", day: 1, location: "المطعم", responsible: "لجنة التغذية", icon: "Smile", completed: false },
  { id: "event1_12", title: "بيسين وحمام السباحة", time: "04:00 PM - 06:00 PM", day: 1, location: "البيسين", responsible: "لجنة الألعاب والأنشطة", icon: "Gamepad2", completed: false, maxPoints: 100 },
  { id: "event1_13", title: "شاور وراحة", time: "06:00 PM - 07:00 PM", day: 1, location: "الغرف", responsible: "", icon: "Sparkles", completed: false },
  { id: "event1_14", title: "صلاة الغروب وعمل فني الميدالية", time: "07:00 PM - 08:00 PM", day: 1, location: "القاعة الرئيسية", responsible: "خدام الصلاة والعمل الفني", icon: "Sun", completed: false, maxPoints: 100 },
  { id: "event1_15", title: "محاضرة: (معايير الجودة ISO)", time: "08:00 PM - 09:00 PM", day: 1, speaker: "أ. أشرف / أ. عماد", location: "القاعة الرئيسية", responsible: "أ. أشرف & أ. عماد", icon: "Brain", completed: false },
  { id: "event1_16", title: "عشاء", time: "09:00 PM - 10:00 PM", day: 1, location: "المطعم", responsible: "لجنة التغذية", icon: "Smile", completed: false },
  { id: "event1_17", title: "ألعاب وفقرات ترفيهية مسائية", time: "10:00 PM - 12:00 AM", day: 1, location: "الملعب / القاعة", responsible: "لجنة الألعاب", icon: "Gamepad2", completed: false, maxPoints: 150 },

  // Day 2
  { id: "event2_wake", title: "صحيان", time: "08:00 AM - 08:30 AM", day: 2, location: "الغرف", responsible: "", icon: "Sun", completed: false },
  { id: "event2_1", title: "صلاة باكر", time: "08:30 AM - 09:00 AM", day: 2, location: "القاعة الرئيسية", responsible: "خدام الصلاة", icon: "Sun", completed: false },
  { id: "event2_hymn", title: "اللحن", time: "09:00 AM - 10:00 AM", day: 2, location: "القاعة الرئيسية", responsible: "خدام الألحان", icon: "Music", completed: false },
  { id: "event2_2", title: "فطار", time: "10:00 AM - 11:00 AM", day: 2, location: "المطعم", responsible: "لجنة التغذية", icon: "Smile", completed: false },
  { id: "event2_3", title: "دراسة كتاب يشوع بن سيراخ 48 و 49، يعقوب 1 ومسابقة على الدراسة", time: "11:00 AM - 12:00 PM", day: 2, location: "القاعة الرئيسية", responsible: "خدام دراسة الكتاب", icon: "BookOpen", completed: false, maxPoints: 100 },
  { id: "event2_4", title: "حلقة دوارة (شخصية + موضوع طقسي + عمل فني)", time: "12:00 PM - 01:30 PM", day: 2, location: "مجموعات العمل", responsible: "خدام الحلقات الدوارة", icon: "Users", completed: false, maxPoints: 150 },
  { id: "event2_5", title: "محاضرة: (الاحتراق النفسي)", time: "01:30 PM - 03:00 PM", day: 2, speaker: "أبونا رافائيل رمزي", location: "القاعة الرئيسية", responsible: "أبونا رافائيل رمزي", icon: "Compass", completed: false },
  { id: "event2_6", title: "الغداء", time: "03:00 PM - 04:00 PM", day: 2, location: "المطعم", responsible: "لجنة التغذية", icon: "Smile", completed: false },
  { id: "event2_7", title: "بيسين وحمام السباحة", time: "04:00 PM - 06:00 PM", day: 2, location: "البيسين", responsible: "لجنة الألعاب والأنشطة", icon: "Gamepad2", completed: false, maxPoints: 100 },
  { id: "event2_8", title: "شاور وراحة", time: "06:00 PM - 07:00 PM", day: 2, location: "الغرف", responsible: "", icon: "Sparkles", completed: false },
  { id: "event2_9", title: "صلاة الغروب ومحاضرة: (أقنوم الحكمة)", time: "07:00 PM - 09:00 PM", day: 2, speaker: "أ. ريمون", location: "القاعة الرئيسية", responsible: "أ. ريمون", icon: "Brain", completed: false },
  { id: "event2_10", title: "عشاء", time: "09:00 PM - 10:00 PM", day: 2, location: "المطعم", responsible: "لجنة التغذية", icon: "Smile", completed: false },
  { id: "event2_11", title: "لعبة الكنز و Escape Room", time: "10:00 PM - 12:00 AM", day: 2, location: "مقر المؤتمر", responsible: "لجنة الألعاب الكبرى", icon: "Trophy", completed: false, maxPoints: 200 }
];

export const INITIAL_SONGS: Song[] = [
  {
    id: "song_iso_slogan",
    title: "شعار مؤتمر ISO ٢٠٢٦ 🌟",
    lyrics: `١- أساس النجاح هو الإيمان بربنا يسوع
نور الكنيسة يقود خطانا
كلام الكتاب المقدس دا طريقنا للسماء
دا وعد من ربنا فرح مالوش انتهاء.
_________________________
٢- مش نجاح الدنيا دا غاية أو اختيار
دا نجاحنا في خدمة يسوع هوا القرار
جوه الكنيسة ترسم لينا المشوار
وفي حضنك ياربنا دا أجمل استقرار.`,
    youtubeUrl: ""
  },
  {
    id: "song_iso_1",
    title: "ترنيمة ١: يا قارئ كل تفاصيلي وخابرها",
    lyrics: `يا قارئ كل تفاصيلي وخابرها
يافاحص قلبي وضميري ياسيد الكون
ياعالم كل زلاتي ياساترها
بزلي جيت على بابك طلبت العون

ولو قصرت في امانتي هاتبقى امين
و لو سائت ف يوم حالتي ايديك بتعين
مفيش ولا حاجة راح تفصلني عن حبك
لا شدة لا ضيق تشوش عقلي عن فهمك

ف عمق الجب بصرخلك وبالجأ لك
الاقي جناح بيحملني برأفة و خير
ف بعدي اتوه ويرجع قلبي يشتاقلك
وصمتي يقول ولا كلمة واشوف تغيير

واعود من تاني واشهدلك علي الاحسان
يا اب حنون ومترائف علي الإنسان
لا موت ولا جوع ولا اخطار تخليني
ماشوفش صلاحك الكامل وبإطمئنان`,
    youtubeUrl: ""
  },
  {
    id: "song_iso_2",
    title: "ترنيمة ٢: سأدنو منك ياربي وألمس ثوبك الآن",
    lyrics: `١- سأدنو منك ياربي وألمس ثوبك الآن
لروحك حاجة القلب أعده إلي ملأن

القرار:
وإني الأن أقترب فمد يديك باركني
وروحي في تضطرب فضم الروح وأملكني

٢- تلفت وانظرن نفسي فبالإيمان ألمسك
وأكرم صاحب اللمس كثوب البر يلبسك

٣- إليك أجي يا شبعي ويا كنزي الذي يبقى
فقربك أعمق المتع هو الأحلى هو الأنقى

وإني الأن أمسكك بإيمان وإصرار
فباركني لأطلقك وأطلق فيك أشعاري`,
    youtubeUrl: ""
  }
];

export const INITIAL_ALHAN: CopticHymn[] = [
  {
    id: "alhan_shere_theotoke",
    title: "لحن شيري ثيؤطوكي بارثيني (افرحي يا والدة الإله العذراء)",
    occasion: "لحن مؤتمر ISO الرئيسي / التمجيد",
    copticText: `Ⲭⲉⲣⲉ Ⲑⲉⲟ̀ⲧⲟⲕⲉ ⲡⲁⲣⲑⲉⲛⲉ: ⲟⲩ ⲡ̀ⲣⲉⲥⲃⲉⲩⲟⲩⲥⲏ ⲩ̀ⲡⲉⲣ ⲧⲟⲩ ⲕⲟⲥⲙⲟⲩ: ⲧⲏⲛ ⲥⲱⲧⲏⲣⲓⲁⲛ ⲕⲉ ⲧⲟⲛ Ⲑⲉⲟⲛ ⲏ̀ⲙⲱⲛ: ⲡ̀ⲣⲟⲥ ⲫⲉⲣⲓⲛ ⲡⲁⲛⲧⲁ ⲧⲟⲛ ⲩ̀ⲙⲛⲟⲛ ⲏ̀ⲙⲱⲛ: ⲥⲉ ⲙⲉⲅⲁⲗⲩⲛⲟⲙⲉⲛ.
Ⲭⲉⲣⲉ Ⲑⲉⲟ̀ⲧⲟⲕⲉ ⲡⲁⲣⲑⲉⲛⲉ: ⲙⲏⲧⲏⲣ ⲧⲟⲩ Ⲉⲙⲙⲁⲛⲟⲩⲏⲗ: ϯⲥⲡⲏⲛⲁ ⲡⲓⲣⲟⲅⲁⲙⲉ.
Ⲭⲉⲣⲉ ϯⲧⲁⲝⲓⲥ ⲛ̀ⲁⲅⲅⲉⲗⲱⲛ: ⲭⲉⲣⲉ ϯⲡ̀ⲣⲟⲥⲧⲁⲥⲓⲁ ⲏ̀ⲙⲱⲛ: ⲧⲟⲩ ⲡⲁⲧⲣⲓ ⲕⲉ ⲧⲟⲛ Ⲑⲉⲟⲛ ⲏ̀ⲙⲱⲛ: ⲥⲉ ⲙⲉⲅⲁⲗⲩⲛⲟⲙⲉⲛ.
Ⲭⲉⲣⲉ Ⲑⲉⲟ̀ⲧⲟⲕⲉ ⲡⲁⲣⲑⲉⲛⲉ: ⲛ̀ⲑⲟⲕ Ⲫ̀ⲛⲟⲩϯ ϥ̀ⲉⲣϣⲁⲩ ⲛⲁⲕ: ⲛ̀ϫⲉ ⲡⲓϩⲱⲥ ϧⲉⲛ Ⲥⲓⲱⲛ: ⲉⲩⲉ̀ϯ ⲛⲁⲕ ⲛ̀ϩⲁⲛⲉⲩⲭⲏ ϧⲉⲛ Ⲓⲉⲣⲟⲩⲥⲁⲗⲏⲙ: ⲥⲉ ⲙⲉⲅⲁⲗⲩⲛⲟⲙⲉⲛ.
Ⲭⲉⲣⲉ ⲕⲉⲭⲁⲣⲓⲧⲱⲙⲉⲛⲏ Ⲙⲁⲣⲓⲁ: ⲟ̀ Ⲕⲩⲣⲓⲟⲥ ⲙⲉⲧⲁ ⲥⲟⲩ: ⲥⲉ ⲙⲉⲅⲁⲗⲩⲛⲟⲙⲉⲛ.`,
    copticArabicText: `شيرى ثيؤطوكى بارثينى: أو إبريس فيفوسى إيبير توكوزمو: تون سوتيريا كى تون ثيئون إن مون: إبروس فيرين بانتاطون إمنون إيمون: سى ميغالينومين.

شيرى ثيؤطوكى بارثينى: ميتير تو إممانوئيل: تيس بينا بى روغامى.

شيرى ثى إتطاكسيس إن أنجيلون: شيرى ثى إبروس تاسيا إيمون: تو بافرى كى تون ثيئون إيمون: سى ميغالينومين.

شيرى ثيؤطوكى بارثينى: إنثوك إفنوتى إف إير شاف ناك: إنجى بى جو خين سيون: إف إيتى ناك إنهان إفشى خين ييروساليم: سى ميغالينومين.

شيرى كى خاريتو مينى ماريا: أو كيريوس ميتاسو: سى ميغالينومين.`,
    arabicMeaning: `افرحي يا والدة الإله العذراء يا شفيعة في العالم عند المخلص إلهنا: نقدم له كل تسبيحنا و نعظمك.

افرحي يا والدة الإله العذراء والدة عمانوئيل يا غير مجربة بزواج.

افرحي يا طقس الملائكة: افرحي يا شفيعتنا عند الآب إلهنا نعظمك.

افرحي يا والدة الإله العذراء: أنت يا الله يجب لك التسبيح في صهيون: وتوفى لك النذور في أورشليم: نعظمك.

افرحي يا ممتلئة نعمة يا مريم الرب معك نعظمك.`,
    hazzatNotes: "لحن التمجيد والتسبيح المعتمد لمؤتمر ISO 2026 - يُرتل بنغمة وقورة ومتهللة.",
    audioUrl: "",
    duration: "2:45"
  }
];

export const INITIAL_QUIZ_QUESTIONS: QuizQuestion[] = [
  // أولاً: اختر الإجابة الصحيحة (MCQ)
  {
    id: "q1",
    section: "أولاً: اختر الإجابة الصحيحة",
    order: 1,
    type: "mcq",
    prompt: "الحكمة بنت بيتها من:",
    options: ["سبعة أعمدة", "خمسة أعمدة", "عشرة أعمدة", "ثلاثة أعمدة"],
    correctOptionIndex: 0
  },
  {
    id: "q2",
    section: "أولاً: اختر الإجابة الصحيحة",
    order: 2,
    type: "mcq",
    prompt: "ذبحت الحكمة:",
    options: ["خرافها", "ذبائحها", "عجولها", "طيورها"],
    correctOptionIndex: 1
  },
  {
    id: "q3",
    section: "أولاً: اختر الإجابة الصحيحة",
    order: 3,
    type: "mcq",
    prompt: "قالت الحكمة لناقصي الفهم أن يتركوا .................... فيحيوا.",
    options: ["الجبال", "الجهالات", "أبواب الهيكل", "الطعام"],
    correctOptionIndex: 1
  },
  {
    id: "q4",
    section: "أولاً: اختر الإجابة الصحيحة",
    order: 4,
    type: "mcq",
    prompt: "جلست المرأة الجاهلة عند:",
    options: ["باب بيتها", "كرسي في المدينة", "أبواب بيتها", "باب الهيكل"],
    correctOptionIndex: 0
  },
  {
    id: "q5",
    section: "أولاً: اختر الإجابة الصحيحة",
    order: 5,
    type: "mcq",
    prompt: "تنادى المرأة الجاهلة .................... المقومون طرقهم.",
    options: ["الحكماء", "الأخيلة", "عابري السبيل", "جواريها"],
    correctOptionIndex: 2
  },
  // ثانياً: أكمل الآيات (fill in the blank)
  {
    id: "q6",
    section: "ثانياً: أكمل الآيات",
    order: 6,
    type: "text",
    prompt: "الحكمة بنت بيتها، .................... أعمدتها.",
    referenceAnswer: "نحتت"
  },
  {
    id: "q7",
    section: "ثانياً: أكمل الآيات",
    order: 7,
    type: "text",
    prompt: "ذبحت ذبائحها، مزجت ....................",
    referenceAnswer: "خمرها"
  },
  {
    id: "q8",
    section: "ثانياً: أكمل الآيات",
    order: 8,
    type: "text",
    prompt: "أرسلت جواريها تنادي على ....................",
    referenceAnswer: "ظهور أعالي المدينة"
  },
  {
    id: "q9",
    section: "ثانياً: أكمل الآيات",
    order: 9,
    type: "text",
    prompt: "من يوخب مستهزئًا يكسب لنفسه ....................",
    referenceAnswer: "هوانًا"
  },
  {
    id: "q10",
    section: "ثانياً: أكمل الآيات",
    order: 10,
    type: "text",
    prompt: "وخب حكيمًا فيحبك، أعطِ حكيمًا ....................",
    referenceAnswer: "فيكون أوفر حكمة"
  },
  // ثالثاً: استخرج من الإصحاح العاشر (find the verse)
  {
    id: "q11",
    section: "ثالثاً: استخرج من الإصحاح العاشر",
    order: 11,
    type: "text",
    prompt: "آية تتحدث عن الابن الحكيم",
    referenceAnswer: "الابن الحكيم يسر أباه، والابن الجاهل حزن أمه."
  },
  {
    id: "q12",
    section: "ثالثاً: استخرج من الإصحاح العاشر",
    order: 12,
    type: "text",
    prompt: "آية تتحدث عن الكسل",
    referenceAnswer: "العامل بيد رخوة يفتقر، أما يد المجتهدين فتغني."
  },
  {
    id: "q13",
    section: "ثالثاً: استخرج من الإصحاح العاشر",
    order: 13,
    type: "text",
    prompt: "آية تتحدث عن المحبة",
    referenceAnswer: "البغضة تهيج خصومات، والمحبة تستر كل الذنوب."
  },
  {
    id: "q14",
    section: "ثالثاً: استخرج من الإصحاح العاشر",
    order: 14,
    type: "text",
    prompt: "آية تتحدث عن كثرة الكلام",
    referenceAnswer: "كثرة الكلام لا تخلو من معصية، أما الضابط شفتيه فعاقل."
  },
  {
    id: "q15",
    section: "ثالثاً: استخرج من الإصحاح العاشر",
    order: 15,
    type: "text",
    prompt: "آية تتحدث عن النميمة",
    referenceAnswer: "من يخفي البغضة فشفتاه كاذبتان، ومشيع المذمة هو جاهل."
  },
  // رابعاً: أسئلة تركيز (comprehension)
  {
    id: "q16",
    section: "رابعاً: أسئلة تركيز",
    order: 16,
    type: "text",
    prompt: "ماذا تستر المحبة؟",
    referenceAnswer: "كل الذنوب."
  },
  {
    id: "q17",
    section: "رابعاً: أسئلة تركيز",
    order: 17,
    type: "text",
    prompt: "متى يحصد العاقل؟",
    referenceAnswer: "العاقل يجمع في الصيف (وقت الحصاد) نتيجة ما تعب فيه طوال العام (ماديًا وروحيًا)."
  },
  {
    id: "q18",
    section: "رابعاً: أسئلة تركيز",
    order: 18,
    type: "text",
    prompt: "ماذا يحدث لمن ينام في الحصاد؟",
    referenceAnswer: "لن يحصد أي نتيجة لأنه ابن مخزٍ."
  },
  {
    id: "q19",
    section: "رابعاً: أسئلة تركيز",
    order: 19,
    type: "text",
    prompt: "متى تكون محبة المال شرًا، بحسب مبادئ الإصحاح؟",
    referenceAnswer: "عندما نحصل عليه عن طريق الشر (كنوز الشر لا تنفع)، ونبتعد عن طريق البر."
  },
  {
    id: "q20",
    section: "رابعاً: أسئلة تركيز",
    order: 20,
    type: "text",
    prompt: "أيهما أكثر ارتباطًا بالحكمة: كثرة الكلام أم ضبط اللسان؟",
    referenceAnswer: "ضبط اللسان، لأن ضابط شفتيه عاقل، أما كثرة الكلام لا تخلو من المعصية."
  }
];

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: "lesson_manual_day1",
    title: "ملخص دراسة كتاب اليوم الأول: نداء الحكمة ونداء الحماقة",
    speaker: "خدام دراسة الكتاب",
    day: 1,
    isStaffOnly: false,
    content: `ملخص دراسة كتاب اليوم الأول: نداء الحكمة ونداء الحماقة
مؤتمر ISO 2026

- الله يفرح بمن يطلب الحكمة.
- الحكمة هي الالتصاق بمصدر الحكمة.
- صفنيا (1: 7): "لأن الرب قد أعدّ ذبيحة" (الحكمة صفة أقنومية).
- الفكر المسيحي: الحكمة ليست كمّ معلومات.
- "مخافة الرب رأس المعرفة" (أمثال 1)، و"بدء الحكمة مخافة الله" (أمثال 9).
- الحكمة تجعلك تراجع خططك.
- علشان تعرف إن الحكمة بدأت فيك: في كل قرار، اسأل نفسك هل يرضي الله أم لا.
- بالحكمة والصلاة نتعلم مع من نتكلم، ومن نكتفي بالصلاة من أجله ("وبّخ الحكيم يحبك، الجاهل يبغضك").
- فرح الله بسليمان حين طلب الحكمة، أما رفقة فأحزن قلبها حماقة ابنها عيسو.
- البرّ ينجي من الموت: مثال نوح ومردخاي.
- من يتعلم الحكمة في شبابه لن يخجل وهو كبير السن.
- اللسان يقود الحياة: لو تقدّس اللسان بالتسبيح يتقدّس القلب؛ ما تقوله يفصح عمّا في قلبك.
- الجاهل يفعل الخطية بسرور لأنه أعمى.
- الشرير لا يعرف معنى السلام الداخلي مهما تظاهر بعكس ذلك؛ الشر مُهلك، والبرّ ينجي صاحبه.
- الكتاب المقدس لا يساند الكسلان.`
  },
  {
    id: "lesson_manual_day2",
    title: "دراسة كتاب اليوم الثاني: الحكمة في الكتاب المقدس",
    speaker: "خدام دراسة الكتاب",
    day: 2,
    isStaffOnly: false,
    content: `دراسة كتاب اليوم الثاني: الحكمة في الكتاب المقدس
مؤتمر ISO 2026

هل سألت نفسك يوماً كيف خُلق العالم، وكيف تدور الأفلاك في نظام عجيب؟ هل تعرف شيئاً عن الحكمة، وكيف كانت، ومتى بدأت في العالم؟

هل الحكمة لها بيت؟ وعلى أي أساس بُني هذا البيت؟
من هو الحكيم؟ وما الفرق بينه وبين الجاهل؟
لماذا يجب أن أبحث عن الحكمة وأقتنيها؟ وهل من فائدة تعود عليّ عندما أقتنيها؟ وهل تحدث فرقاً بيني وبين أصدقائي؟

إذا أردنا أن نقتني الحكمة، فتعالوا نُبحر بين ضفتي الكتاب المقدس لنتعرف على الحكمة، وكيف نطلبها، ومن القادر أن يعطينا إياها، وما الفرق بين الحكيم والجاهل.

تعالوا معاً في هذه الرحلة:
- نذهب إلى إيليا النبي الناري ونسأله عن الحكمة والغيرة على الله.
- نسأل نحميا، الإداري الجبار، الذي وضع بحكمته أسساً في علم الإدارة.
- لا ننسى أبيجايل، المرأة الحكيمة، التي حفظت بيتها بحكمتها في أشد اللحظات.
- نسأل موسى كيف عبر بالشعب الغليظ الرقبة البحر الأحمر وبرية سيناء بحكمة من عند الله.

تعالوا نتعرف معاً على معايير الحكمة كما جاءت في الكتاب المقدس.

أسئلة وتطبيقات للمجموعات:
س1: من هؤلاء الأبطال (إيليا، نحميا، أبيجايل، موسى)، من الأقرب إلى قلبك؟ ولماذا؟
س2: ما الفرق العملي بين تصرف الحكيم وتصرف الجاهل في موقف واجهته أنت شخصياً؟
س3: ما هي أول خطوة عملية تقدر تعملها هذا الأسبوع لتقتني الحكمة أكثر في حياتك؟`
  },
  {
    id: "lesson_lecture_day1_1",
    title: "محاضرة: (كونوا رجالاً) - أ. إيهاب",
    speaker: "أ. إيهاب",
    day: 1,
    isStaffOnly: false,
    content: `محاضرة اليوم الأول: كونوا رجالاً
المتحدث: أ. إيهاب
الآية المحورية: «اسْهَرُوا. اثْبُتُوا فِي الإِيمَانِ. كُونُوا رِجَالاً. تَقَوَّوْا.» (1 كو 16: 13)

المحاور الرئيسية:
١. الرجولة المسيحية ومفهومها الحقيقي: ليست في المظاهر ولا القوة الجسدية، بل في تحمل المسؤولية، الثبات على المبادئ، والضبط الذاتي.
٢. التحديات التي تواجه الشاب المعاصر: ضغوط الأقران، التردد، الهروب من المواجهة، والاستسلام للراحة والتأجيل.
٣. صفات الشاب المسيحي القوي:
   - ثبات في الإيمان في مواجهة التيارات.
   - شجاعة الاعتراف بالحق.
   - احترام النفس والآخرين والتعامل بنضج ووعي.`
  },
  {
    id: "lesson_lecture_day1_2",
    title: "محاضرة: (معايير الجودة ISO) - أ. أشرف & أ. عماد",
    speaker: "أ. أشرف / أ. عماد",
    day: 1,
    isStaffOnly: false,
    content: `محاضرة مؤتمر ISO: معايير الجودة الروحية والشخصية
المتحدثان: أ. أشرف & أ. عماد

شعار المؤتمر: ISO - International Standard of Excellence for Spiritual Life

المحاور الأساسية:
١. ما هو مفهوم ISO في حياتنا؟
   - معايير الجودة لا تقتصر على المؤسسات والشركات، بل تبدأ من داخل الإنسان: في الفكر، في العلاقات، وفي السلوك الروحي.
٢. فحص الجودة الذاتي (Self-Audit):
   - كيف تراجع معايير حياتك بانتظام؟
   - هل تضع أهدافاً وتلتزم بها أم تعيش بالعشوائية؟
٣. التطبيق العملي لمواصفات الجودة:
   - الصدق والشفافية.
   - إدارة الوقت واستثمار الطاقات.
   - التميز في الدراسة والخدمة وحياة الصلاة.`
  },
  {
    id: "lesson_lecture_day2_1",
    title: "محاضرة: (الاحتراق النفسي) - أبونا رافائيل رمزي",
    speaker: "أبونا رافائيل رمزي",
    day: 2,
    isStaffOnly: false,
    content: `محاضرة اليوم الثاني: الاحتراق النفسي (Burnout)
المتحدث: قدس أبونا رافائيل رمزي

مقدمة:
الضغوط المستمرة والإرهاق الذهني والنفسي يسببان ما يسمى بالاحتراق النفسي، حيث يشعر الشاب باستنزاف كامل لطاقته وفقدان الشغف.

عناصر المحاضرة:
١. أعراض الاحتراق النفسي:
   - الإجهاد المستمر وصعوبة التركيز.
   - سرعة الغضب أو الانعزال والشعور باللامبالاة.
   - تراجع الإنتاجية والإحساس بالعجز.
٢. أسباب الاحتراق النفسي عند الشباب:
   - التوقعات الزائدة والمثالية غير الواقعية.
   - عدم وضع حدود للوقت والراحة.
   - إهمال التغذية الروحية والسكينة الداخلية.
٣. العلاج والوقاية بنعمة المسيح:
   - طلب الراحة عند نبع النعمة: "تعالوا إليّ يا جميع المتعبين والثقيلي الأحمال وأنا أريحكم".
   - ترتيب الأولويات والتعلم على قول "لا" للأمور المستنزفة.
   - الموازنة الصحية بين الروح والنفس والجسد.`
  },
  {
    id: "lesson_lecture_day2_2",
    title: "محاضرة: (أقنوم الحكمة) - أ. ريمون",
    speaker: "أ. ريمون",
    day: 2,
    isStaffOnly: false,
    content: `محاضرة اليوم الثاني الختامية: أقنوم الحكمة
المتحدث: أ. ريمون

الموضوع اللاهوتي والروحي:
ربنا يسوع المسيح هو أقنوم الحكمة الإلهية المتجسد: «المسيح قوة الله وحكمة الله» (1 كو 1: 24).

المحاور:
١. الحكمة في العهد القديم وظلالها النبوية (سفر الأمثال وسفر الحكمة).
٢. تجسد الحكمة في ربنا يسوع المسيح وعلاقته بحياتنا اليومية.
٣. كيف نسلك بحكمة المسيح وسط تحديات العالم ونكون سفراء حقيقيين لمجده؟`
  },
  {
    id: "lesson_staff_admin",
    title: "📋 التعليمات التنظيمية وتوزيع المهام لمؤتمر ISO",
    speaker: "سكرتارية المؤتمر",
    day: 1,
    isStaffOnly: true,
    content: `خاص بالخدام والمنظمين فقط (توزيع العمل):

١. لجان التسكين وغرف المؤتمر:
- يرجى مراجعة كشوف توزيع الغرف والتأكد من تسكين جميع المشتركين فور وصولهم الساعة ١:٠٠ ظهراً.
- الخادم المسؤول عن مراجعة التسكين: أ. يوسف سمير وأ. شادي سامح.

٢. تسجيل النقاط والسكور (بوابة لوحة التحكم):
- يحق للخدام إضافة نقاط تشجيعية للفرق بناءً على: الالتزام بالمواعيد، المشاركة في الترانيم، النظافة في الغرف، والتفاعل في دراسة الكتاب والحلقات الدوارة.
- يرجى عدم المبالغة في توزيع النقاط للحفاظ على روح التنافس الشريف.
- يمنع تماماً خصم أي نقاط إلا بعد الرجوع لـ أ. مينا رزق (أمين الخدمة).

٣. أرقام الطوارئ والتنسيق:
- الإسعافات الأولية متوفرة في غرفة الخدام ١٠٣.
- أي مشكلة صحية أو تنظيمية، يرجى التواصل فوراً مع أمانة الخدمة.`
  }
];

export const INITIAL_ROOMS: Room[] = [
  // الدور الأول - بيانات حقيقية من مخطط توزيع الغرف
  // النوع والمبنى قيم مبدئية قابلة للتعديل من "تعديل الغرفة" في لوحة الأدمن
  { id: "room101", roomNumber: "١٠١", building: "مبنى الإقامة", floor: "الدور الأول", type: "boys", capacity: 6, occupants: [] },
  { id: "room102", roomNumber: "١٠٢", building: "مبنى الإقامة", floor: "الدور الأول", type: "boys", capacity: 6, occupants: [] },
  { id: "room103", roomNumber: "١٠٣", building: "مبنى الإقامة", floor: "الدور الأول", type: "girls", capacity: 6, occupants: [
    { name: "مريم فايز", role: "makhdooma" },
    { name: "جاسمين عوض", role: "makhdooma" },
    { name: "ميرفت عزيز", role: "khadema" },
    { name: "مريم نعمان", role: "khadema" }
  ] },
  { id: "room104", roomNumber: "١٠٤", building: "مبنى الإقامة", floor: "الدور الأول", type: "boys", capacity: 6, occupants: [
    { name: "كيرلس سعيد", role: "makhdoom" },
    { name: "ماريو اميل", role: "makhdoom" },
    { name: "بطرس بدر", role: "khadem" },
    { name: "عماد سليمان", role: "khadem" },
    { name: "اندرو ماجد", role: "makhdoom" }
  ] },
  { id: "room105", roomNumber: "١٠٥", building: "مبنى الإقامة", floor: "الدور الأول", type: "boys", capacity: 6, occupants: [
    { name: "مينا مرقس", role: "makhdoom" },
    { name: "مينا هاني", role: "makhdoom" },
    { name: "فادي عصام", role: "makhdoom" },
    { name: "مجدي عادل", role: "makhdoom" },
    { name: "مينا عادل", role: "khadem" },
    { name: "بيشوي مجدي", role: "khadem" }
  ] },
  { id: "room106", roomNumber: "١٠٦", building: "مبنى الإقامة", floor: "الدور الأول", type: "boys", capacity: 6, occupants: [
    { name: "رافي سعيد", role: "makhdoom" },
    { name: "كيرلس جرجس", role: "makhdoom" },
    { name: "بافلي عزمي", role: "makhdoom" },
    { name: "مارك عادل", role: "makhdoom" },
    { name: "كيرلس هاني", role: "makhdoom" },
    { name: "فيلوباتير سعيد", role: "makhdoom" }
  ] },
  { id: "room107", roomNumber: "١٠٧", building: "مبنى الإقامة", floor: "الدور الأول", type: "boys", capacity: 5, occupants: [
    { name: "ايهاب بطرس", role: "khadem" },
    { name: "طاسوني انجي", role: "khadema" },
    { name: "فادي ايهاب", role: "makhdoom" },
    { name: "مويرا ايهاب", role: "makhdooma" }
  ] },
  { id: "room108", roomNumber: "١٠٨", building: "مبنى الإقامة", floor: "الدور الأول", type: "boys", capacity: 3, occupants: [
    { name: "فادي منير", role: "khadem" },
    { name: "مارينا مكرم", role: "khadema" },
    { name: "دانيال فادي", role: "makhdoom" }
  ] },
  { id: "room109", roomNumber: "١٠٩", building: "مبنى الإقامة", floor: "الدور الأول", type: "girls", capacity: 6, occupants: [
    { name: "ندي ريمون", role: "makhdooma" },
    { name: "فيرينا فتح الله", role: "makhdooma" },
    { name: "جومانه ايهاب", role: "makhdooma" },
    { name: "مريم عماد", role: "makhdooma" },
    { name: "بربارة رجائي", role: "khadema" },
    { name: "جوليا جميل", role: "makhdooma" }
  ] },
  { id: "room110", roomNumber: "١١٠", building: "مبنى الإقامة", floor: "الدور الأول", type: "girls", capacity: 4, occupants: [
    { name: "كاترين حسني", role: "makhdooma" },
    { name: "جيسيكا نعيم", role: "makhdooma" },
    { name: "مريم بدر", role: "khadema" },
    { name: "نيرمين عبد التواب", role: "khadema" }
  ] },
  { id: "room111", roomNumber: "١١١", building: "مبنى الإقامة", floor: "الدور الأول", type: "girls", capacity: 6, occupants: [
    { name: "مارينا وديع", role: "makhdooma" },
    { name: "مونيكا وديع", role: "makhdooma" },
    { name: "ساندرا بهاء", role: "makhdooma" },
    { name: "ايريني اسامه", role: "makhdooma" },
    { name: "كارين مجدي", role: "makhdooma" },
    { name: "راندا عاطف", role: "khadema" }
  ] },
  { id: "room112", roomNumber: "١١٢", building: "مبنى الإقامة", floor: "الدور الأول", type: "girls", capacity: 6, occupants: [
    { name: "سوسنة عماد", role: "makhdooma" },
    { name: "مريم فايز", role: "makhdooma" },
    { name: "ماريا ماجد", role: "makhdooma" },
    { name: "كيريا سامح", role: "makhdooma" },
    { name: "ايريني فريد", role: "makhdooma" },
    { name: "مريم عياد", role: "khadema" }
  ] }
];

export const INITIAL_SCORE_LOGS: ScoreLog[] = [];

export async function resetAllTeamScoresToZero() {
  try {
    const batch = writeBatch(db);

    // Delete legacy demo logs if existing
    const logsRef = collection(db, "scoreLogs");
    const logsSnap = await getDocs(logsRef);
    logsSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    // Reset teams totalScore to 0
    const teamsRef = collection(db, "teams");
    const teamsSnap = await getDocs(teamsRef);
    if (!teamsSnap.empty) {
      teamsSnap.forEach((docSnap) => {
        batch.update(docSnap.ref, { totalScore: 0 });
      });
    } else {
      for (const t of DEFAULT_TEAMS) {
        const docRef = doc(db, "teams", t.id);
        batch.set(docRef, { ...t, totalScore: 0 });
      }
    }

    await batch.commit();
    console.log("Successfully reset all team scores to zero.");
  } catch (err) {
    console.error("Error resetting team scores:", err);
  }
}

export async function seedDatabaseIfEmpty(force: boolean = false) {
  try {
    const teamsRef = collection(db, "teams");
    const snapshot = await getDocs(teamsRef);
    
    // If teams is empty or if we are forcing a reset, seed the database
    if (snapshot.empty || force) {
      console.log(force ? "Forcing database reset and seeding..." : "Database is empty! Starting database seeding with ISO initial data...");
      
      const batch = writeBatch(db);
      
      // 1. Seed Teams with 0 score
      for (const t of DEFAULT_TEAMS) {
        const docRef = doc(db, "teams", t.id);
        batch.set(docRef, { ...t, totalScore: 0 });
      }

      // 2. Seed Schedule
      const schedRef = collection(db, "schedule");
      for (const ev of INITIAL_SCHEDULE) {
        const docRef = doc(db, "schedule", ev.id);
        batch.set(docRef, ev);
      }

      // 3. Seed Songs
      const songsRef = collection(db, "songs");
      for (const s of INITIAL_SONGS) {
        const docRef = doc(db, "songs", s.id);
        batch.set(docRef, s);
      }

      // 4. Seed Lessons
      const lessonsRef = collection(db, "lessons");
      for (const les of INITIAL_LESSONS) {
        const docRef = doc(db, "lessons", les.id);
        batch.set(docRef, les);
      }

      // 5. Seed Rooms
      const roomsRef = collection(db, "rooms");
      for (const r of INITIAL_ROOMS) {
        const docRef = doc(db, "rooms", r.id);
        batch.set(docRef, r);
      }

      // 6. Seed Conference Groups
      const confRef = collection(db, "conferenceGroups");
      for (const cg of INITIAL_CONFERENCE_GROUPS) {
        const docRef = doc(db, "conferenceGroups", cg.id);
        batch.set(docRef, cg);
      }

      await batch.commit();
      console.log("Database seeding completed successfully!");
    } else {
      console.log("Database already has data. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}


export async function seedConferenceGroupsIfEmpty() {
  try {
    const confRef = collection(db, "conferenceGroups");
    const snapshot = await getDocs(confRef);
    if (snapshot.empty) {
      console.log("Conference groups collection is empty. Seeding G1-G4...");
      const batch = writeBatch(db);
      for (const cg of INITIAL_CONFERENCE_GROUPS) {
        const docRef = doc(db, "conferenceGroups", cg.id);
        batch.set(docRef, cg);
      }
      await batch.commit();
      console.log("Conference groups seeded successfully!");
    }
  } catch (e) {
    console.error("Error seeding conference groups:", e);
  }
}

export async function seedQuizQuestionsIfEmpty() {
  try {
    const quizRef = collection(db, "quizQuestions");
    const snapshot = await getDocs(quizRef);
    if (snapshot.empty) {
      console.log("Quiz questions collection is empty. Seeding...");
      const batch = writeBatch(db);
      for (const q of INITIAL_QUIZ_QUESTIONS) {
        const docRef = doc(db, "quizQuestions", q.id);
        batch.set(docRef, q);
      }
      await batch.commit();
      console.log("Quiz questions seeded successfully!");
    }
  } catch (e) {
    console.error("Error seeding quiz questions:", e);
  }
}

export async function seedPrayersIfEmpty() {
  try {
    const prayersRef = collection(db, "prayers");
    const snapshot = await getDocs(prayersRef);
    if (snapshot.empty) {
      console.log("Prayers collection is empty. Seeding...");
      const batch = writeBatch(db);
      for (const p of INITIAL_PRAYERS) {
        const docRef = doc(db, "prayers", p.id);
        batch.set(docRef, p);
      }
      await batch.commit();
      console.log("Prayers seeded successfully!");
    }
  } catch (e) {
    console.error("Error seeding prayers:", e);
  }
}

export async function syncDay2ScheduleWithLatest() {
  try {
    const schedRef = collection(db, "schedule");
    const snapshot = await getDocs(schedRef);
    const batch = writeBatch(db);

    // Delete only existing Day 2 events, leave Day 1 untouched
    snapshot.forEach((docSnap) => {
      if (docSnap.data()?.day === 2) {
        batch.delete(docSnap.ref);
      }
    });

    // Re-add the current Day 2 schedule from the code
    const day2Events = INITIAL_SCHEDULE.filter((e) => e.day === 2);
    for (const ev of day2Events) {
      const docRef = doc(db, "schedule", ev.id);
      batch.set(docRef, ev);
    }

    await batch.commit();
    console.log("Day 2 schedule synced successfully!");
  } catch (e) {
    console.error("Error syncing Day 2 schedule:", e);
    throw e;
  }
}

// استعادة أسماء ونقط الفرق اللي ضاعت بسبب الباج القديم (من سجل النشاط بتاريخ ٢٧ أغسطس ٢٠٢٦).
// بترجع للفرق أسمائها الأصلية وتضيف لها النقط اللي كانت اتسجلت، بترتيب الفريق
// الثابت (team1-team4) بنفس الترتيب اللي كانت عليه الأسماء وقت تسجيل النقط.
export async function restoreLostPointsFromLog27Aug() {
  const restoreByOrder: { name: string; points: number }[] = [
    { name: "مدرسة عاشور", points: 15 },
    { name: "ايس كريم", points: 10 },
    { name: "ايس كوفي", points: 20 },
    { name: "بطاطس محمرة", points: 20 }
  ];

  try {
    const teamsRef = collection(db, "teams");
    const snapshot = await getDocs(teamsRef);
    const sorted = [...snapshot.docs].sort((a, b) => a.id.localeCompare(b.id));

    const batch = writeBatch(db);
    let matched = 0;

    sorted.forEach((docSnap, idx) => {
      if (idx < restoreByOrder.length) {
        const team = docSnap.data();
        const { name, points } = restoreByOrder[idx];
        const newScore = (team.totalScore || 0) + points;
        batch.set(docSnap.ref, { name, totalScore: newScore }, { merge: true });
        matched++;
      }
    });

    if (matched === 0) {
      throw new Error("لم يتم العثور على أي فريق لتحديث بياناته.");
    }

    await batch.commit();
    return matched;
  } catch (e) {
    console.error("Error restoring lost points:", e);
    throw e;
  }
}

export async function syncRoomsWithLatest() {
  try {
    const roomsRef = collection(db, "rooms");
    const snapshot = await getDocs(roomsRef);
    const batch = writeBatch(db);
    snapshot.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });
    for (const r of INITIAL_ROOMS) {
      const docRef = doc(db, "rooms", r.id);
      batch.set(docRef, r);
    }
    await batch.commit();
    console.log("Rooms synced with latest list successfully!");
  } catch (e) {
    console.error("Error syncing rooms:", e);
    throw e;
  }
}

// Initial primary admin account (username: MinaRezk).
// The password itself is never stored anywhere — only its SHA-256 hash.
export async function seedAdminUsersIfEmpty() {
  try {
    const adminsRef = collection(db, "adminUsers");
    const snapshot = await getDocs(adminsRef);
    if (snapshot.empty) {
      console.log("Admin users collection is empty. Seeding primary admin...");
      await setDoc(doc(db, "adminUsers", "admin_primary"), {
        username: "MinaRezk",
        passwordHash: "2ececbe3995a053dd783c0a6aef4c784a1d534eb7a2561142ddb1a6b2dac2fe6",
        createdAt: new Date().toISOString()
      });
      console.log("Primary admin seeded successfully!");
    }
  } catch (e) {
    console.error("Error seeding admin users:", e);
  }
}

export async function importDatabaseJSON(data: any) {
  if (!data || typeof data !== "object") {
    throw new Error("تنسيق الملف غير صالح!");
  }

  const batch = writeBatch(db);
  let itemCount = 0;

  if (Array.isArray(data.teams)) {
    for (const t of data.teams) {
      if (t.id) {
        batch.set(doc(db, "teams", t.id), t, { merge: true });
        itemCount++;
      }
    }
  }

  if (Array.isArray(data.schedule)) {
    for (const ev of data.schedule) {
      if (ev.id) {
        batch.set(doc(db, "schedule", ev.id), ev, { merge: true });
        itemCount++;
      }
    }
  }

  if (Array.isArray(data.songs)) {
    for (const s of data.songs) {
      if (s.id) {
        batch.set(doc(db, "songs", s.id), s, { merge: true });
        itemCount++;
      }
    }
  }

  if (Array.isArray(data.lessons)) {
    for (const les of data.lessons) {
      if (les.id) {
        batch.set(doc(db, "lessons", les.id), les, { merge: true });
        itemCount++;
      }
    }
  }

  if (Array.isArray(data.rooms)) {
    for (const r of data.rooms) {
      if (r.id) {
        batch.set(doc(db, "rooms", r.id), r, { merge: true });
        itemCount++;
      }
    }
  }

  if (Array.isArray(data.scoreLogs)) {
    for (const log of data.scoreLogs) {
      if (log.id) {
        batch.set(doc(db, "scoreLogs", log.id), log, { merge: true });
        itemCount++;
      }
    }
  }

  if (Array.isArray(data.conferenceGroups)) {
    for (const cg of data.conferenceGroups) {
      if (cg.id) {
        batch.set(doc(db, "conferenceGroups", cg.id), cg, { merge: true });
        itemCount++;
      }
    }
  }

  if (itemCount === 0) {
    throw new Error("لم يتم العثور على أية بيانات مطابقة لمؤتمر ISO في هذا الملف!");
  }

  await batch.commit();
  return itemCount;
}

export async function syncIsoScheduleAndLessons(force: boolean = false) {
  try {
    const schedRef = collection(db, "schedule");
    const schedSnap = await getDocs(schedRef);
    
    // Check if migration is needed (e.g. if Day 3/Day 4 events still exist or if schedule doesn't match ISO)
    const hasDay3Or4 = schedSnap.docs.some(d => (d.data()?.day > 2));
    const hasOldEvent = schedSnap.docs.some(d => d.data()?.title === "المولد" || d.data()?.title === "كورة" || d.data()?.title === "قداس");
    const isEmpty = schedSnap.empty;

    if (hasDay3Or4 || hasOldEvent || isEmpty || force) {
      console.log("Updating Firestore schedule to ISO 2-Day Conference schedule...");
      const batch = writeBatch(db);
      
      // Delete old schedule docs
      schedSnap.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      
      // Add new ISO schedule
      for (const ev of INITIAL_SCHEDULE) {
        const docRef = doc(db, "schedule", ev.id);
        batch.set(docRef, ev);
      }
      
      // Update lessons
      const lessonsRef = collection(db, "lessons");
      const lessonsSnap = await getDocs(lessonsRef);
      lessonsSnap.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      for (const les of INITIAL_LESSONS) {
        const docRef = doc(db, "lessons", les.id);
        batch.set(docRef, les);
      }

      // Sync songs
      const songsRef = collection(db, "songs");
      const songsSnap = await getDocs(songsRef);
      for (const song of INITIAL_SONGS) {
        const exists = songsSnap.docs.some(d => d.id === song.id || d.data()?.title === song.title);
        if (!exists) {
          const docRef = doc(db, "songs", song.id);
          batch.set(docRef, song);
        }
      }

      // Sync alhan (ensure only initial alhan exist)
      const alhanRef = collection(db, "alhan");
      const alhanSnap = await getDocs(alhanRef);
      alhanSnap.docs.forEach(docSnap => {
        const isAllowed = INITIAL_ALHAN.some(h => h.id === docSnap.id);
        if (!isAllowed) {
          batch.delete(docSnap.ref);
        }
      });
      for (const hymn of INITIAL_ALHAN) {
        const docRef = doc(db, "alhan", hymn.id);
        batch.set(docRef, hymn);
      }

      await batch.commit();
      console.log("Firestore successfully updated to ISO 2-Day schedule, lessons, songs, and alhan!");
    } else {
      // Check each song in INITIAL_SONGS individually
      const songsRef = collection(db, "songs");
      const songsSnap = await getDocs(songsRef);
      for (const song of INITIAL_SONGS) {
        const exists = songsSnap.docs.some(d => d.id === song.id || d.data()?.title === song.title);
        if (!exists) {
          await setDoc(doc(db, "songs", song.id), song);
        }
      }

      // Sync alhan: delete removed hymns and ensure INITIAL_ALHAN exists
      const alhanRef = collection(db, "alhan");
      const alhanSnap = await getDocs(alhanRef);
      for (const docSnap of alhanSnap.docs) {
        const isAllowed = INITIAL_ALHAN.some(h => h.id === docSnap.id);
        if (!isAllowed) {
          await deleteDoc(docSnap.ref);
        }
      }
      for (const hymn of INITIAL_ALHAN) {
        await setDoc(doc(db, "alhan", hymn.id), hymn, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error syncing ISO schedule and lessons:", err);
  }
}


