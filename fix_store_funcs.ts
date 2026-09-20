import fs from 'fs';

const storeFile = 'src/lib/store.tsx';
let content = fs.readFileSync(storeFile, 'utf8');

// Remove the wrongly placed functions
content = content.replace(/    const analyzeClaim = async \([\s\S]*?  const updateHumanReviewStatus = \([\s\S]*?  \};\n/g, '');

// Find the correct return ( for AppProvider
const funcCode = `
  const analyzeClaim = async (text: string, sources?: EvidenceSource[]) => {
    // Basic deduplication
    const existing = claimAnalyses.find(c => c.originalText.toLowerCase() === text.toLowerCase());
    if (existing) return existing;

    const analysis = await submitClaimForAnalysis(text, sources || []);
    setClaimAnalyses(prev => [analysis, ...prev]);
    return analysis;
  };

  const updateHumanReviewStatus = (id: string, status: 'PENDING' | 'REVIEWED' | 'NOT_REQUIRED') => {
    setClaimAnalyses(prev => prev.map(c => c.id === id ? { ...c, humanReviewStatus: status } : c));
  };
`;

content = content.replace(
  /  return \(\n    <AppContext\.Provider/,
  funcCode + '\n  return (\n    <AppContext.Provider'
);

fs.writeFileSync(storeFile, content);
