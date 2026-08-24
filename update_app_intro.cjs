const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add IntroScreen import
if (!content.includes('import IntroScreen')) {
  content = content.replace('import { seedDatabaseIfEmpty', 'import IntroScreen from "./components/IntroScreen";\nimport { seedDatabaseIfEmpty');
}

// 2. Add showIntro state
if (!content.includes('const [showIntro')) {
  content = content.replace('const [isLoading, setIsLoading] = useState<boolean>(true);', 'const [isLoading, setIsLoading] = useState<boolean>(true);\n  const [showIntro, setShowIntro] = useState<boolean>(true);');
}

// 3. Render IntroScreen if showIntro
if (!content.includes('<IntroScreen')) {
  const replacement = `
  if (showIntro) {
    return <IntroScreen onStart={() => setShowIntro(false)} />;
  }

  return (
    <div
  `;
  content = content.replace('return (\n    <div', replacement.trim());
}

fs.writeFileSync('src/App.tsx', content);
