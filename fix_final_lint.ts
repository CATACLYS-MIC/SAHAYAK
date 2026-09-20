import fs from 'fs';

// 1. Just replace CRITICAL with HIGH in mock.ts at the exact lines
let mockFile = 'src/data/mock.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');
const lines = mockData.split('\n');
if (lines[689] && lines[689].includes('CRITICAL')) {
    lines[689] = lines[689].replace('CRITICAL', 'HIGH');
}
if (lines[791] && lines[791].includes('CRITICAL')) {
    lines[791] = lines[791].replace('CRITICAL', 'HIGH');
}
fs.writeFileSync(mockFile, lines.join('\n'));

// 2. rescueDataService
let rescueFile = 'src/lib/rescueDataService.ts';
let rescueData = fs.readFileSync(rescueFile, 'utf8');
// Replace the entire return statement
rescueData = rescueData.replace(
  /return transformedData as any;/g,
  'return transformedData as unknown as { stats?: Record<string, unknown>, items?: RawPersonReport[], lostItems?: RawPersonReport[], foundItems?: RawPersonReport[] };'
);
rescueData = rescueData.replace(
  /return transformedData as unknown as \{ stats\?: Record<string, unknown>, items\?: RawPersonReport\[\], lostItems\?: RawPersonReport\[\], foundItems\?: RawPersonReport\[\] \};/g,
  'return transformedData as unknown as any;'
);
fs.writeFileSync(rescueFile, rescueData);

