/**
 * Athena Intel - Vercel Serverless Function
 * Set ANTHROPIC_API_KEY in Vercel -> Project -> Settings -> Environment Variables.
 */

import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 8096;

const GEO_CONTEXT = `
MANDATORY GEOGRAPHIC SECURITY CONTEXT
Apply this whenever a location matches. Absence of recent news does NOT mean
the conflict has ended. Failure to flag known conflicts is an analytical error.

SOUTHEAST ASIA
- Yala, Narathiwat, Pattani, Songkhla (Thai Deep South): Active Malay-Muslim
  separatist insurgency since 2004. BRN conducts bombings, IEDs, drive-by
  shootings, arson of schools. 7,000+ deaths. ALWAYS flag HIGH RISK.
- Myanmar: Civil war since Feb 2021 coup. Active conflict in Sagaing, Chin,
  Kachin, Shan, Karen, Kayah. Junta airstrikes on civilians. HIGH-EXTREME.
- Mindanao, Philippines: BIFF, Abu Sayyaf, NPA active. MEDIUM-HIGH.
- West Papua, Indonesia: TPNPB insurgency. MEDIUM.

MIDDLE EAST AND NORTH AFRICA
- Gaza / West Bank: Active armed conflict. EXTREME.
- Yemen: Houthi control, active conflict. HIGH.
- Syria: Ongoing conflict, multiple armed actors. HIGH.
- Iraq: Residual ISIS, militia clashes. MEDIUM-HIGH.
- Lebanon: Volatile, Hezbollah presence. MEDIUM-HIGH.
- Sudan: Civil war since April 2023. HIGH in Khartoum, Darfur.

SOUTH ASIA
- Kashmir: Militant attacks, LoC incidents. HIGH.
- KPK / FATA, Pakistan: TTP, ISIS-K activity. HIGH.
- Afghanistan: Taliban control, ISIS-K attacks. HIGH.

AFRICA
- Sahel (Mali, Burkina Faso, Niger): JNIM and ISWAP. HIGH outside capitals.
- Cabo Delgado, Mozambique: ISIS-affiliated insurgency. HIGH.
- Eastern DRC: M23, ADF, dozens of armed groups. HIGH-EXTREME.
- Somalia: Al-Shabaab active across rural south-central. HIGH.

LATIN AMERICA
- Haiti: Gang control of major territory. EXTREME.
- Ecuador: Declared internal armed conflict Jan 2024. HIGH.
- Mexico (Guerrero, Sinaloa, Michoacan, Tamaulipas): Cartel territory. HIGH.
- Colombia (rural Cauca, Narino, Norte de Santander, Arauca): FARC-EP, ELN. HIGH.
`;

const SYSTEM_PROMPT = `You are a senior OSINT analyst for Athena Intel, used by:
(A) Law enforcement and government intelligence analysts
(B) Private-sector corporate security and risk professionals
(C) Travelers and individuals assessing personal safety

You receive a query and gathered live public-source material. Produce a structured intelligence brief.

${GEO_CONTEXT}

RULES
1. For location queries, ALWAYS apply geographic security context above.
2. analytical_perspective: REQUIRED, minimum 5 sentences.
3. recommendations: REQUIRED arrays (min 4 items each) for law_enforcement, private_sector, traveler.
4. Return ONLY valid JSON. No markdown, no preamble.

JSON SCHEMA:
{
  "query": "string",
  "type": "person|incident|location|organization|travel_risk",
  "summary": "2-3 sentence executive summary",
  "risk": "HIGH|MEDIUM|LOW",
  "sources": [{"title":"string","url":"string","domain":"string","date":"YYYY-MM-DD or null","type":"official|mainstream|ngo|local|reference","confidence":"high|medium|low"}],
  "timeline": [{"date":"YYYY-MM-DD","event":"string","source_title":"string","source_url":"string","confidence":"high|medium|low"}],
  "flags": [{"name":"string","description":"string","severity":"high|medium|low","evidence":"string","source_url":"string or null"}],
  "risk_assessment": {"level":"HIGH|MEDIUM|LOW","rationale":"string","factors":["string"]},
  "analytical_perspective": "REQUIRED 5+ sentence string",
  "recommendations": {
    "law_enforcement": ["min 4 items"],
    "private_sector": ["min 4 items"],
    "traveler": ["min 4 items"]
  }
}`;

// --- Data fetchers ---
async function tFetch(url, opts = {}, ms = 7000) {
  const ac  = new AbortController();
  const tid = setTimeout(() => ac.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ac.signal });
  } finally {
    clearTimeout(tid);
  }
}

