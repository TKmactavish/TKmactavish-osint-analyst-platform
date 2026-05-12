/**
 * Athena Intel – Vercel Edge Function
 * Edge runtime uses V8-based fetch (same family as Cloudflare Workers).
 * This resolves the TCP-hang issue that affects Node.js serverless functions.
 */

export const config = { runtime: 'edge', maxDuration: 30 };

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 8096;

// --- Geographic security knowledge base --------------------------------------
const GEO_CONTEXT =
'MANDATORY GEOGRAPHIC SECURITY CONTEXT\n' +
'Apply this whenever a location matches. Absence of recent news does NOT mean\n' +
'the conflict has ended. Failure to flag known conflicts is an analytical error.\n\n' +
'SOUTHEAST ASIA\n' +
'- Yala, Narathiwat, Pattani, Songkhla (Thai Deep South): Active Malay-Muslim\n' +
'  separatist insurgency since 2004. BRN conducts bombings, IEDs, drive-by\n' +
'  shootings, arson of schools. 7,000+ deaths. ALWAYS flag HIGH RISK.\n' +
'  Key sources: Bangkok Post, Khaosod English, Benar News, ICG, HRW.\n' +
'- Myanmar: Civil war since Feb 2021 coup. Active kinetic conflict in Sagaing,\n' +
'  Chin, Kachin, Shan, Karen, Kayah. Junta airstrikes on civilian areas. HIGH-EXTREME.\n' +
'- Mindanao, Philippines: BIFF, Abu Sayyaf remnants, NPA active. MEDIUM-HIGH.\n' +
'- West Papua, Indonesia: TPNPB insurgency in highland areas. MEDIUM.\n\n' +
'MIDDLE EAST & NORTH AFRICA\n' +
'- Gaza / West Bank: Active armed conflict. EXTREME risk.\n' +
'- Yemen: Houthi control, active conflict. HIGH.\n' +
'- Syria: Ongoing conflict, multiple armed actors. HIGH outside major cities.\n' +
'- Iraq: Residual ISIS, militia clashes. MEDIUM-HIGH.\n' +
'- Lebanon: Volatile, Hezbollah presence. MEDIUM-HIGH.\n' +
'- Sudan: Civil war since April 2023 (SAF vs RSF). HIGH in Khartoum, Darfur.\n\n' +
'SOUTH ASIA\n' +
'- Kashmir: Militant attacks, LoC incidents. HIGH.\n' +
'- KPK / FATA, Pakistan: TTP, ISIS-K activity. HIGH.\n' +
'- Afghanistan: Taliban control, ISIS-K attacks. HIGH.\n\n' +
'AFRICA\n' +
'- Sahel (Mali, Burkina Faso, Niger): JNIM and ISWAP. HIGH outside capitals.\n' +
'- Cabo Delgado, Mozambique: ISIS-affiliated insurgency. HIGH.\n' +
'- Eastern DRC: M23, ADF, dozens of armed groups. HIGH-EXTREME.\n' +
'- Somalia: Al-Shabaab active across rural south-central. HIGH.\n' +
'- Sudan: Active civil war. HIGH-EXTREME in Khartoum, Darfur.\n\n' +
'LATIN AMERICA\n' +
'- Haiti: Gang control of major territory. EXTREME.\n' +
'- Ecuador: Declared internal armed conflict Jan 2024. HIGH.\n' +
'- Mexico (Guerrero, Sinaloa, Michoacan, Tamaulipas): Cartel territory. HIGH.\n' +
'- Colombia (rural Cauca, Narino, Norte de Santander, Arauca): FARC-EP, ELN. HIGH.\n';

