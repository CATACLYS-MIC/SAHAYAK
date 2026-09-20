import fs from 'fs';

let mockFile = 'src/types/index.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');

// The error is in `urgency` or `baselinePriority` tier maybe?
mockData = mockData.replace(/tier: 'LOW' \| 'MEDIUM' \| 'HIGH' \| 'CRITICAL' \| 'CRITICAL';/g, "tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';");
// Let's also check BaselinePriorityBreakdown
if (!mockData.includes("urgency: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL'")) {
    mockData = mockData.replace(/urgency: 'HIGH' \| 'MEDIUM' \| 'LOW';/, "urgency: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';");
}
fs.writeFileSync(mockFile, mockData);

let rescueFile = 'src/lib/rescueDataService.ts';
let rescueData = fs.readFileSync(rescueFile, 'utf8');
// Fix the map to just cast to any at the very end
rescueData = rescueData.replace(
  /return transformedData as unknown as \{ stats\?: Record<string, unknown>, items\?: any\[\], lostItems\?: any\[\], foundItems\?: any\[\] \};/g,
  'return transformedData as any;'
);
fs.writeFileSync(rescueFile, rescueData);

