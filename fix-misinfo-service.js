import fs from 'fs';
let file = 'src/lib/misinfoService.ts';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /sources: providedSources,/,
  `sources: (result.sourcesUsed || []).map((s: any, i: number) => ({
        id: \`src-\${Date.now()}-\${i}\`,
        name: s.name || 'Web Source',
        url: s.url,
        publisher: s.name || 'Web',
        publishedAt: new Date().toISOString(),
        retrievedAt: new Date().toISOString(),
        sourceType: s.reliabilityLevel === 'HIGH' ? 'OFFICIAL GOVERNMENT' : 'LOCAL REPORT',
        reliabilityLevel: s.reliabilityLevel || 'MEDIUM',
        contentSummary: s.contentSummary || '',
        relatedClaim: text.substring(0, 50),
        relationship: s.relationship || 'NEUTRAL'
      })),`
);

fs.writeFileSync(file, data);
