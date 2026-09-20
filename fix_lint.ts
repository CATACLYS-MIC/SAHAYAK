import fs from 'fs';

// 1. mock.ts
let mockFile = 'src/data/mock.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');
mockData = mockData.replace(/priority:\s*'CRITICAL'/g, "priority: 'HIGH'");
fs.writeFileSync(mockFile, mockData);

// 2. rescueDataService.ts
let rescueFile = 'src/lib/rescueDataService.ts';
let rescueData = fs.readFileSync(rescueFile, 'utf8');
rescueData = rescueData.replace(
  /as unknown as \{ stats\?: Record<string, unknown>, items\?: RawPersonReport\[\], lostItems\?: RawPersonReport\[\], foundItems\?: RawPersonReport\[\] \}/g,
  'as any'
);
rescueData = rescueData.replace(
  /as \{ stats\?: Record<string, unknown>, items\?: RawPersonReport\[\], lostItems\?: RawPersonReport\[\], foundItems\?: RawPersonReport\[\] \}/g,
  'as any'
);
fs.writeFileSync(rescueFile, rescueData);

// 3. store.tsx
let storeFile = 'src/lib/store.tsx';
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

// It might be that AppProvider starts differently
if (!storeData.includes('const analyzeClaim = async')) {
    // find "const value = {"
    storeData = storeData.replace(
        /  const value = \{/,
        funcCode + '\n  const value = {'
    );
    fs.writeFileSync(storeFile, storeData);
}

