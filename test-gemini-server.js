import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });
ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: 'Say hi'
}).then(r => console.log(r.text)).catch(e => console.error(e));
