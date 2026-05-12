export const config = { runtime: 'edge' };

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 2400;

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

const SYSTEM_PROMPT = [
  'You are a senior OSINT analyst for Athena Intel.',
  '',
  'GEO RISK (apply when location matches):',
  'Thai Deep South (Yala/Narathiwat/Pattani/Songkhla): HIGH (BRN insurgency).',
  'Myanmar conflict zones: HIGH-EXTREME. Gaza/West Bank: EXTREME.',
  'Yemen/Syria/Sudan(SAF-RSF)/Kashmir/Afghanistan/Sahel/Eastern DRC/Somalia: HIGH.',
  'Haiti(gangs): EXTREME. Ecuador(armed conflict): HIGH.',
  'Mexico cartel zones / Colombia rural FARC-EP-ELN: HIGH.',
  'Mindanao: MEDIUM-HIGH.',
  '',
  'RULES:',
  '- Apply geo risk above for locations.',
  '- BE CONCISE. Short strings, no fluff.',
  '- analytical_perspective: exactly 5-6 short sentences.',
  '- Exactly 3 sources, 2-3 timeline events, 2 flags, 3 recommendations per audience.',
  '- Return ONLY valid JSON, no markdown.',
  '- ALWAYS close all brackets and braces. Output complete JSON.',
  '',
  'SCHEMA (all fields mandatory):',
  '{"query":str,"type":"person|incident|location|organization|travel_risk","summary":str,"risk":"HIGH|MEDIUM|LOW",',
  '"sources":[{"title":str,"url":str,"domain":str,"date":"YYYY-MM-DD|null","type":"official|mainstream|ngo|local|reference","confidence":"high|medium|low"}],',
  '"timeline":[{"date":"YYYY-MM-DD","event":str,"source_title":str,"source_url":str,"confidence":"high|medium|low"}],',
  '"flags":[{"name":str,"description":str,"severity":"high|medium|low","evidence":str,"source_url":"str|null"}],',
  '"risk_assessment":{"level":"HIGH|MEDIUM|LOW","rationale":str,"factors":[str,str,str]},',
  '"analytical_perspective":str,',
  '"recommendations":{"law_enforcement":[str,str,str],"private_sector":[str,str,str],"traveler":[str,str,str]}}'
].join('\n');

// --- JSON repair for truncated Claude responses ------------------------------
function repairJson(text) {
  // Find the first { and try to parse progressively
  const start = text.indexOf('{');
  if (start < 0) throw new Error('No JSON object found');
  let s = text.slice(start);

  // Try direct parse first
  try { return JSON.parse(s); } catch {}

  // Try a clean greedy match
  const m = s.match(/^\{[\s\S]*\}/);
  if (m) {
    try { return JSON.parse(m[0]); } catch {}
  }

  // Repair: trim to last complete value and close all open brackets
  // Strip trailing partial string/value
  let cut = s;
  // Remove trailing whitespace
  cut = cut.replace(/\s+$/, '');
  // If we end in an incomplete string, find the last complete pair/element
  // Walk back to last `,` or opening bracket and trim
  let depth = 0;
  const stack = [];
  let inString = false;
  let escape = false;
  let lastSafe = 0;
  for (let i = 0; i < cut.length; i++) {
    const ch = cut[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') { stack.push(ch); depth++; }
    else if (ch === '}' || ch === ']') { stack.pop(); depth--; if (depth === 0) lastSafe = i + 1; }
    else if (ch === ',' && depth >= 1) { lastSafe = i; }
  }
  // Take prefix up to lastSafe, close remaining open brackets
  let prefix = cut.slice(0, lastSafe).replace(/,\s*$/, '');
  // Recompute open stack at lastSafe
  depth = 0;
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

  return JSON.parse(prefix);
}

async function analyzeWithClaude(q, apiKey) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content:
        `Query: "${q}". Produce the complete JSON brief using your training knowledge. ` +
        `Cite well-known public sources you remember. BE CONCISE. Output complete valid JSON only.`
      }],
    }),
    signal: AbortSignal.timeout(22000),
  });

  if (!r.ok) {
    const errBody = await r.text();
    throw new Error('Anthropic API ' + r.status + ': ' + errBody.slice(0, 300));
  }

  const data = await r.json();
  let text = (data?.content?.[0]?.text) || '';
  text = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
  return repairJson(text);
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return jsonRes({ error: 'Only POST requests are supported' }, 405);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonRes({ error: 'ANTHROPIC_API_KEY is not set' }, 500);

  let q;
  try {
    const body = await req.json();
    q = (body.query || '').trim();
  } catch {
    return jsonRes({ error: 'Invalid JSON body' }, 400);
  }
  if (!q || q.length < 2) return jsonRes({ error: 'Query must be at least 2 characters' }, 400);

  try {
    const result = await analyzeWithClaude(q, apiKey);
    return jsonRes(result);
  } catch (err) {
    return jsonRes({ error: (err && err.message) || 'Analysis failed' }, 500);
  }
}
