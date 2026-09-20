import fs from 'fs';

const storeFile = 'src/lib/store.tsx';
let content = fs.readFileSync(storeFile, 'utf8');

if (!content.includes('import { ClaimAnalysis, EvidenceSource } from')) {
    content = content.replace(
      /interface AppState \{/,
      `import { ClaimAnalysis, EvidenceSource } from '../types';\nimport { submitClaimForAnalysis } from './misinfoService';\n\ninterface AppState {`
    );
}

// Check where it broke - did analyzeClaim get added correctly inside AppProvider?
// Let's check `src/lib/store.tsx` further down.
fs.writeFileSync(storeFile, content);
