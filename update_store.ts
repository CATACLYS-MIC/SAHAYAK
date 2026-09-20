import fs from 'fs';

const storeFile = 'src/lib/store.tsx';
let content = fs.readFileSync(storeFile, 'utf8');

// Add ClaimAnalysis to imports
content = content.replace(
  /export interface AppState \{/,
  `import { ClaimAnalysis, EvidenceSource } from '../types';\nimport { submitClaimForAnalysis } from './misinfoService';\n\nexport interface AppState {`
);

// Add claimAnalyses to AppState
content = content.replace(
  /  news: News\[\];/,
  `  news: News[];\n  claimAnalyses: ClaimAnalysis[];\n  analyzeClaim: (text: string, sources?: EvidenceSource[]) => Promise<ClaimAnalysis>;\n  updateHumanReviewStatus: (id: string, status: 'PENDING' | 'REVIEWED' | 'NOT_REQUIRED') => void;`
);

// Add to context state
content = content.replace(
  /  const \[news\] = useState<News\[\]>\(mockData\.MOCK_NEWS\);/,
  `  const [news, setNews] = useState<News[]>(mockData.MOCK_NEWS);\n  const [claimAnalyses, setClaimAnalyses] = useState<ClaimAnalysis[]>((mockData as any).MOCK_CLAIM_ANALYSES || []);`
);

// Add analyzeClaim function
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
  /  return \(/,
  funcCode + '\n  return ('
);

// Provide it in context
content = content.replace(
  /    news,/,
  `    news,\n    claimAnalyses,\n    analyzeClaim,\n    updateHumanReviewStatus,`
);

fs.writeFileSync(storeFile, content);
console.log('Updated store.tsx');
