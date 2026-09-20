import fs from 'fs';
let file = 'server.ts';
let data = fs.readFileSync(file, 'utf8');

const catchBlockRegex = /\} catch \(error\) \{[\s\S]*?res\.status\(500\)\.json\(\{ error: error\.message \|\| 'Internal Server Error' \}\);\s*\}/;

const newCatchBlock = `} catch (error: any) {
      if (error.status === 429 || (error.message && error.message.includes('429')) || (error.message && error.message.includes('quota'))) {
         console.warn('Gemini API Rate Limit Exceeded (429). Returning graceful fallback response.');
         return res.json({
            extractedClaims: [text],
            verdict: "UNVERIFIED",
            confidence: 0,
            explanation: "Live web verification is unavailable at this time due to API rate limits.",
            supportingEvidence: [],
            contradictingEvidence: [],
            unknowns: ["Live web search failed."],
            recommendedAction: "WAIT_FOR_OFFICIAL_CONFIRMATION",
            sourcesUsed: []
         });
      }
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }`;

data = data.replace(catchBlockRegex, newCatchBlock);
fs.writeFileSync(file, data);
