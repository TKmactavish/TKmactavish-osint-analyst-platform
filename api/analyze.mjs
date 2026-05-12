export const config = { runtime: 'edge' };

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 1800;

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
  'Haiti(gangs)/Ecuador(armed conflict): EXTREME-HIGH.',
  'Mexico cartel zones / Colombia rural FARC-EP-ELN: HIGH.',
  'Mindanao: MEDIUM-HIGH.',
  '',
  'RULES:',
  '- Apply geo risk above for locations.',
  '- analytical_perspective: 5+ sentences.',
  '- 3+ recommendations per audience.',
  '- Return ONLY valid JSON, no markdown.',
  '',
  'SCHEMA:',
  '{"query":str,"type":"person|incident|location|organization|travel_risk","summary":str,"risk":"HIGH|MEDIUM|LOW",',
  '"sources":[{"title":str,"url":str,"domain":str,"date":"YYYY-MM-DD|null","type":"official|mainstream|ngo|local|reference","confidence":"high|medium|low"}],',
  '"timeline":[{"date":"YYYY-MM-DD","event":str,"source_title":str,"source_url":str,"confidence":"high|medium|low"}],',
  '"flags":[{"name":str,"description":str,"severity":"high|medium|low","evidence":str,"source_url":"str|null"}],',
  '"risk_assessment":{"level":"HIGH|MEDIUM|LOW","rationale":str,"factors":[str]},',
  '"analytical_perspective":str,',
  '"recommendations":{"law_enforcement":[str],"private_sector":[str],"traveler":[str]}}'
].join('\n');

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
        `Cite well-known public sources (major news outlets, Wikipedia, government sites). ` +
        `Include 4-6 sources, 3-5 timeline events, 2-4 flags, 3+ recs per audience. All fields mandatory.`
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
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Claude returned malformed JSON');
  }
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
