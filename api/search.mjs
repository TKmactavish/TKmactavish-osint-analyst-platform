export const config = { runtime: 'edge' };

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1200;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonRes(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const SYSTEM = `You are a research assistant. Your only job is to use the web_search tool to find current public information about the user's query, then return the findings as a compact JSON object.

Rules:
- Run web_search 1-3 times maximum. Be efficient.
- Prefer authoritative sources: government, mainstream news (Reuters/AP/BBC plus regional outlets), NGOs, academic.
- If the query references a non-English region, include at least one local-language source where available.
- Return ONLY valid JSON, no markdown, no commentary.
- Keep each snippet to 1 short sentence (max 150 chars). Brevity is mandatory.

Schema (strict):
{"findings":[{"title":"...","url":"...","domain":"...","date":"YYYY-MM-DD|null","snippet":"<150 char","language":"EN|TH|AR|..."}]}

Return 4-6 findings only. Always close all brackets.`;

function extractJson(text) {
  const start = text.indexOf('{');
  if (start < 0) return { findings: [] };
  let s = text.slice(start);
  try { return JSON.parse(s); } catch {}
  const m = s.match(/^\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }

  // Bracket repair
  s = s.replace(/\s+$/, '');
  let depth = 0, inString = false, escape = false, lastSafe = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') depth++;
    else if (ch === '}' || ch === ']') { depth--; if (depth === 0) lastSafe = i + 1; }
    else if (ch === ',' && depth >= 1) lastSafe = i;
  }
  let prefix = s.slice(0, lastSafe).replace(/,\s*$/, '');
  const stk = [];
  inString = false; escape = false;
  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') stk.push('}');
    else if (ch === '[') stk.push(']');
    else if (ch === '}' || ch === ']') stk.pop();
  }
  while (stk.length) prefix += stk.pop();
  try { return JSON.parse(prefix); } catch { return { findings: [] }; }
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return jsonRes({ error: 'Only POST' }, 405);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonRes({ error: 'ANTHROPIC_API_KEY not set' }, 500);

  let query;
  try {
    const body = await req.json();
    query = (body.query || '').trim();
  } catch {
    return jsonRes({ error: 'Invalid JSON body' }, 400);
  }
  if (!query || query.length < 2) return jsonRes({ error: 'Query too short' }, 400);
  if (query.length > 500) return jsonRes({ error: 'Query too long' }, 400);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        system:     SYSTEM,
        tools: [
          { type: 'web_search_20250305', name: 'web_search', max_uses: 3 },
        ],
        messages: [
          { role: 'user', content: `Find current public information about: "${query}". Return the JSON findings list.` },
        ],
      }),
      signal: AbortSignal.timeout(22000),
    });

    if (!res.ok) {
      const errBody = await res.text();
      // Soft-fail: return empty findings so analyze step can still run on knowledge alone
      return jsonRes({ findings: [], warning: `Search unavailable (${res.status}): ${errBody.slice(0, 150)}` });
    }

    const data = await res.json();
    let text = '';
    for (const block of (data.content || [])) {
      if (block.type === 'text') text += block.text;
    }
    text = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();

    if (!text) return jsonRes({ findings: [], warning: 'No text in search response' });

    const parsed = extractJson(text);
    return jsonRes({ findings: Array.isArray(parsed.findings) ? parsed.findings : [] });

  } catch (err) {
    const msg = err?.message || 'Search failed';
    // Soft-fail on timeout so analyze can still proceed
    return jsonRes({ findings: [], warning: msg });
  }
}
