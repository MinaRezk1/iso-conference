const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// The migrations start around line 64. Let's find "if (!navigator.onLine) { console.log(\"Offline mode: skipping migrations and seeding.\"); } else { await seedDatabaseIfEmpty(); }"
// We can wrap all the try-catches up to the end of the migrations in the `else` block.

const startString = 'if (!navigator.onLine) { console.log("Offline mode: skipping migrations and seeding."); } else { await seedDatabaseIfEmpty(); }';
const endString = '} catch (err) {'; // the catch for the overall try block that encapsulates the migrations

let startIndex = content.indexOf(startString);
let endIndex = content.indexOf(endString, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  let before = content.substring(0, startIndex);
  let after = content.substring(endIndex);
  
  let middle = content.substring(startIndex, endIndex);
  
  // replace startString with if (navigator.onLine) { await seedDatabaseIfEmpty();
  middle = middle.replace(startString, 'if (navigator.onLine) {\n          await seedDatabaseIfEmpty();');
  
  // Add closing brace at the end of middle
  middle = middle + '        }\n      ';
  
  content = before + middle + after;
  fs.writeFileSync('src/App.tsx', content);
  console.log("Successfully wrapped migrations in if(navigator.onLine)");
} else {
  console.log("Could not find boundaries");
}
