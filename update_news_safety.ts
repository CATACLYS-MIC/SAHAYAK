import fs from 'fs';

const file = 'src/pages/NewsSafety.tsx';
let content = fs.readFileSync(file, 'utf8');

// Import
content = content.replace(
  /import { MissingPersonMap } from '@\/components\/missing-persons\/MissingPersonMap';/,
  `import { MissingPersonMap } from '@/components/missing-persons/MissingPersonMap';\nimport { MisinfoProtector } from '@/components/misinfo/MisinfoProtector';`
);

// Remove planned badge
content = content.replace(
  /<Badge variant="outline" className="text-\[9px\] ml-1">PLANNED<\/Badge>/,
  ``
);

// Replace placeholder
content = content.replace(
  /\{activeSection === 'MISINFORMATION' && \([\s\S]*?Planned development phase[\s\S]*?<\/Card>\n      \)\}/,
  `{activeSection === 'MISINFORMATION' && (\n        <MisinfoProtector />\n      )}`
);

fs.writeFileSync(file, content);
console.log('Updated NewsSafety.tsx');
