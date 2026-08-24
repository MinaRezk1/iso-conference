const fs = require('fs');

const fileContent = fs.readFileSync('src/lib/seedData.ts', 'utf-8');

const newSchedule = `export const INITIAL_SCHEDULE: EventSchedule[] = [
  // Day 1
  { id: "event1_1", title: "قداس", time: "04:45 AM - 07:00 AM", day: 1, location: "الأنبا رويس", responsible: "كل الخدام", icon: "BookOpen", completed: false },
  { id: "event1_2", title: "تجمع + تحرك", time: "07:00 AM - 08:00 AM", day: 1, location: "ميدان التحرك", responsible: "كل الخدام", icon: "Bus", completed: false },
  { id: "event1_3", title: "دراسة الكتاب", time: "11:00 AM - 12:00 PM", day: 1, location: "قاعة + كافيتريا", responsible: "شادي سامح (مج1: شادي/كيرلس، مج2: مينا/حسن)", icon: "BookOpen", completed: false },
  { id: "event1_4", title: "ورش عمل", time: "12:00 PM - 01:00 PM", day: 1, location: "رووف", responsible: "بولا + هاني + كيرلس + مينا م. + مينا أ.", icon: "Users", completed: false },
  { id: "event1_5", title: "استلام الغرف", time: "01:00 PM - 02:00 PM", day: 1, location: "مكتب التسكين", responsible: "يوسف سمير + شادي سامح", icon: "DoorOpen", completed: false },
  { id: "event1_6", title: "Pool + Hand Ball", time: "01:00 PM - 03:00 PM", day: 1, location: "حمام السباحة", responsible: "مينا ابو اليمين", icon: "Gamepad2", completed: false },
  { id: "event1_7", title: "shower", time: "03:00 PM - 03:30 PM", day: 1, location: "الغرف", responsible: "", icon: "Sparkles", completed: false },
  { id: "event1_8", title: "الغداء + لبس كورة", time: "03:30 PM - 04:30 PM", day: 1, location: "المطعم", responsible: "كيرلس وفيق", icon: "Smile", completed: false },
  { id: "event1_9", title: "المحاضرة (1)", time: "04:30 PM - 05:30 PM", day: 1, location: "القاعة", responsible: "", icon: "Compass", completed: false },
  { id: "event1_10", title: "صلاة الغروب", time: "05:30 PM - 06:00 PM", day: 1, location: "الجزء أمام الكافيتريا", responsible: "اشرف عزت", icon: "Sun", completed: false },
  { id: "event1_11", title: "كورة", time: "06:00 PM - 08:00 PM", day: 1, location: "الملعب", responsible: "مينا مجدي + ناجي وليم", icon: "Trophy", completed: false },
  { id: "event1_12", title: "shower", time: "08:00 PM - 08:30 PM", day: 1, location: "الغرف", responsible: "", icon: "Sparkles", completed: false },
  { id: "event1_13", title: "راحة", time: "08:30 PM - 09:00 PM", day: 1, location: "", responsible: "", icon: "Moon", completed: false },
  { id: "event1_14", title: "العشاء", time: "09:00 PM - 09:30 PM", day: 1, location: "قاعة", responsible: "جوني", icon: "Smile", completed: false },
  { id: "event1_15", title: "العاب (volley+baseball)", time: "09:30 PM - 11:00 PM", day: 1, location: "الملعب", responsible: "يوسف.س+كيرلس.ر+مينا.م+بطرس+جوني+فادى", icon: "Gamepad2", completed: false },
  { id: "event1_16", title: "دورى American", time: "11:00 PM - 12:30 AM", day: 1, location: "الملعب", responsible: "يوسف.س+كيرلس.ر+مينا.م+بطرس+جوني+فادى", icon: "Trophy", completed: false },

  // Day 2
  { id: "event2_1", title: "صحيان", time: "08:00 AM - 08:30 AM", day: 2, location: "الغرف", responsible: "كيرلس وفيق + جوني اديب", icon: "Sun", completed: false },
  { id: "event2_2", title: "باكر", time: "08:30 AM - 09:00 AM", day: 2, location: "الجزء أمام الكافيتريا", responsible: "اشرف عزت", icon: "Sparkles", completed: false },
  { id: "event2_3", title: "فطار", time: "09:00 AM - 09:30 AM", day: 2, location: "المطعم", responsible: "ناجي وليم", icon: "Smile", completed: false },
  { id: "event2_4", title: "دراسة الكتاب", time: "09:30 AM - 10:30 AM", day: 2, location: "قاعة + جزء أمام الكافيتريا", responsible: "تحضير: ماريو عريان", icon: "BookOpen", completed: false },
  { id: "event2_5", title: "ورش عمل", time: "10:30 AM - 11:30 AM", day: 2, location: "رووف", responsible: "بولا + هاني + كيرلس + مينا م. + مينا أ.", icon: "Users", completed: false },
  { id: "event2_6", title: "Pool + Hand Ball", time: "11:30 AM - 01:00 PM", day: 2, location: "حمام السباحة", responsible: "مينا ابو اليمين", icon: "Gamepad2", completed: false },
  { id: "event2_7", title: "SHOWER", time: "01:00 PM - 01:30 PM", day: 2, location: "الغرف", responsible: "", icon: "Sparkles", completed: false },
  { id: "event2_8", title: "راحة", time: "01:30 PM - 02:00 PM", day: 2, location: "", responsible: "", icon: "Moon", completed: false },
  { id: "event2_9", title: "الغداء + لبس كورة", time: "02:00 PM - 03:00 PM", day: 2, location: "المطعم", responsible: "باسم سعيد", icon: "Smile", completed: false },
  { id: "event2_10", title: "المحاضرة (2)", time: "03:00 PM - 04:00 PM", day: 2, location: "القاعة", responsible: "", icon: "Compass", completed: false },
  { id: "event2_11", title: "صلاة الغروب", time: "04:00 PM - 04:30 PM", day: 2, location: "الجزء أمام الكافيتريا", responsible: "كيرلس وفيق", icon: "Sun", completed: false },
  { id: "event2_12", title: "كورة", time: "04:30 PM - 07:30 PM", day: 2, location: "الملعب", responsible: "مينا مجدي + ناجي وليم", icon: "Trophy", completed: false },
  { id: "event2_13", title: "راحة", time: "07:30 PM - 08:00 PM", day: 2, location: "", responsible: "", icon: "Moon", completed: false },
  { id: "event2_14", title: "لعبة الجريمة", time: "08:00 PM - 09:30 PM", day: 2, location: "الملعب", responsible: "حسني + مينا + جوني + يوسف", icon: "Gamepad2", completed: false },
  { id: "event2_15", title: "العشاء", time: "09:30 PM - 10:00 PM", day: 2, location: "قاعة", responsible: "بولا صفوت", icon: "Smile", completed: false },
  { id: "event2_16", title: "المولد", time: "10:00 PM - 12:30 AM", day: 2, location: "الملعب", responsible: "باسم+ناجي+جوني+مينا+حسني+كيرلس", icon: "Sparkles", completed: false },

  // Day 3
  { id: "event3_1", title: "صحيان", time: "07:30 AM - 08:00 AM", day: 3, location: "الغرف", responsible: "شادي سامح + هاني حربي", icon: "Sun", completed: false },
  { id: "event3_2", title: "باكر", time: "08:00 AM - 09:00 AM", day: 3, location: "الجزء أمام الكافيتريا", responsible: "ماريو عريان", icon: "Sparkles", completed: false },
  { id: "event3_3", title: "فطار", time: "09:00 AM - 09:30 AM", day: 3, location: "المطعم", responsible: "بطرس بدر", icon: "Smile", completed: false },
  { id: "event3_4", title: "دراسة الكتاب", time: "09:30 AM - 10:30 AM", day: 3, location: "قاعة + جزء أمام الكافيتريا", responsible: "تحضير: هاني حربي", icon: "BookOpen", completed: false },
  { id: "event3_5", title: "ورش عمل", time: "10:30 AM - 11:30 AM", day: 3, location: "رووف", responsible: "بولا + هاني + كيرلس + مينا م. + مينا أ.", icon: "Users", completed: false },
  { id: "event3_6", title: "Pool + Hand Ball", time: "11:30 AM - 02:00 PM", day: 3, location: "حمام السباحة", responsible: "مينا ابو اليمين", icon: "Gamepad2", completed: false },
  { id: "event3_7", title: "SHOWER", time: "02:00 PM - 02:30 PM", day: 3, location: "الغرف", responsible: "", icon: "Sparkles", completed: false },
  { id: "event3_8", title: "راحة", time: "02:30 PM - 03:00 PM", day: 3, location: "", responsible: "", icon: "Moon", completed: false },
  { id: "event3_9", title: "الغداء + لبس كورة", time: "03:00 PM - 04:00 PM", day: 3, location: "المطعم", responsible: "يوسف سمير", icon: "Smile", completed: false },
  { id: "event3_10", title: "المحاضرة (3)", time: "04:00 PM - 05:00 PM", day: 3, location: "القاعة", responsible: "", icon: "Compass", completed: false },
  { id: "event3_11", title: "صلاة الغروب", time: "05:00 PM - 05:30 PM", day: 3, location: "الجزء أمام الكافيتريا", responsible: "", icon: "Sun", completed: false },
  { id: "event3_12", title: "كورة", time: "05:30 PM - 07:30 PM", day: 3, location: "الملعب", responsible: "", icon: "Trophy", completed: false },
  { id: "event3_13", title: "راحة + Shower", time: "07:30 PM - 08:30 PM", day: 3, location: "", responsible: "", icon: "Moon", completed: false },
  { id: "event3_14", title: "اسكتشات", time: "08:30 PM - 09:30 PM", day: 3, location: "الروف", responsible: "امجد ايميل + هاني حربي", icon: "Smile", completed: false },
  { id: "event3_15", title: "العشاء", time: "09:30 PM - 10:00 PM", day: 3, location: "المطعم", responsible: "مينا ابو اليمين", icon: "Smile", completed: false },
  { id: "event3_16", title: "الكنز", time: "10:00 PM - 12:30 AM", day: 3, location: "", responsible: "مينا معوض + مينا ابو اليمين", icon: "Gamepad2", completed: false },
  
  // Day 4
  { id: "event4_1", title: "صحيان + تسليم غرف", time: "07:30 AM - 08:30 AM", day: 4, location: "", responsible: "", icon: "Sun", completed: false },
  { id: "event4_2", title: "باكر", time: "08:30 AM - 09:00 AM", day: 4, location: "الجزء أمام الكافيتريا", responsible: "", icon: "Sparkles", completed: false },
  { id: "event4_3", title: "فطار", time: "09:00 AM - 09:30 AM", day: 4, location: "المطعم", responsible: "", icon: "Smile", completed: false },
  { id: "event4_4", title: "حفلة الختام", time: "09:30 AM - 11:00 AM", day: 4, location: "قاعة + جزء امام الكافيتريا", responsible: "", icon: "Sparkles", completed: false },
];`;

const startIdx = fileContent.indexOf('export const INITIAL_SCHEDULE');
const endIdx = fileContent.indexOf('export const INITIAL_LESSONS');

if (startIdx !== -1 && endIdx !== -1) {
    const updatedContent = fileContent.substring(0, startIdx) + newSchedule + "\n\n" + fileContent.substring(endIdx);
    fs.writeFileSync('src/lib/seedData.ts', updatedContent);
    console.log("Successfully replaced INITIAL_SCHEDULE.");
} else {
    console.log("Could not find boundaries.");
}
