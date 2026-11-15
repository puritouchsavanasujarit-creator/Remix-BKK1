/**
 * Cloudflare Worker entrypoint for BKK Flower Agent Order & Feasibility Hub.
 *
 * Serves the built Vite SPA from env.ASSETS and exposes the two Gemini routes
 * from server.ts (chat + chat-slip parser) through the public Gemini REST API.
 * Prompts, chat payload helpers and model config live in shared/sop-prompt.js.
 *
 * Bundled by esbuild into worker-dist/index.js ("build:worker") before deploy.
 */
import {
  SOP_SYSTEM_INSTRUCTION,
  buildChatContents,
  buildParseSlipPrompt,
  extractGroundingLinks,
  geminiModelCandidates,
  resolveGeminiModel,
} from '../shared/sop-prompt.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

async function callGemini(env, payload) {
  let lastError = null;
  for (const model of geminiModelCandidates(env.GEMINI_MODEL)) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify(payload),
      }
    );

    const text = await res.text();
    if (res.ok) return JSON.parse(text);

    lastError = `Gemini ${model} -> ${res.status}: ${text.slice(0, 400)}`;
    if (res.status !== 404) break;
  }
  throw new Error(lastError || 'Gemini API request failed');
}

function candidateText(candidate) {
  return (candidate?.content?.parts || [])
    .map((p) => (typeof p?.text === 'string' ? p.text : ''))
    .join('')
    .trim();
}

async function handleChat(env, request) {
  if (!env.GEMINI_API_KEY) {
    return json(
      {
        error:
          'ยังไม่ได้ตั้งค่า GEMINI_API_KEY — กรุณาเพิ่ม Secret ชื่อ GEMINI_API_KEY ในหน้า Sites → Secrets แล้ว deploy ใหม่อีกครั้ง',
      },
      503
    );
  }

  const body = await request.json().catch(() => null);
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'Messages array is required' }, 400);
  }

  const payload = {
    systemInstruction: { parts: [{ text: SOP_SYSTEM_INSTRUCTION }] },
    contents: buildChatContents(messages),
  };

  const { groundingMode, userLocation } = body;
  if (groundingMode === 'search') {
    payload.tools = [{ google_search: {} }];
  } else if (groundingMode === 'maps') {
    payload.tools = [{ google_maps: {} }];
    payload.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: Number(userLocation?.lat ?? 13.7563),
          longitude: Number(userLocation?.lng ?? 100.5018),
        },
      },
    };
  }

  const data = await callGemini(env, payload);
  const candidate = data?.candidates?.[0];

  return json({
    text: candidateText(candidate) || data?.promptFeedback?.blockReason || 'ไม่มีการตอบกลับจากระบบ',
    links: extractGroundingLinks(candidate?.groundingMetadata?.groundingChunks),
    groundingMode: groundingMode || 'standard',
  });
}

async function handleParseSlip(env, request) {
  if (!env.GEMINI_API_KEY) {
    return json({ error: 'Gemini API not configured' }, 503);
  }

  const body = await request.json().catch(() => null);
  if (!body?.chatText) {
    return json({ error: 'chatText is required' }, 400);
  }

  const data = await callGemini(env, {
    contents: [{ role: 'user', parts: [{ text: buildParseSlipPrompt(body.chatText) }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  try {
    return json(JSON.parse(candidateText(data?.candidates?.[0]) || '{}'));
  } catch {
    return json({ error: 'Failed to parse Gemini JSON response' }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return json({ error: 'Method not allowed' }, 405);
      }
      return json({
        status: 'ok',
        geminiConfigured: Boolean(env.GEMINI_API_KEY),
        model: resolveGeminiModel(env.GEMINI_MODEL),
        runtime: 'cloudflare-worker',
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === '/api/chat') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      try {
        return await handleChat(env, request);
      } catch (err) {
        console.error('Gemini chat error:', err?.message || err);
        return json({ error: err?.message || 'Internal server error while processing Gemini chat request' }, 500);
      }
    }

    if (url.pathname === '/api/ai/parse-slip') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
      try {
        return await handleParseSlip(env, request);
      } catch (err) {
        console.error('Parse slip error:', err?.message || err);
        return json({ error: err?.message || 'Failed to parse chat slip' }, 500);
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404);
    }

    return env.ASSETS.fetch(request);
  },
};
