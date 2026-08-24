const fs = require('fs');

const fileContent = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace migration_v3 with migration_v4
let updatedContent = fileContent.replace(/"migration_v3"/g, '"migration_v5"');
updatedContent = updatedContent.replace(/"migration_v4"/g, '"migration_v5"');

fs.writeFileSync('src/App.tsx', updatedContent);
console.log("Successfully updated migration version.");
