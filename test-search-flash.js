import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
async function test() {
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: 'What is the current weather in Kathmandu? Respond in JSON format.',
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });
  console.log(response.text);
  console.log(JSON.stringify(response.candidates[0].groundingMetadata, null, 2));
}
test().catch(console.error);
