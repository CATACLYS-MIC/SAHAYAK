import fs from 'fs';

let rescueFile = 'src/lib/rescueDataService.ts';
let rescueData = fs.readFileSync(rescueFile, 'utf8');

rescueData = rescueData.replace(
  /const snap = cachedSnapshot as \{\n        stats\?: Record<string, unknown>;\n        items\?: RawPersonReport\[\];\n        lostItems\?: RawPersonReport\[\];\n        foundItems\?: RawPersonReport\[\];\n      \};/g,
  'const snap = cachedSnapshot as any;'
);

fs.writeFileSync(rescueFile, rescueData);

