const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove the early return
content = content.replace(
  'if (!navigator.onLine) { console.log("Offline mode: skipping migrations and seeding."); return; } await seedDatabaseIfEmpty();',
  'if (!navigator.onLine) { console.log("Offline mode: skipping migrations and seeding."); } else { await seedDatabaseIfEmpty(); }'
);

fs.writeFileSync('src/App.tsx', content);
