const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace all migration console.errors with a check for offline
content = content.replace(/console\.error\("Failed to run song1 live-update check:", migrationErr\);/g, 'if (migrationErr.code !== "unavailable") { console.error("Failed to run song1 live-update check:", migrationErr); } else { console.log("Skipping song1 migration because client is offline."); }');

content = content.replace(/console\.error\("Failed to delete song3 from Firestore:", song3Err\);/g, 'if (song3Err.code !== "unavailable") { console.error("Failed to delete song3 from Firestore:", song3Err); } else { console.log("Skipping song3 migration because client is offline."); }');

content = content.replace(/console\.error\("Failed to run song2 live-update check:", song2MigrationErr\);/g, 'if (song2MigrationErr.code !== "unavailable") { console.error("Failed to run song2 live-update check:", song2MigrationErr); } else { console.log("Skipping song2 migration because client is offline."); }');

content = content.replace(/console\.error\("Failed to run schedule self-healing migration:", schedMigrationErr\);/g, 'if (schedMigrationErr.code !== "unavailable") { console.error("Failed to run schedule self-healing migration:", schedMigrationErr); } else { console.log("Skipping schedule migration because client is offline."); }');

content = content.replace(/console\.error\("Failed to run lessons self-healing migration:", lessonsMigrationErr\);/g, 'if (lessonsMigrationErr.code !== "unavailable") { console.error("Failed to run lessons self-healing migration:", lessonsMigrationErr); } else { console.log("Skipping lessons migration because client is offline."); }');

// Add a catch for the seedDatabaseIfEmpty error too just in case
content = content.replace(/console\.error\("Failed to seed initial data:", err\);/g, 'if (err.code !== "unavailable") { console.error("Failed to seed initial data:", err); } else { console.log("Skipping initial data seed because client is offline."); }');


fs.writeFileSync('src/App.tsx', content);
