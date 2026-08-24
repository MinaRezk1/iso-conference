import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  deleteDoc,
  doc, 
  writeBatch 
} from "firebase/firestore";
import { Team, EventSchedule, Song, CopticHymn, Lesson, Room, ScoreLog, ConferenceGroup } from "../types";

export const INITIAL_CONFERENCE_GROUPS: ConferenceGroup[] = [
  {
    id: "g1",
    name: "المجموعة الأولى (G1)",
    code: "G1",
    color: "#10b981",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    members: [
      { id: "g1_1", name: "يوسف نحميا" },
      { id: "g1_2", name: "كيرلس اسامة" },
      { id: "g1_3", name: "جوناثان ياسر" },
      { id: "g1_4", name: "أبانوب مايكل" },
      { id: "g1_5", name: "أنطونيوس سامح" },
      { id: "g1_6", name: "كيرلس ماجد" },
      { id: "g1_7", name: "بولا مايكل" },
      { id: "g1_8", name: "أبانوب هاني" },
    ]
  },
  {
    id: "g2",
    name: "المجموعة الثانية (G2)",
    code: "G2",
    color: "#8b5cf6",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    members: [
      { id: "g2_1", name: "مينا مايكل" },
      { id: "g2_2", name: "إبرام داوود" },
      { id: "g2_3", name: "مرقس معوض" },
      { id: "g2_4", name: "أندرو صفوت" },
      { id: "g2_5", name: "أنطون طارق" },
      { id: "g2_6", name: "ديفيد سامح" },
      { id: "g2_7", name: "ماركو عاطف" },
      { id: "g2_8", name: "مينا هاني" },
    ]
  },
  {
    id: "g3",
    name: "المجموعة الثالثة (G3)",
    code: "G3",
    color: "#f59e0b",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    members: [
      { id: "g3_1", name: "ماريو وائل" },
      { id: "g3_2", name: "يوسف جورج" },
      { id: "g3_3", name: "فادي إيهاب" },
      { id: "g3_4", name: "نوفير جورج" },
      { id: "g3_5", name: "توني سعيد" },
      { id: "g3_6", name: "جيوفاني هاني" },
      { id: "g3_7", name: "جورج شريف" },
      { id: "g3_8", name: "مينا جرجس" },
    ]
  },
  {
    id: "g4",
    name: "المجموعة الرابعة (G4)",
    code: "G4",
    color: "#f43f5e",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    members: [
      { id: "g4_1", name: "بولا ياسر" },
      { id: "g4_2", name: "أنطونيوس سمير" },
      { id: "g4_3", name: "أبانوب داوود" },
      { id: "g4_4", name: "جيوفاني مايكل" },
      { id: "g4_5", name: "جوسيان جرجس" },
      { id: "g4_6", name: "فيلوباتير خلف" },
      { id: "g4_7", name: "أبانوب إيليا" },
      { id: "g4_8", name: "جرجس نبيل" },
    ]
  }
];