// --- System prompt -----------------------------------------------------------
const SYSTEM_PROMPT =
'You are a senior OSINT analyst for Athena Intel, a professional\n' +
'open-source intelligence platform used by:\n' +
'  (A) Law enforcement and government intelligence analysts\n' +
'  (B) Private-sector corporate security and risk professionals\n' +
'  (C) Travelers and individuals assessing personal safety\n\n' +
'You receive a query and gathered live public-source material (news articles,\n' +
'Wikipedia entries, Wikidata entities). Produce a structured intelligence brief.\n\n' +
GEO_CONTEXT + '\n\n' +
'RULES\n' +
'1. For location queries, ALWAYS apply geographic security context above.\n' +
'2. analytical_perspective: REQUIRED, minimum 5 sentences covering situation\n' +
'   assessment, patterns and trends, source gaps, analyst-level flags, geopolitical context.\n' +
'3. recommendations: REQUIRED arrays (minimum 4 items each) for ALL THREE user types.\n' +
'4. Every flag must cite specific evidence from sources or the geo knowledge base.\n' +
'5. Return ONLY valid JSON with no markdown fences, no preamble, no trailing text.\n\n' +
'JSON SCHEMA:\n' +
'{\n' +
'  "query": "string",\n' +
'  "type": "person|incident|location|organization|travel_risk",\n' +
'  "summary": "2-3 sentence executive summary",\n' +
'  "risk": "HIGH|MEDIUM|LOW",\n' +
'  "sources": [{"title":"string","url":"string","domain":"string","date":"YYYY-MM-DD or null","type":"official|mainstream|ngo|local|reference","confidence":"high|medium|low"}],\n' +
'  "timeline": [{"date":"YYYY-MM-DD","event":"string","source_title":"string","source_url":"string","confidence":"high|medium|low"}],\n' +
'  "flags": [{"name":"string","description":"string","severity":"high|medium|low","evidence":"string","source_url":"string or null"}],\n' +
'  "risk_assessment": {"level":"HIGH|MEDIUM|LOW","rationale":"string","factors":["string"]},\n' +
'  "analytical_perspective": "REQUIRED 5+ sentence string",\n' +
'  "recommendations": {\n' +
'    "law_enforcement": ["min 4 items"],\n' +
'    "private_sector": ["min 4 items"],\n' +
'    "traveler": ["min 4 items"]\n' +
'  }\n' +
'}';

// --- CORS headers ------------------------------------------------------------
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonRes(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: Object.assign({ 'Content-Type': 'application/json' }, CORS),
  });
}

// --- Anthropic API call via edge fetch ---------------------------------------
async function analyzeWithClaude(q, context, apiKey) {
  var controller = new AbortController();
  var tid = setTimeout(function() { controller.abort(); }, 25000);
  try {
    var r = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
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
          'Query: "' + q + '"\n\nGATHERED INTELLIGENCE:\n' + context +
          '\n\nReturn the complete JSON brief. All fields are mandatory.'
        }],
      }),
      signal: controller.signal,
    });
    if (!r.ok) {
      var errBody = await r.text();
      throw new Error('Anthropic API ' + r.status + ': ' + errBody.slice(0, 300));
    }
    var data = await r.json();
    var text = (data.content && data.content[0] && data.content[0].text || '')
      .replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
    try { return JSON.parse(text); }
    catch (_) {
      var m = text.match(/\{[\s\S]*\}/);
      if (m) return JSON.parse(m[0]);
      throw new Error('Claude returned malformed JSON');
    }
  } finally {
    clearTimeout(tid);
  }
}

// --- Data fetchers -----------------------------------------------------------
async function tFetch(url, opts, ms) {
  var ac  = new AbortController();
  var tid = setTimeout(function() { ac.abort(); }, ms || 7000);
  try {
    return await fetch(url, Object.assign({}, opts, { signal: ac.signal }));
  } finally {
    clearTimeout(tid);
  }
}

async function fetchGoogleNews(q) {
  var url = 'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en&gl=US&ceid=US:en';
  try {
    var r = await tFetch(url, { headers: { 'User-Agent': 'AthenaIntel/1.0' } }, 5000);
    if (!r.ok) return [];
    return parseRSS(await r.text());
  } catch (_) { return []; }
}

