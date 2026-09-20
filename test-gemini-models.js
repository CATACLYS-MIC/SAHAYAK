import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
ai.models.list().then(list => console.log(JSON.stringify(list, null, 2))).catch(e => console.error(e));