export const DEFAULT_TEAMS: Team[] = [
  { 
    id: "team1", 
    name: "بصمة أمل", 
    color: "#f43f5e", 
    bgColor: "bg-rose-50 dark:bg-rose-950/20", 
    borderColor: "border-rose-200 dark:border-rose-900", 
    logo: "🔴",
    totalScore: 0
  },
  { 
    id: "team2", 
    name: "بصمة حب", 
    color: "#8b5cf6", 
    bgColor: "bg-violet-50 dark:bg-violet-950/20", 
    borderColor: "border-violet-200 dark:border-violet-900", 
    logo: "🟣",
    totalScore: 0
  },
  { 
    id: "team3", 
    name: "بصمة نور", 
    color: "#f59e0b", 
    bgColor: "bg-amber-50 dark:bg-amber-950/20", 
    borderColor: "border-amber-200 dark:border-amber-900", 
    logo: "🟡",
    totalScore: 0
  },
  { 
    id: "team4", 
    name: "بصمة حياة", 
    color: "#10b981", 
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20", 
    borderColor: "border-emerald-200 dark:border-emerald-900", 
    logo: "🟢",
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
  { id: "event2_1", title: "صلاة باكر", time: "09:00 AM - 10:00 AM", day: 2, location: "القاعة الرئيسية", responsible: "خدام الصلاة", icon: "Sun", completed: false },
  { id: "event2_2", title: "فطار", time: "10:00 AM - 11:00 AM", day: 2, location: "المطعم", responsible: "لجنة التغذية", icon: "Smile", completed: false },
  { id: "event2_3", title: "دراسة كتاب يشوع بن سيراخ 48 و 49 ومسابقة على الدراسة", time: "11:00 AM - 12:00 PM", day: 2, location: "القاعة الرئيسية", responsible: "خدام دراسة الكتاب", icon: "BookOpen", completed: false, maxPoints: 100 },
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

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: "lesson_manual_day1",
    title: "دراسة كتاب اليوم الأول: سفر الأمثال (أصحاح 9 و 10)",
    speaker: "خدام دراسة الكتاب",
    day: 1,
    isStaffOnly: false,
    content: `دراسة كتاب اليوم الأول: سفر الأمثال (أصحاح 9 و 10)
مؤتمر ISO 2026

الهدف:
الهدف من دراسة سفر الأمثال أصحاحي 9 و 10 هو إدراك مفهوم الحكمة الحقيقية وكيف نبني حياتنا على أساس سليم كمعيار جودة حقيقي (ISO) لحياة الشاب المسيحي.

أولاً: مقارنة بين وليمة الحكمة ووليمة الحماقة (أمثال 9):
- الحكمة بنت بيتها ونحتت أعمدتها السبعة وذبحت ذبحها ومزجت خمرها ورتبت مائدتها (أم 9: 1-2).
- دعوة الحكمة: "من هو جاهل فليمل إلى هنا، وللناقص الفهم قالت: تعالوا كلوا من طعامي واشربوا من الخمر التي مزجتها. اتركوا الجهالات فتحيوا، وسيروا في طريق الفهم" (أم 9: 4-6).
- في المقابل المرأة الحمقاء الصخابة الجاهلة التي تنادي العابرين قائلة: "المياه المسروقة حلوة وخبز الخفية لذيذ، ولا يعلم أن الأخيلة هناك وأن في أعماق الهاوية ضيوفها" (أم 9: 17-18).

ثانياً: معايير السلوك والبركة في الحياة العملية (أمثال 10):
- "الابن الحكيم يسر أباه والابن الجاهل حزن أمه" (أم 10: 1).
- "كنوز الشر لا تنفع، أما البر فينجي من الموت" (أم 10: 2).
- "العامل بيد رخوة يفتقر، أما يد المجتهدين فتغني" (أم 10: 4).
- "بركة الرب هي تغني ولا يزيد معها تعباً" (أم 10: 22).

أسئلة وتطبيقات للمجموعات:
س1: ما هي الأعمدة السبعة التي تبني بها الحكمة بيتها في حياتك؟
س2: كيف تفرق بين دعوة الحكمة الحقيقية والإغراءات الزائفة في العالم المحيط بك؟
س3: استخرج 3 آيات من أصحاح 10 تمثل معايير واضحة لسلوكيات الشاب الناجح مع الله.`
  },
  {
    id: "lesson_manual_day2",
    title: "دراسة كتاب اليوم الثاني: سفر يشوع بن سيراخ (أصحاح 48 و 49)",
    speaker: "خدام دراسة الكتاب",
    day: 2,
    isStaffOnly: false,
    content: `دراسة كتاب اليوم الثاني: سفر يشوع بن سيراخ (أصحاح 48 و 49)
مؤتمر ISO 2026

الهدف:
استعراض نماذج الأبطال ورجال الله القديسين (إيليا، إليشع، حزقيا، إشعياء، يوشيا، زربابل، يشوع بن يوصاداق، ونحميا) كمعايير حية للشهادة والأمانة في خدمة الله.

أولاً: أبطال الإيمان في أصحاح 48:
- إيليا النبي الناري: "وقام إيليا النبي كالنار وتوقد كلامه كالمشعل" (سيراخ 48: 1).
- إليشع النبي وقوة الروح المضاعفة: "ولما توارى إيليا في العاصفة، امتلك إليشع روحه، وفي أيامه لم يتزعزع من ذي سلطان ولم يستولِ عليه أحد" (سيراخ 48: 12-13).
- حزقيا الملك وإشعياء النبي: ثبات الإيمان في وقت الحصار والضيقة ونجاة أورشليم.

ثانياً: قادة التجديد والإصلاح في أصحاح 49:
- يوشيا الملك: ذكر يوشيا كتركيب البخور المستطاب، كيف وجه قلبه إلى الرب في أيام الأثمة.
- إرميا وحزقيال وزربابل ونحميا: إعادة بناء الأسوار وترميم الهيكل والتمسك بالعهد الإلهي.

تأملات وأسئلة عملية:
س1: كيف أوقد إيليا كلامه كالمشعل؟ وكيف يكون كلامك وشاهدتك للرب مشعل نور وسط جيلك؟
س2: ما هي الصفة المشتركة بين قادة الإصلاح في أصحاح 49 التي نحتاجها اليوم في كنيستنا وحياتنا؟`
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
  // Boys Rooms (1st Floor)
  {
    id: "room101",
    roomNumber: "١٠١ (أولاد)",
    building: "مبنى مارمرقس",
    floor: "الدور الأول",
    type: "boys",
    capacity: 4,
    occupants: [
      { name: "مينا رأفت نعيم", role: "boy" },
      { name: "بيتر سامح فايز", role: "boy" },
      { name: "أنطونيوس مجدي", role: "boy" }
    ]
  },
  {
    id: "room102",
    roomNumber: "١٠٢ (أولاد)",
    building: "مبنى مارمرقس",
    floor: "الدور الأول",
    type: "boys",
    capacity: 4,
    occupants: [
      { name: "فادي غالي لبيب", role: "boy" },
      { name: "يوسف شريف نجيب", role: "boy" },
      { name: "مارك إدوارد", role: "boy" },
      { name: "كيرلس أيمن", role: "boy" }
    ]
  },
  {
    id: "room103",
    roomNumber: "١٠٣ (خدام أولاد)",
    building: "مبنى مارمرقس",
    floor: "الدور الأول",
    type: "servants",
    capacity: 3,
    occupants: [
      { name: "أ. مينا مسيحة", role: "servant" },
      { name: "أ. مايكل عاطف", role: "servant" }
    ]
  },

  // Boys & Servants Rooms (2nd Floor)
  {
    id: "room201",
    roomNumber: "٢٠١ (أولاد)",
    building: "مبنى الأنبا أنطونيوس",
    floor: "الدور الثاني",
    type: "boys",
    capacity: 4,
    occupants: [
      { name: "ماركو هاني صبري", role: "boy" },
      { name: "استيفان رأفت شفيق", role: "boy" },
      { name: "ماريو عماد فؤاد", role: "boy" }
    ]
  },
  {
    id: "room202",
    roomNumber: "٢٠٢ (أولاد)",
    building: "مبنى الأنبا أنطونيوس",
    floor: "الدور الثاني",
    type: "boys",
    capacity: 4,
    occupants: [
      { name: "جون سمير حليم", role: "boy" },
      { name: "كيرلس مدحت", role: "boy" },
      { name: "مارتن هاني", role: "boy" },
      { name: "دانيال وجيه", role: "boy" }
    ]
  },
  {
    id: "room203",
    roomNumber: "٢٠٣ (خدام)",
    building: "مبنى الأنبا أنطونيوس",
    floor: "الدور الثاني",
    type: "servants",
    capacity: 3,
    occupants: [
      { name: "أ. بيشوي فريد", role: "servant" },
      { name: "أ. مينا عادل", role: "servant" }
    ]
  }
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


