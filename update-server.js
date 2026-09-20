import fs from 'fs';

const serverContent = `import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/analyze-claim', async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(500).json({ error: 'API Key missing' });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemPrompt = \`You are SAHAYAK's Misinformation Protector, an expert fact-checker for disaster-related claims.
Your job is to investigate a claim using live web search, evaluate the evidence, and produce a structured JSON response.

Follow the instructions exactly:
1. Search the web for the claim, breaking it down into keywords, dates, and locations.
2. Prioritize official government sources (like NDRRMA, Ministry of Home Affairs, Nepal Police) and reputable news organizations.
3. Compare the dates and locations of the search results with the claim to ensure freshness and relevance.
4. Synthesize a verdict based ONLY on the evidence found. Do not use prior knowledge.

Return a JSON object with this exact schema:
{
  "extractedClaims": ["Claim 1", "Claim 2"],
  "verdict": "VERIFIED" | "LIKELY TRUE" | "UNVERIFIED" | "CONFLICTING" | "MISLEADING" | "LIKELY FALSE" | "OUTDATED",
  "confidence": <number between 0 and 100>,
  "explanation": "<Clear, non-technical explanation of why this verdict was reached based on the search results. Mention specific sources.>",
  "supportingEvidence": ["<Evidence 1>"],
  "contradictingEvidence": ["<Evidence 1>"],
  "unknowns": ["<Unknown 1>"],
  "recommendedAction": "<A short recommended action, e.g., 'WAIT_FOR_OFFICIAL_CONFIRMATION'>",
  "sourcesUsed": [
    {
      "name": "Name of publisher or organization",
      "url": "https://...",
      "relationship": "SUPPORTING" | "CONTRADICTING" | "NEUTRAL",
      "reliabilityLevel": "HIGH" | "MEDIUM" | "LOW",
      "contentSummary": "Short summary of what this source says"
    }
  ]
}\`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: \`Investigate this claim: "\${text}"\` }] }
        ],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2,
          tools: [{ googleSearch: {} }]
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      // If the model didn't provide sources but groundingMetadata exists, we could theoretically merge them.
      // But we instructed the model to output sourcesUsed in the JSON.
      
      res.json(result);
    } catch (error) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Server running on http://0.0.0.0:\${PORT}\`);
  });
}

startServer();
`;

fs.writeFileSync('server.ts', serverContent);
