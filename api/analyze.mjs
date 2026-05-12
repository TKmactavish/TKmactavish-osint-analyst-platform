export const config = { runtime: 'edge' };

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 4000;

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
  'You are a senior OSINT analyst for Athena Intel, a professional open-source intelligence platform used by:',
  '  (A) Law enforcement and government intelligence analysts',
  '  (B) Private-sector corporate security and risk professionals',
  '  (C) Travelers and individuals assessing personal safety',
  '',
  'You receive a query and gathered live public-source material. Produce a structured intelligence brief.',
  '',
  'MANDATORY GEOGRAPHIC SECURITY CONTEXT (apply whenever a location matches):',
  '- Thai Deep South (Yala, Narathiwat, Pattani, Songkhla): active BRN separatist insurgency since 2004. 7,000+ deaths. ALWAYS HIGH RISK. Key sources: Bangkok Post, Khaosod English, Benar News, ICG, HRW.',
  '- Myanmar: civil war since Feb 2021 coup. Kinetic conflict in Sagaing/Chin/Kachin/Shan/Karen/Kayah. HIGH-EXTREME.',
  '- Mindanao Philippines (BIFF, Abu Sayyaf remnants, NPA): MEDIUM-HIGH.',
  '- West Papua Indonesia (TPNPB highland insurgency): MEDIUM.',
  '- Gaza / West Bank: active armed conflict. EXTREME.',
  '- Yemen: Houthi control, active conflict. HIGH.',
  '- Syria: ongoing conflict, multiple armed actors. HIGH outside major cities.',
  '- Iraq: residual ISIS, militia clashes. MEDIUM-HIGH.',
  '- Lebanon: volatile, Hezbollah presence. MEDIUM-HIGH.',
  '- Sudan: civil war since April 2023 (SAF vs RSF). HIGH-EXTREME in Khartoum, Darfur.',
  '- Kashmir, KPK/FATA Pakistan, Afghanistan: HIGH.',
  '- Sahel (Mali, Burkina Faso, Niger): JNIM/ISWAP. HIGH outside capitals.',
  '- Cabo Delgado Mozambique: ISIS-affiliated insurgency. HIGH.',
  '- Eastern DRC: M23/ADF and dozens of armed groups. HIGH-EXTREME.',
  '- Somalia: Al-Shabaab in rural south-central. HIGH.',
  '- Haiti: gang control of major territory. EXTREME.',
  '- Ecuador: declared internal armed conflict Jan 2024. HIGH.',
  '- Mexico cartel areas (Guerrero, Sinaloa, Michoacan, Tamaulipas): HIGH.',
  '- Colombia rural (Cauca, Narino, Norte de Santander, Arauca): FARC-EP/ELN. HIGH.',
  '',
  'Absence of recent news does NOT mean a conflict has ended. Failure to flag known conflicts is an analytical error.',
  '',
  'RULES:',
  '1. For locations, ALWAYS apply the geo context above.',
  '2. analytical_perspective: minimum 5 sentences (situation, patterns, source gaps, analyst-level flags, geopolitics).',
  '3. recommendations: minimum 4 items in EACH of law_enforcement, private_sector, traveler.',
  '4. Every flag must cite specific evidence.',
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

// --- Live data fetchers ------------------------------------------------------
async function tFetch(url, opts, ms) {
  return await fetch(url, { ...(opts || {}), signal: AbortSignal.timeout(ms || 6000) });
}

async function fetchGoogleNews(q) {
  try {
    const r = await tFetch(
      'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en&gl=US&ceid=US:en',
      { headers: { 'User-Agent': 'AthenaIntel/1.0' } }, 5000
    );
    if (!r.ok) return [];
    return parseRSS(await r.text());
  } catch { return []; }
}

function parseRSS(xml) {
  const out = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null && out.length < 8) {
    const c = m[1];
    const title = (/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/.exec(c) || [])[1] || '';
    const link  = (/<link>(.*?)<\/link>/.exec(c) || [])[1] || '';
    const pub   = (/<pubDate>(.*?)<\/pubDate>/.exec(c) || [])[1] || '';
    const src   = /<source[^>]*url="([^"]*)"[^>]*>(.*?)<\/source>/.exec(c) || [];
    const clean = title.includes(' - ') ? title.split(' - ').slice(0, -1).join(' - ') : title;
    if (clean && link) {
      let domain = '';
      try { domain = new URL(src[1] || '').hostname.replace(/^www\./, ''); } catch {}
      let date = null;
      try { date = pub ? new Date(pub).toISOString().slice(0, 10) : null; } catch {}
      out.push({ title: clean.trim(), url: link.trim(), date, sourceName: (src[2] || '').trim() || domain, domain });
    }
  }
  return out;
}

async function fetchWikipedia(q) {
  try {
    const r = await tFetch(
      'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
      encodeURIComponent(q) + '&format=json&origin=*&srlimit=4&srprop=snippet',
      {}, 5000
    );
    const d = await r.json();
    return ((d?.query?.search) || []).map(w => ({
      title:   w.title,
      snippet: w.snippet.replace(/<[^>]+>/g, ''),
      url:     'https://en.wikipedia.org/wiki/' + encodeURIComponent(w.title.replace(/ /g, '_')),
      domain:  'wikipedia.org',
    }));
  } catch { return []; }
}

async function fetchWikidata(q) {
  try {
    const r = await tFetch(
      'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' +
      encodeURIComponent(q) + '&language=en&format=json&origin=*&limit=3',
      {}, 4000
    );
    const d = await r.json();
    return ((d?.search) || []).filter(e => e.description).map(e => ({
      title: e.label, snippet: e.description,
      url: 'https://www.wikidata.org/wiki/' + e.id, domain: 'wikidata.org',
    }));
  } catch { return []; }
}

function buildContext(news, wiki, wd) {
  let ctx = '';
  if (news.length) {
    ctx += '=== LIVE NEWS ARTICLES ===\n';
    news.forEach((a, i) => {
      ctx += `[N${i + 1}] "${a.title}"\n  Source: ${a.sourceName || a.domain}\n  URL: ${a.url}\n  Date: ${a.date || 'unknown'}\n\n`;
    });
  }
  if (wiki.length) {
    ctx += '=== WIKIPEDIA ===\n';
    wiki.forEach((w, i) => {
      ctx += `[W${i + 1}] "${w.title}"\n  ${w.snippet}\n  URL: ${w.url}\n\n`;
    });
  }
  if (wd.length) {
    ctx += '=== WIKIDATA ===\n';
    wd.forEach((e, i) => {
      ctx += `[D${i + 1}] "${e.title}": ${e.snippet}\n  URL: ${e.url}\n\n`;
    });
  }
  return ctx.trim() || 'No external sources retrieved. Use geographic security context and training knowledge.';
}

// --- Anthropic API call ------------------------------------------------------
async function analyzeWithClaude(q, context, apiKey) {
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
        `Query: "${q}"\n\nGATHERED INTELLIGENCE:\n${context}\n\nReturn the complete JSON brief. All fields are mandatory.`
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

// --- Handler -----------------------------------------------------------------
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
    const [news, wiki, wd] = await Promise.all([
      fetchGoogleNews(q),
      fetchWikipedia(q),
      fetchWikidata(q),
    ]);
    const result = await analyzeWithClaude(q, buildContext(news, wiki, wd), apiKey);
    return jsonRes(result);
  } catch (err) {
    return jsonRes({ error: (err && err.message) || 'Analysis failed' }, 500);
  }
}
