export const config = { runtime: 'edge' };

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 2500;

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
  'You are a senior OSINT analyst for Athena Intel — used by law enforcement, corporate security, and travelers.',
  'You receive a query plus gathered public-source material. Produce a structured intelligence brief.',
  '',
  'GEOGRAPHIC SECURITY CONTEXT — apply when location matches (absence of recent news does NOT mean conflict ended):',
  '- Thai Deep South (Yala, Narathiwat, Pattani, Songkhla): active BRN separatist insurgency. ALWAYS HIGH RISK.',
  '- Myanmar (post-2021 coup): kinetic civil war in Sagaing/Chin/Kachin/Shan/Karen/Kayah. HIGH-EXTREME.',
  '- Mindanao PH (BIFF, Abu Sayyaf, NPA): MEDIUM-HIGH.',
  '- Gaza/West Bank: active armed conflict. EXTREME.',
  '- Yemen, Syria (rural), Sudan (Khartoum/Darfur): HIGH.',
  '- Sahel (Mali, Burkina Faso, Niger — JNIM/ISWAP): HIGH outside capitals.',
  '- Eastern DRC (M23/ADF), Somalia (Al-Shabaab rural): HIGH-EXTREME.',
  '- Haiti (gang control): EXTREME. Ecuador (internal armed conflict): HIGH.',
  '- Mexico cartel zones (Guerrero, Sinaloa, Michoacan, Tamaulipas): HIGH.',
  '- Colombia rural (Cauca, Narino, Norte de Santander, Arauca — FARC-EP/ELN): HIGH.',
  '- Kashmir, KPK/FATA Pakistan, Afghanistan: HIGH.',
  '',
  'RULES:',
  '1. For locations, ALWAYS apply the geo context above.',
  '2. analytical_perspective: minimum 5 sentences.',
  '3. recommendations: minimum 4 items in each of law_enforcement, private_sector, traveler.',
  '4. Return ONLY valid JSON, no markdown fences, no preamble.',
  '',
  'JSON SCHEMA:',
  '{ "query": str, "type": "person|incident|location|organization|travel_risk", "summary": str, "risk": "HIGH|MEDIUM|LOW",',
  '  "sources": [{"title":str,"url":str,"domain":str,"date":"YYYY-MM-DD|null","type":"official|mainstream|ngo|local|reference","confidence":"high|medium|low"}],',
  '  "timeline": [{"date":"YYYY-MM-DD","event":str,"source_title":str,"source_url":str,"confidence":"high|medium|low"}],',
  '  "flags": [{"name":str,"description":str,"severity":"high|medium|low","evidence":str,"source_url":"str|null"}],',
  '  "risk_assessment": {"level":"HIGH|MEDIUM|LOW","rationale":str,"factors":[str]},',
  '  "analytical_perspective": str,',
  '  "recommendations": {"law_enforcement":[str],"private_sector":[str],"traveler":[str]} }'
].join('\n');

async function tFetch(url, opts, ms) {
  return await fetch(url, { ...(opts || {}), signal: AbortSignal.timeout(ms || 3500) });
}

async function fetchGoogleNews(q) {
  try {
    const r = await tFetch(
      'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en&gl=US&ceid=US:en',
      { headers: { 'User-Agent': 'AthenaIntel/1.0' } }, 3500
    );
    if (!r.ok) return [];
    return parseRSS(await r.text());
  } catch { return []; }
}

function parseRSS(xml) {
  const out = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null && out.length < 6) {
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
      encodeURIComponent(q) + '&format=json&origin=*&srlimit=3&srprop=snippet',
      {}, 3000
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
      encodeURIComponent(q) + '&language=en&format=json&origin=*&limit=2',
      {}, 3000
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
    ctx += '=== LIVE NEWS ===\n';
    news.forEach((a, i) => {
      ctx += `[N${i + 1}] "${a.title}" — ${a.sourceName || a.domain} ${a.date || ''}\n  ${a.url}\n`;
    });
  }
  if (wiki.length) {
    ctx += '\n=== WIKIPEDIA ===\n';
    wiki.forEach((w, i) => {
      ctx += `[W${i + 1}] "${w.title}" — ${w.snippet}\n  ${w.url}\n`;
    });
  }
  if (wd.length) {
    ctx += '\n=== WIKIDATA ===\n';
    wd.forEach((e, i) => {
      ctx += `[D${i + 1}] "${e.title}": ${e.snippet}\n  ${e.url}\n`;
    });
  }
  return ctx.trim() || 'No external sources retrieved. Use geo context and training knowledge.';
}

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
        `Query: "${q}"\n\nGATHERED INTELLIGENCE:\n${context}\n\nReturn the complete JSON brief. All fields mandatory.`
      }],
    }),
    signal: AbortSignal.timeout(26000),
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
