import fs from 'fs';
let file = 'src/components/misinfo/MisinfoProtector.tsx';
let data = fs.readFileSync(file, 'utf8');

// Replace handleAnalyze body
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
      // Create a fallback in case of rate limit so the UI doesn't just hang or show nothing.
      setCurrentAnalysis({
        id: \`ca-\${Date.now()}\`,
        originalText: inputText,
        extractedClaims: [inputText],
        sources: [],
        verdict: 'UNVERIFIED',
        confidence: 0,
        explanation: 'Live web verification is unavailable at this time due to rate limits or network issues.',
        supportingEvidence: [],
        contradictingEvidence: [],
        unknowns: ['Could not connect to live web search.'],
        recommendedAction: 'WAIT_FOR_OFFICIAL_CONFIRMATION',
        humanReviewStatus: 'PENDING',
        createdAt: new Date().toISOString()
      } as any);
    } finally {
      setIsAnalyzing(false);
    }
  };`;

data = data.replace(handleAnalyzeRegex, newHandleAnalyze);

// Add "Searching the live web..." indicator
const analyzingIndicatorRegex = /<div className="w-4 h-4 border-2 border-white\/30 border-t-white rounded-full animate-spin" \/>\s*Analyzing Evidence\.\.\./g;

const newAnalyzingIndicator = `<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />\n                    Searching Live Web...`;

data = data.replace(analyzingIndicatorRegex, newAnalyzingIndicator);

fs.writeFileSync(file, data);