function parseRSS(xml) {
  var out = [];
  var re  = /<item>([\s\S]*?)<\/item>/g;
  var m;
  while ((m = re.exec(xml)) !== null && out.length < 10) {
    var c     = m[1];
    var title = (/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/.exec(c) || [])[1] || '';
    var link  = (/<link>(.*?)<\/link>/.exec(c) || [])[1] || '';
    var pub   = (/<pubDate>(.*?)<\/pubDate>/.exec(c) || [])[1] || '';
    var src   = /<source[^>]*url="([^"]*)"[^>]*>(.*?)<\/source>/.exec(c) || [];
    var clean = title.includes(' - ') ? title.split(' - ').slice(0, -1).join(' - ') : title;
    if (clean && link) {
      var domain = '';
      try { domain = new URL(src[1] || '').hostname.replace(/^www\./, ''); } catch (_) {}
      var date = null;
      try { date = pub ? new Date(pub).toISOString().slice(0, 10) : null; } catch (_) {}
      out.push({ title: clean.trim(), url: link.trim(), date: date, sourceName: (src[2] || '').trim() || domain, domain: domain });
    }
  }
  return out;
}

async function fetchWikipedia(q) {
  try {
    var r = await tFetch(
      'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
      encodeURIComponent(q) + '&format=json&origin=*&srlimit=5&srprop=snippet',
      {}, 6000
    );
    var d = await r.json();
    return ((d && d.query && d.query.search) || []).map(function(w) {
      return {
        title:   w.title,
        snippet: w.snippet.replace(/<[^>]+>/g, ''),
        url:     'https://en.wikipedia.org/wiki/' + encodeURIComponent(w.title.replace(/ /g, '_')),
        domain:  'wikipedia.org',
      };
    });
  } catch (_) { return []; }
}

async function fetchWikidata(q) {
  try {
    var r = await tFetch(
      'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' +
      encodeURIComponent(q) + '&language=en&format=json&origin=*&limit=3',
      {}, 5000
    );
    var d = await r.json();
    return ((d && d.search) || []).filter(function(e) { return e.description; }).map(function(e) {
      return { title: e.label, snippet: e.description, url: 'https://www.wikidata.org/wiki/' + e.id, domain: 'wikidata.org' };
    });
  } catch (_) { return []; }
}

function buildContext(news, wiki, wd) {
  var ctx = '';
  if (news.length) {
    ctx += '=== LIVE NEWS ARTICLES ===\n';
    news.forEach(function(a, i) {
      ctx += '[N' + (i + 1) + '] "' + a.title + '"\n  Source: ' + (a.sourceName || a.domain) + '\n  URL: ' + a.url + '\n  Date: ' + (a.date || 'unknown') + '\n\n';
    });
  }
  if (wiki.length) {
    ctx += '=== WIKIPEDIA ===\n';
    wiki.forEach(function(w, i) {
      ctx += '[W' + (i + 1) + '] "' + w.title + '"\n  ' + w.snippet + '\n  URL: ' + w.url + '\n\n';
    });
  }
  if (wd.length) {
    ctx += '=== WIKIDATA ===\n';
    wd.forEach(function(e, i) {
      ctx += '[D' + (i + 1) + '] "' + e.title + '": ' + e.snippet + '\n  URL: ' + e.url + '\n\n';
    });
  }
  return ctx.trim() || 'No external sources retrieved. Use geographic security context and training knowledge.';
}

// --- Edge handler ------------------------------------------------------------
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== 'POST') {
    return jsonRes({ error: 'Only POST requests are supported' }, 405);
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonRes({ error: 'ANTHROPIC_API_KEY is not set' }, 500);

  var q;
  try {
    var body = await req.json();
    q = (body.query || '').trim();
  } catch (_) { return jsonRes({ error: 'Invalid JSON body' }, 400); }

  if (!q || q.length < 2) return jsonRes({ error: 'Query must be at least 2 characters' }, 400);

  try {
    var fetched = await Promise.all([fetchGoogleNews(q), fetchWikipedia(q), fetchWikidata(q)]);
    var result  = await analyzeWithClaude(q, buildContext(fetched[0], fetched[1], fetched[2]), apiKey);
    return jsonRes(result, 200);
  } catch (err) {
    console.error('Athena Intel error:', err);
    return jsonRes({ error: err.message || 'Analysis failed' }, 500);
  }
}
