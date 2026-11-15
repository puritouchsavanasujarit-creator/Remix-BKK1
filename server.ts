import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  SOP_SYSTEM_INSTRUCTION,
  buildChatContents,
  buildParseSlipPrompt,
  extractGroundingLinks,
  geminiModelCandidates,
  resolveGeminiModel,
} from './shared/sop-prompt.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const aiClient = apiKey
  ? new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } })
  : null;
if (!aiClient) {
  console.warn('GEMINI_API_KEY is not set. Gemini features may be restricted.');
}

/** Model set shared with worker/index.js; /api/health reports this value. */
const GEMINI_MODEL = resolveGeminiModel(process.env.GEMINI_MODEL);

// Tries the configured model first, falling back only when a model is unavailable (404).
async function generateContent(contents: any, config: any) {
  let lastError: any = null;
  for (const model of geminiModelCandidates(process.env.GEMINI_MODEL)) {
    try {
      return await aiClient!.models.generateContent({ model, contents, config });
    } catch (error: any) {
      lastError = error;
      if (error?.status !== 404) throw error;
    }
  }
  throw lastError;
}

// Gemini Chat Endpoint with optional Grounding (Search or Maps)
app.post('/api/chat', async (req, res) => {
  if (!aiClient) {
    return res.status(503).json({
      error: 'Gemini API is not configured. Please ensure GEMINI_API_KEY is available.',
    });
  }

  try {
    const { messages, groundingMode, userLocation } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const config: any = { systemInstruction: SOP_SYSTEM_INSTRUCTION };
    if (groundingMode === 'search') {
      config.tools = [{ googleSearch: {} }];
    } else if (groundingMode === 'maps') {
      config.tools = [{ googleMaps: {} }];
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLocation?.lat || 13.7563,
            longitude: userLocation?.lng || 100.5018,
          },
        },
      };
    }

    const response = await generateContent(buildChatContents(messages), config);
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      text: response.text || '',
      links: extractGroundingLinks(chunks),
      groundingMode: groundingMode || 'standard',
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error while processing Gemini chat request',
    });
  }
});

// AI Assistant route for analyzing chat slips / order notes
app.post('/api/ai/parse-slip', async (req, res) => {
  if (!aiClient) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  try {
    const { chatText } = req.body;
    if (!chatText) {
      return res.status(400).json({ error: 'chatText is required' });
    }

    const response = await generateContent(buildParseSlipPrompt(chatText), {
      responseMimeType: 'application/json',
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Parse slip error:', err);
    return res.status(500).json({ error: err.message || 'Failed to parse chat slip' });
  }
});

// Health check: reports whether the Gemini key is configured (never the value)
app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(apiKey),
    model: GEMINI_MODEL,
    runtime: 'express',
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`BKK Flower Agent Hub server listening on http://localhost:${PORT}`);
  });
}

startServer();
