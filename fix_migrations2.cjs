const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Also suppress if string includes offline
content = content.replace(/if \(migrationErr\.code !== "unavailable"\)/g, 'if (migrationErr?.code !== "unavailable" && !String(migrationErr).includes("offline"))');
content = content.replace(/if \(song3Err\.code !== "unavailable"\)/g, 'if (song3Err?.code !== "unavailable" && !String(song3Err).includes("offline"))');
content = content.replace(/if \(song2MigrationErr\.code !== "unavailable"\)/g, 'if (song2MigrationErr?.code !== "unavailable" && !String(song2MigrationErr).includes("offline"))');
content = content.replace(/if \(schedMigrationErr\.code !== "unavailable"\)/g, 'if (schedMigrationErr?.code !== "unavailable" && !String(schedMigrationErr).includes("offline"))');
content = content.replace(/if \(lessonsMigrationErr\.code !== "unavailable"\)/g, 'if (lessonsMigrationErr?.code !== "unavailable" && !String(lessonsMigrationErr).includes("offline"))');
content = content.replace(/if \(err\.code !== "unavailable"\)/g, 'if (err?.code !== "unavailable" && !String(err).includes("offline"))');

// Wrap seedDatabaseIfEmpty in try-catch inside the main block just in case it doesn't have it
// Actually it's already wrapped in try-catch in the function.

// Pre-check for navigator.onLine for migrations?
// If offline, just return early.
content = content.replace('await seedDatabaseIfEmpty();', 'if (!navigator.onLine) { console.log("Offline mode: skipping migrations and seeding."); return; } await seedDatabaseIfEmpty();');

fs.writeFileSync('src/App.tsx', content);
