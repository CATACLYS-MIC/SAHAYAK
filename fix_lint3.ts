import fs from 'fs';

let mockFile = 'src/types/index.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');
// Just add CRITICAL to priority
mockData = mockData.replace(/'LOW' \| 'HIGH' \| 'MEDIUM'/g, "'LOW' | 'HIGH' | 'MEDIUM' | 'CRITICAL'");
mockData = mockData.replace(/'LOW' \| 'MEDIUM' \| 'HIGH'/g, "'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'");
fs.writeFileSync(mockFile, mockData);

let rescueFile = 'src/lib/rescueDataService.ts';
let rescueData = fs.readFileSync(rescueFile, 'utf8');
rescueData = rescueData.replace(
  /return transformedData as any;/,
  'return transformedData as unknown as { stats?: Record<string, unknown>, items?: any[], lostItems?: any[], foundItems?: any[] };'
);
fs.writeFileSync(rescueFile, rescueData);

