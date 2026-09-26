import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY;

  app.post('/api/gemini/suggest-titles', async (req, res) => {
    try {
      const { genre, tempo, scaleKey } = req.body;
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const prompt = `Generate a list of 5 premium, ultra-modern, high-fashion independent beat titles suitable for a ${genre || 'Trap'} instrumental track. Keep them stylish, luxury, clean, and punchy. Tempo is ${tempo || 140} BPM, key is ${scaleKey || 'C Minor'}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description: "A list of 5 stylish beat titles"
          }
        }
      });

      const responseText = response.text || "[]";
      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.error("Gemini title suggest error:", error);
      res.status(500).json({ error: error.message || "Failed to suggest titles" });
    }
  });

  app.post('/api/gemini/suggest-description', async (req, res) => {
    try {
      const { title, genre, tempo, scaleKey, moods, tags } = req.body;
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Generate a premium, high-fashion, high-fidelity promotional description for an independent beat titled "${title || 'OBSIDIAN'}". 
Genre: ${genre || 'TRAP'}
BPM: ${tempo || 140}
Key: ${scaleKey || 'C Minor'}
Moods: ${moods || 'Dark, Energetic'}
Tags: ${tags || 'voodoo, darktrap'}
Provide a concise, professional, engaging paragraph (max 3 sentences) highlighting its luxury production values, analog synth textures, and sliding bass elements. Avoid any hashtags or robotic phrasing.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
      });

      res.json({ text: (response.text || "").trim() });
    } catch (error: any) {
      console.error("Gemini description suggest error:", error);
      res.status(500).json({ error: error.message || "Failed to suggest description" });
    }
  });

  // Serve Vite in development or static files in production
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const port = parseInt(process.env.PORT || '3000', 10);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
