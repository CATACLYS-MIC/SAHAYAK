import fs from 'fs';

// 1. mock.ts
const mockFile = 'src/data/mock.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');
mockData = mockData.replace(/priority: 'CRITICAL'/g, "priority: 'HIGH'");
fs.writeFileSync(mockFile, mockData);

// 2. store.tsx
const storeFile = 'src/lib/store.tsx';
let storeData = fs.readFileSync(storeFile, 'utf8');

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
// Ensure it's not already there
if (!storeData.includes('const analyzeClaim = async')) {
  storeData = storeData.replace(
    /  const value = \{/,
    funcCode + '\n  const value = {'
  );
  fs.writeFileSync(storeFile, storeData);
}

// 3. NewsSafety.tsx - just replace any "from 'lucide-react'" that doesn't have FileWarning and ShieldQuestion
const newsFile = 'src/pages/NewsSafety.tsx';
let newsData = fs.readFileSync(newsFile, 'utf8');
if (!newsData.includes('FileWarning,')) {
    newsData = newsData.replace(/} from 'lucide-react';/, ', FileWarning, ShieldQuestion } from \'lucide-react\';');
}
fs.writeFileSync(newsFile, newsData);
