import fs from 'fs';

// 1. mock.ts
let mockFile = 'src/data/mock.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');
// Fix exact locations of CRITICAL for priority
mockData = mockData.replace(/priority: 'CRITICAL'/g, "priority: 'HIGH'");
// It might be priority: "CRITICAL"
mockData = mockData.replace(/priority: "CRITICAL"/g, "priority: 'HIGH'");
fs.writeFileSync(mockFile, mockData);

// 2. rescueDataService.ts
let rescueFile = 'src/lib/rescueDataService.ts';
let rescueData = fs.readFileSync(rescueFile, 'utf8');
// Let's just fix the return statement or cast completely
rescueData = rescueData.replace(
  /return transformedData as \{ stats\?: Record<string, unknown>, items\?: RawPersonReport\[\], lostItems\?: RawPersonReport\[\], foundItems\?: RawPersonReport\[\] \};/,
  'return transformedData as any;'
);
rescueData = rescueData.replace(
  /return transformedData as unknown as \{ stats\?: Record<string, unknown>, items\?: RawPersonReport\[\], lostItems\?: RawPersonReport\[\], foundItems\?: RawPersonReport\[\] \};/,
  'return transformedData as any;'
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
// Let's insert it carefully right before the Provider is returned
// Look for "const value: AppState =" or just right before "return ("
storeData = storeData.replace(
  /  const refreshGovernmentRescueReports = async/,
  funcCode + '\n  const refreshGovernmentRescueReports = async'
);

fs.writeFileSync(storeFile, storeData);
