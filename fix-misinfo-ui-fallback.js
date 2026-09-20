import fs from 'fs';
let file = 'src/components/misinfo/MisinfoProtector.tsx';
let data = fs.readFileSync(file, 'utf8');

const handleAnalyzeRegex = /const handleAnalyze = async \(\) => \{[\s\S]*?finally \{\s*setIsAnalyzing\(false\);\s*\}\s*\};/g;

const newHandleAnalyze = `const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    try {
      const result = await analyzeClaim(inputText, []);
      setCurrentAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };`;

data = data.replace(handleAnalyzeRegex, newHandleAnalyze);

fs.writeFileSync(file, data);
