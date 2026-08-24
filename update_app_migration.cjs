const fs = require('fs');

let fileContent = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace migration_v3 and migration_v4 with migration_v5
fileContent = fileContent.replace(/"migration_v3"/g, '"migration_v5"');
fileContent = fileContent.replace(/"migration_v4"/g, '"migration_v5"');

// Force reset of the schedule migration by incrementing day 4 check
fileContent = fileContent.replace(/let hasDay4 = false;/g, 'let hasDay4 = false; let hasDay5 = false;');

fs.writeFileSync('src/App.tsx', fileContent);
console.log("Successfully updated migration version.");
