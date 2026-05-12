export const config = { runtime: 'edge' };

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
  'Use your training knowledge plus careful reasoning to produce structured intelligence briefs for law enforcement, corporate security, and travelers.',
  '',
  'GEOGRAPHIC SECURITY CONTEXT (apply when location matches):',
  '- Thai Deep South (Yala, Narathiwat, Pattani, Songkhla): active BRN separatist insurgency since 2004. ALWAYS HIGH RISK.',
  '- Myanmar: civil war since Feb 2021 coup, kinetic conflict in Sagaing/Chin/Kachin/Shan/Karen/Kayah. HIGH-EXTREME.',
  '- Gaza/West Bank: active armed conflict. EXTREME.',
  '- Yemen, Syria, Sudan: ongoing armed conflict. HIGH.',
  '- Sahel (Mali, Burkina Faso, Niger): JNIM/ISWAP. HIGH outside capitals.',
  '- Eastern DRC: M23/ADF and other armed groups. HIGH-EXTREME.',
  '- Somalia: Al-Shabaab in rural south-central. HIGH.',
  '- Haiti: gang control of major territory. EXTREME.',
  '- Ecuador: declared internal armed conflict Jan 2024. HIGH.',
  '- Mexico cartel areas (Guerrero, Sinaloa, Michoacan, Tamaulipas): HIGH.',
  '- Colombia rural (Cauca, Narino, Norte de Santander, Arauca): FARC-EP/ELN. HIGH.',
  '- Kashmir, KPK/FATA Pakistan, Afghanistan: HIGH.',
  '- Mindanao Philippines (BIFF, Abu Sayyaf): MEDIUM-HIGH.',
  '',
  'RULES:',
  '1. For locations, ALWAYS apply the geo context above.',
  '2. analytical_perspective: minimum 5 sentences (situation, patterns, gaps, flags, geopolitics).',
  '3. recommendations: minimum 4 items in each of law_enforcement, private_sector, traveler.',
  '4. flags must cite specific evidence.',
  '5. Return ONLY valid JSON, no markdown fences, no preamble.',
  '',
  'JSON SCHEMA:',
  '{ "query": str, "type": "person|incident|location|organization|travel_risk", "summary": str,',
  '  "risk": "HIGH|MEDIUM|LOW",',
  '  "sources": [{"title":str,"url":str,"domain":str,"date":"YYYY-MM-DD|null","type":"official|mainstream|ngo|local|reference","confidence":"high|medium|low"}],',
  '  "timeline": [{"date":"YYYY-MM-DD","event":str,"source_title":str,"source_url":str,"confidence":"high|medium|low"}],',
  '  "flags": [{"name":str,"description":str,"severity":"high|medium|low","evidence":str,"source_url":"str|null"}],',
  '  "risk_assessment": {"level":"HIGH|MEDIUM|LOW","rationale":str,"factors":[str]},',
  '  "analytical_perspective": str,',
  '  "recommendations": {"law_enforcement":[str],"private_sector":[str],"traveler":[str]} }'
].join('\n');

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

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 25000);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 6000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: 'Query: "' + q + '". Produce the complete JSON brief. All fields mandatory. Cite well-known public sources you are aware of (news outlets, Wikipedia, government sites).'
        }],
      }),
      signal: controller.signal,
    });

    if (!r.ok) {
      const errBody = await r.text();
      return jsonRes({ error: 'Anthropic API ' + r.status + ': ' + errBody.slice(0, 300) }, 500);
    }

    const data = await r.json();
    let text = (data && data.content && data.content[0] && data.content[0].text) || '';
    text = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) return jsonRes({ error: 'Claude returned malformed JSON', raw: text.slice(0, 500) }, 500);
      result = JSON.parse(m[0]);
    }

    return jsonRes(result);
  } catch (err) {
    return jsonRes({ error: (err && err.message) || 'Analysis failed' }, 500);
  } finally {
    clearTimeout(tid);
  }
}
