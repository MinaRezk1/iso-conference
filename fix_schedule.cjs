const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleView.tsx', 'utf-8');

// 1. Remove event.responsible block entirely from rendering
content = content.replace(/\{event\.responsible && \([\s\S]*?<\/span>\\s*<\/span>\\s*\)\}/g, '');

// 2. Add Arabic time formatting and event active check
const helpers = `
const formatArabicTime = (timeStr: string) => {
  return timeStr.replace(/AM/gi, 'ص').replace(/PM/gi, 'م');
};

const isEventActive = (timeRange: string) => {
  const parts = timeRange.split('-');
  if (parts.length !== 2) return false;
  
  const parseTime = (t: string) => {
    const match = t.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
    if (!match) return 0;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const isPM = match[3].toUpperCase() === 'PM';
    if (h === 12) h = isPM ? 12 : 0;
    else if (isPM) h += 12;
    return h * 60 + m;
  };

  const startMins = parseTime(parts[0].trim());
  let endMins = parseTime(parts[1].trim());
  if (endMins < startMins) endMins += 24 * 60; // handle midnight cross

  const now = new Date();
  let currentMins = now.getHours() * 60 + now.getMinutes();
  
  if (currentMins < 6 * 60 && startMins > 18 * 60) {
    currentMins += 24 * 60;
  }

  return currentMins >= startMins && currentMins <= endMins;
};
`;

// Insert helpers before IconMap
content = content.replace('const IconMap:', helpers + '\nconst IconMap:');

fs.writeFileSync('src/components/ScheduleView.tsx', content);