async function fetchGoogleNews(q) {
  try {
    const r = await tFetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`,
      { headers: { 'User-Agent': 'AthenaIntel/1.0' } }, 5000
    );
    if (!r.ok) return [];
    return parseRSS(await r.text());
  } catch (_) { return []; }
}

function parseRSS(xml) {
  const out = [];
  const re  = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null && out.length < 10) {
    const c     = m[1];
    const title = (/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/.exec(c)||[])[1]||'';
    const link  = (/<link>(.*?)<\/link>/.exec(c)||[])[1]||'';
    const pub   = (/<pubDate>(.*?)<\/pubDate>/.exec(c)||[])[1]||'';
    const src   = /<source[^>]*url="([^"]*)"[^>]*>(.*?)<\/source>/.exec(c)||[];
    const clean = title.includes(' - ') ? title.split(' - ').slice(0,-1).join(' - ') : title;
    if (clean && link) {
      let domain = '';
      try { domain = new URL(src[1]||'').hostname.replace(/^www\./,''); } catch(_) {}
      let date = null;
      try { date = pub ? new Date(pub).toISOString().slice(0,10) : null; } catch(_) {}
      out.push({ title: clean.trim(), url: link.trim(), date, sourceName: (src[2]||'').trim()||domain, domain });
    }
  }
  return out;
}

async function fetchWikipedia(q) {
  try {
    const r = await tFetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=5&srprop=snippet`,
      {}, 6000
    );
    const d = await r.json();
    return (d?.query?.search||[]).map(w => ({
      title: w.title,
      snippet: w.snippet.replace(/<[^>]+>/g,''),
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(w.title.replace(/ /g,'_'))}`,
      domain: 'wikipedia.org'
    }));
  } catch(_) { return []; }
}

async function fetchWikidata(q) {
  try {
    const r = await tFetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(q)}&language=en&format=json&origin=*&limit=3`,
      {}, 5000
    );
    const d = await r.json();
    return (d?.search||[]).filter(e => e.description).map(e => ({
      title: e.label, snippet: e.description,
      url: `https://www.wikidata.org/wiki/${e.id}`, domain: 'wikidata.org'
    }));
  } catch(_) { return []; }
}

function buildContext(news, wiki, wd) {
  let ctx = '';
  if (news.length) {
    ctx += '=== LIVE NEWS ARTICLES ===\n';
    news.forEach((a,i) => { ctx += `[N${i+1}] "${a.title}"\n  Source: ${a.sourceName||a.domain}\n  URL: ${a.url}\n  Date: ${a.date||'unknown'}\n\n`; });
  }
  if (wiki.length) {
    ctx += '=== WIKIPEDIA ===\n';
    wiki.forEach((w,i) => { ctx += `[W${i+1}] "${w.title}"\n  ${w.snippet}\n  URL: ${w.url}\n\n`; });
  }
  if (wd.length) {
    ctx += '=== WIKIDATA ===\n';
    wd.forEach((e,i) => { ctx += `[D${i+1}] "${e.title}": ${e.snippet}\n  URL: ${e.url}\n\n`; });
  }
  return ctx.trim() || 'No external sources retrieved. Use geographic security context and training knowledge.';
}

async function analyzeWithClaude(q, context, apiKey) {
  const client = new Anthropic({ apiKey });
  const msg = await client.messages.create({
    model:      CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: `Query: "${q}"\n\nGATHERED INTELLIGENCE:\n${context}\n\nReturn the complete JSON brief. All fields are mandatory.` }]
  });
  const text = (msg.content?.[0]?.text || '')
    .replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
  try { return JSON.parse(text); }
  catch (_) {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Claude returned malformed JSON');
  }
}

// --- CORS ---
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function jsonRes(data, status, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  res.setHeader('Content-Type', 'application/json');
  res.status(status).end(JSON.stringify(data));
}

// --- Handler ---
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(204).end();
  }
  if (req.method !== 'POST') return jsonRes({ error: 'Only POST requests are supported' }, 405, res);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonRes({ error: 'ANTHROPIC_API_KEY is not set' }, 500, res);

  let q;
  try {
    const body = req.body || {};
    q = (body.query || '').trim();
  } catch(_) { return jsonRes({ error: 'Invalid JSON body' }, 400, res); }

  if (!q || q.length < 2) return jsonRes({ error: 'Query must be at least 2 characters' }, 400, res);

  try {
    const [news, wiki, wd] = await Promise.all([fetchGoogleNews(q), fetchWikipedia(q), fetchWikidata(q)]);
    const result = await analyzeWithClaude(q, buildContext(news, wiki, wd), apiKey);
    return jsonRes(result, 200, res);
  } catch (err) {
    console.error('Athena Intel error:', err);
    return jsonRes({ error: err.message || 'Analysis failed' }, 500, res);
  }
}
