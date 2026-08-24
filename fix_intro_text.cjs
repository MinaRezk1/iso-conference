const fs = require('fs');
let content = fs.readFileSync('src/components/IntroScreen.tsx', 'utf-8');

// Remove the upload instruction text
content = content.replace(/<p className="text-white\/80 text-sm sm:text-base max-w-md bg-black\/40 px-4 py-2 rounded-full backdrop-blur-md">[\s\S]*?<\/p>/, '');

fs.writeFileSync('src/components/IntroScreen.tsx', content);
