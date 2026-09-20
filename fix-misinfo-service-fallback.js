import fs from 'fs';
let file = 'src/lib/misinfoService.ts';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  /return generateDeterministicFallback\(text, providedSources\);/g,
  `return {
      id: \`ca-fallback-\${Date.now()}\`,
      originalText: text,
      extractedClaims: [text],
      sources: providedSources,
      verdict: 'UNVERIFIED',
      confidence: 0,
      explanation: 'Live web verification is unavailable at this time due to rate limits or network issues.',
      supportingEvidence: [],
      contradictingEvidence: [],
      unknowns: ['Live web search failed.'],
      recommendedAction: 'WAIT_FOR_OFFICIAL_CONFIRMATION',
      humanReviewStatus: 'PENDING',
      createdAt: new Date().toISOString()
    };`
);

fs.writeFileSync(file, data);
