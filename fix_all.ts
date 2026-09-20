import fs from 'fs';

// 1. Fix mock.ts CRITICAL
const mockFile = 'src/data/mock.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');
mockData = mockData.replace(/priority: 'CRITICAL'/g, "priority: 'HIGH'");
fs.writeFileSync(mockFile, mockData);

// 2. Fix rescueDataService.ts type error
const rescueFile = 'src/lib/rescueDataService.ts';
let rescueData = fs.readFileSync(rescueFile, 'utf8');
rescueData = rescueData.replace(
  /as \{ stats\?: Record<string, unknown>, items\?: RawPersonReport\[\], lostItems\?: RawPersonReport\[\], foundItems\?: RawPersonReport\[\] \}/g,
  'as unknown as { stats?: Record<string, unknown>, items?: RawPersonReport[], lostItems?: RawPersonReport[], foundItems?: RawPersonReport[] }'
);
fs.writeFileSync(rescueFile, rescueData);

// 3. Fix store.tsx scope error
const storeFile = 'src/lib/store.tsx';
let storeData = fs.readFileSync(storeFile, 'utf8');
// They are currently outside AppProvider! 
// Let's move them inside.
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
storeData = storeData.replace(/  const analyzeClaim = async \([\s\S]*?  const updateHumanReviewStatus = \([\s\S]*?  \};\n/g, '');

// Now inject inside AppProvider, right before return
storeData = storeData.replace(
  /  return \(\n    <AppContext\.Provider/,
  funcCode + '\n  return (\n    <AppContext.Provider'
);
fs.writeFileSync(storeFile, storeData);

// 4. Fix NewsSafety.tsx imports
const newsFile = 'src/pages/NewsSafety.tsx';
let newsData = fs.readFileSync(newsFile, 'utf8');
newsData = newsData.replace(
  /import \{ FileText, ShieldCheck, MapPin, Users, Activity, Eye, AlertTriangle, CheckCircle2, ChevronDown, Filter, ChevronRight, ListFilter, ArrowRight, X, Clock, Unlock \} from 'lucide-react';/,
  `import { FileText, ShieldCheck, MapPin, Users, Activity, Eye, AlertTriangle, CheckCircle2, ChevronDown, Filter, ChevronRight, ListFilter, ArrowRight, X, Clock, Unlock, ShieldQuestion, FileWarning, ShieldAlert } from 'lucide-react';`
);
fs.writeFileSync(newsFile, newsData);

console.log('Fixed all.');
