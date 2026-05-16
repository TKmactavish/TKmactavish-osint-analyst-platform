export const config = { runtime: 'edge' };

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 1400;

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

const MODE_PRIORITY = {
  security:   `Prioritize: threat actors, suspects, criminal groups, official statements, police reports, incident history, escalation indicators, modus operandi, security patterns, local-language reporting. Search follow-ups should target leadership/identities/perpetrators by name when the query points to a person, group, or company.`,
  investment: `Prioritize: SEC 8-K filings, partnership announcements, supply chain roles, contract awards, company press releases, earnings calls, Form 4 insider filings. Focus on small/micro-cap companies (under $500M market cap). Search follow-ups should dig into specific company names, their partners, and any recent public announcements.`,
  business:   `Prioritize: business impact, operational disruption, transport disruption, road closures, supply chain, staff/customer exposure, market impact, reputation risk, regulatory action, executive decision impact. Search follow-ups should target named operators, affected industries, and continuity impact.`,
  traveler:   `Prioritize: official travel advisories (US State Dept, UK FCDO, AU Smartraveller), local police bulletins, tourist-relevant safety, transport status, areas to avoid, embassy notices, recent visitor incidents.`,
};

function modeSystem(mode, isRadar) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [year, month] = today.split('-');
  const monthName = new Date(today).toLocaleString('en-US', { month: 'long' });

  if (mode === 'investment' && isRadar) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const cutoffDate   = sevenDaysAgo.toISOString().slice(0, 10);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    return `You are a real-time OSINT sweep engine. Today is ${today}. The buy window closes fast — run exactly 3 web_search calls targeting the LAST 7 DAYS ONLY. Return ALL findings combined as one JSON object.

SEARCH 1 — Announcements from the last 3 days (freshest signals):
Search: stock partnership OR acquisition OR contract OR earnings announced "${monthName} ${year}" last 3 days NYSE NASDAQ site:prnewswire.com OR site:businesswire.com OR site:globenewswire.com

SEARCH 2 — Recent 8-K filings and insider buying clusters this week:
Search: 8-K filing partnership OR agreement OR acquisition "${monthName} ${year}" this week NYSE NASDAQ stock AND insider buying OR Form 4 cluster

SEARCH 3 — Pre-announcement signals: conference speaking slots, upcoming catalysts:
Search: stock conference presentation "${monthName} ${year}" upcoming catalyst AI defense semiconductor biotech space undiscovered analyst initiation

STRICT RULES:
- Discard any result dated before ${cutoffDate}. Last 7 days ONLY.
- Strong signals only: named partnerships, acquisitions, earnings beats, government contract awards, insider buying clusters.
- Exclude vague signals: "strategic roadmap", "exploring", "may announce", generic outlooks.
- Only include findings with a specific company name.
- Return ONLY valid JSON. No markdown.
- Each snippet: 1 short sentence (max 160 chars).

Schema:
{"findings":[{"title":"...","url":"...","domain":"...","date":"YYYY-MM-DD|null","snippet":"<160 char","language":"EN"}]}

Return up to 9 findings. Always close all brackets.`;
  }

  const priority = MODE_PRIORITY[mode] || MODE_PRIORITY.security;
  return `You are a research assistant for the Athena OSINT platform. Your only job is to use the web_search tool to find current public information about the user's query, then return the findings as a compact JSON object.

ACTIVE MODE: ${mode}
${priority}

SEARCH STRATEGY — run up to 3 web_search calls:

1. ALWAYS: a general search for the query as written.

2. ENTITY / MODE-SPECIFIC follow-up:
   - If the query names a COMPANY/ORGANIZATION: Search "<query> CEO founder leadership headquarters"
   - If the query names a PERSON: Search "<query> biography role employer nationality"
   - If the query is an INCIDENT: Search "<query> casualties perpetrator official response"
   - If the query is a LOCATION: Search "<query> security situation latest travel advisory"

3. CORROBORATION search: search the query with "latest 2026" to surface fresh reporting.

Rules:
- Run up to 3 web_search calls. Be efficient.
- Prefer authoritative sources: government, mainstream news, NGOs, official sites.
- Return ONLY valid JSON. No markdown. No commentary outside JSON.
- Each snippet: 1 short sentence (max 160 chars).
- Mark each finding's language code.

Schema (strict):
{"findings":[{"title":"...","url":"...","domain":"...","date":"YYYY-MM-DD|null","snippet":"<160 char","language":"EN|TH|KM|MY|AR|ZH|..."}]}

Return 5-7 findings. Always close all brackets.`;
}

function extractJson(text) {
  const start = text.indexOf('{');
  if (start < 0) return { findings: [] };
  let s = text.slice(start);
  try { return JSON.parse(s); } catch {}
  const m = s.match(/^\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }

  s = s.replace(/\s+$/, '');
  let depth = 0, inString = false, escape = false, lastSafe = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape)      { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"')  { inString = !inString; continue; }
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

  let query, mode, isRadar;
  try {
    const body = await req.json();
    query   = (body.query || '').trim();
    mode    = String(body.mode || 'security').toLowerCase();
    isRadar = Boolean(body.isRadar);
  } catch {
    return jsonRes({ error: 'Invalid JSON body' }, 400);
  }
  if (!query || query.length < 2) return jsonRes({ error: 'Query too short' }, 400);
  if (query.length > 500) return jsonRes({ error: 'Query too long' }, 400);

  const userMsg = isRadar
    ? `Run all 3 searches now to sweep for current small-cap signals. Context: ${query}. Return the combined JSON findings list.`
    : `Find current public information about: "${query}". Apply the SEARCH STRATEGY for active mode "${mode}". Return the JSON findings list.`;

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
        system:     modeSystem(mode, isRadar),
        tools: [
          { type: 'web_search_20250305', name: 'web_search', max_uses: 3 },
        ],
        messages: [
          { role: 'user', content: userMsg },
        ],
      }),
      signal: AbortSignal.timeout(22000),
    });

    if (!res.ok) {
      const errBody = await res.text();
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
    return jsonRes({ findings: [], warning: msg });
  }
}
