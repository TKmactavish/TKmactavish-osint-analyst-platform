/**
 * Athena Intel - Vercel Serverless Function (Node.js)
 * Set ANTHROPIC_API_KEY in Vercel -> Project -> Settings -> Environment Variables.
 */

'use strict';

var https = require('https');

// --- Constants ---
var CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
var MAX_TOKENS   = 8096;

// --- Geographic security knowledge base ---
var GEO_CONTEXT = [
  'MANDATORY GEOGRAPHIC SECURITY CONTEXT',
  'Apply this whenever a location matches. Absence of recent news does NOT mean',
  'the conflict has ended. Failure to flag known conflicts is an analytical error.',
  '',
  'SOUTHEAST ASIA',
  '- Yala, Narathiwat, Pattani, Songkhla (Thai Deep South): Active Malay-Muslim',
  '  separatist insurgency since 2004. BRN conducts bombings, IEDs, drive-by',
  '  shootings, arson of schools. 7,000+ deaths. ALWAYS flag HIGH RISK.',
  '  Key sources: Bangkok Post, Khaosod English, Benar News, ICG, HRW.',
  '- Myanmar: Civil war since Feb 2021 coup. Kinetic conflict in Sagaing,',
  '  Chin, Kachin, Shan, Karen, Kayah. Junta airstrikes on civilians. HIGH-EXTREME.',
  '- Mindanao, Philippines: BIFF, Abu Sayyaf, NPA active. MEDIUM-HIGH.',
  '- West Papua, Indonesia: TPNPB insurgency in highland areas. MEDIUM.',
  '',
  'MIDDLE EAST AND NORTH AFRICA',
  '- Gaza / West Bank: Active armed conflict. EXTREME risk.',
  '- Yemen: Houthi control, active conflict. HIGH.',
  '- Syria: Ongoing conflict, multiple armed actors. HIGH outside major cities.',
  '- Iraq: Residual ISIS, militia clashes. MEDIUM-HIGH.',
  '- Lebanon: Volatile, Hezbollah presence. MEDIUM-HIGH.',
  '- Sudan: Civil war since April 2023 (SAF vs RSF). HIGH in Khartoum, Darfur.',
  '',
  'SOUTH ASIA',
  '- Kashmir: Militant attacks, LoC incidents. HIGH.',
  '- KPK / FATA, Pakistan: TTP, ISIS-K activity. HIGH.',
  '- Afghanistan: Taliban control, ISIS-K attacks. HIGH.',
  '',
  'AFRICA',
  '- Sahel (Mali, Burkina Faso, Niger): JNIM and ISWAP. HIGH outside capitals.',
  '- Cabo Delgado, Mozambique: ISIS-affiliated insurgency. HIGH.',
  '- Eastern DRC: M23, ADF, dozens of armed groups. HIGH-EXTREME.',
  '- Somalia: Al-Shabaab active across rural south-central. HIGH.',
  '',
  'LATIN AMERICA',
  '- Haiti: Gang control of major territory. EXTREME.',
  '- Ecuador: Declared internal armed conflict Jan 2024. HIGH.',
  '- Mexico (Guerrero, Sinaloa, Michoacan, Tamaulipas): Cartel territory. HIGH.',
  '- Colombia (rural Cauca, Narino, Norte de Santander, Arauca): FARC-EP, ELN. HIGH.'
].join('\n');

// --- System prompt ---
var SYSTEM_PROMPT = [
  'You are a senior OSINT analyst for Athena Intel, used by:',
  '(A) Law enforcement and government intelligence analysts',
  '(B) Private-sector corporate security and risk professionals',
  '(C) Travelers and individuals assessing personal safety',
  '',
  'You receive a query and gathered live public-source material.',
  'Produce a structured intelligence brief.',
  '',
  GEO_CONTEXT,
  '',
  'RULES',
  '1. For location queries, ALWAYS apply geographic security context above.',
  '2. analytical_perspective: REQUIRED, minimum 5 sentences covering situation',
  '   assessment, patterns and trends, source gaps, analyst flags, geopolitical context.',
  '3. recommendations: REQUIRED arrays (min 4 items each) for ALL THREE user types.',
  '4. Every flag must cite specific evidence from sources or the geo knowledge base.',
  '5. Return ONLY valid JSON. No markdown fences, no preamble, no trailing text.',
  '',
  'JSON SCHEMA:',
  '{',
  '  "query": "string",',
  '  "type": "person|incident|location|organization|travel_risk",',
  '  "summary": "2-3 sentence executive summary",',
  '  "risk": "HIGH|MEDIUM|LOW",',
  '  "sources": [{"title":"string","url":"string","domain":"string","date":"YYYY-MM-DD or null","type":"official|mainstream|ngo|local|reference","confidence":"high|medium|low"}],',
  '  "timeline": [{"date":"YYYY-MM-DD","event":"string","source_title":"string","source_url":"string","confidence":"high|medium|low"}],',
  '  "flags": [{"name":"string","description":"string","severity":"high|medium|low","evidence":"string","source_url":"string or null"}],',
  '  "risk_assessment": {"level":"HIGH|MEDIUM|LOW","rationale":"string","factors":["string"]},',
  '  "analytical_perspective": "REQUIRED 5+ sentence string",',
  '  "recommendations": {',
  '    "law_enforcement": ["min 4 items"],',
  '    "private_sector": ["min 4 items"],',
  '    "traveler": ["min 4 items"]',
  '  }',
  '}'
].join('\n');

// --- Anthropic API call via https module ---
function callAnthropic(apiKey, payload) {
  return new Promise(function(resolve, reject) {
    var bodyStr = JSON.stringify(payload);
    var options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(bodyStr)
      }
    };
    var req = https.request(options, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        resolve({ status: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    req.setTimeout(55000, function() {
      req.destroy(new Error('Anthropic API request timed out'));
    });
    req.write(bodyStr);
    req.end();
  });
}

async function analyzeWithClaude(q, context, apiKey) {
  var res = await callAnthropic(apiKey, {
    model:      CLAUDE_MODEL,
    max_tokens: MAX_TOKENS,
    system:     SYSTEM_PROMPT,
    messages:   [{ role: 'user', content: 'Query: "' + q + '"\n\nGATHERED INTELLIGENCE:\n' + context + '\n\nReturn the complete JSON brief. All fields are mandatory.' }]
  });

  if (res.status !== 200) {
    throw new Error('Anthropic API ' + res.status + ': ' + res.body.slice(0, 300));
  }

  var data = JSON.parse(res.body);
  var text = ((data.content && data.content[0] && data.content[0].text) || '')
    .replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();
  try { return JSON.parse(text); }
  catch (_) {
    var m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Claude returned malformed JSON');
  }
}

// --- Data fetchers (use global fetch, fail gracefully) ---
async function tFetch(url, opts, ms) {
  var ac = new AbortController();
  var tid = setTimeout(function() { ac.abort(); }, ms || 7000);
  try {
    return await fetch(url, Object.assign({}, opts || {}, { signal: ac.signal }));
  } finally {
    clearTimeout(tid);
  }
}

async function fetchGoogleNews(q) {
  try {
    var r = await tFetch(
      'https://news.google.com/rss/search?q=' + encodeURIComponent(q) + '&hl=en&gl=US&ceid=US:en',
      { headers: { 'User-Agent': 'AthenaIntel/1.0' } }, 5000
    );
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
    var title = (/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/.exec(c)||[])[1]||'';
    var link  = (/<link>(.*?)<\/link>/.exec(c)||[])[1]||'';
    var pub   = (/<pubDate>(.*?)<\/pubDate>/.exec(c)||[])[1]||'';
    var src   = /<source[^>]*url="([^"]*)"[^>]*>(.*?)<\/source>/.exec(c)||[];
    var clean = title.indexOf(' - ') !== -1 ? title.split(' - ').slice(0,-1).join(' - ') : title;
    if (clean && link) {
      var domain = '';
      try { domain = new URL(src[1]||'').hostname.replace(/^www\./,''); } catch(_) {}
      var date = null;
      try { date = pub ? new Date(pub).toISOString().slice(0,10) : null; } catch(_) {}
      out.push({ title: clean.trim(), url: link.trim(), date: date, sourceName: (src[2]||'').trim()||domain, domain: domain });
    }
  }
  return out;
}

async function fetchWikipedia(q) {
  try {
    var r = await tFetch('https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(q) + '&format=json&origin=*&srlimit=5&srprop=snippet', {}, 6000);
    var d = await r.json();
    return ((d && d.query && d.query.search) || []).map(function(w) {
      return { title: w.title, snippet: w.snippet.replace(/<[^>]+>/g,''), url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(w.title.replace(/ /g,'_')), domain: 'wikipedia.org' };
    });
  } catch(_) { return []; }
}

async function fetchWikidata(q) {
  try {
    var r = await tFetch('https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' + encodeURIComponent(q) + '&language=en&format=json&origin=*&limit=3', {}, 5000);
    var d = await r.json();
    return ((d && d.search)||[]).filter(function(e){return e.description;}).map(function(e){
      return { title: e.label, snippet: e.description, url: 'https://www.wikidata.org/wiki/' + e.id, domain: 'wikidata.org' };
    });
  } catch(_) { return []; }
}

function buildContext(news, wiki, wd) {
  var ctx = '';
  if (news.length) {
    ctx += '=== LIVE NEWS ARTICLES ===\n';
    news.forEach(function(a,i) { ctx += '[N'+(i+1)+'] "'+a.title+'"\n  Source: '+(a.sourceName||a.domain)+'\n  URL: '+a.url+'\n  Date: '+(a.date||'unknown')+'\n\n'; });
  }
  if (wiki.length) {
    ctx += '=== WIKIPEDIA ===\n';
    wiki.forEach(function(w,i) { ctx += '[W'+(i+1)+'] "'+w.title+'"\n  '+w.snippet+'\n  URL: '+w.url+'\n\n'; });
  }
  if (wd.length) {
    ctx += '=== WIKIDATA ===\n';
    wd.forEach(function(e,i) { ctx += '[D'+(i+1)+'] "'+e.title+'": '+e.snippet+'\n  URL: '+e.url+'\n\n'; });
  }
  return ctx.trim() || 'No external sources retrieved. Use geographic security context and training knowledge.';
}

// --- CORS ---
var CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function jsonRes(data, status, res) {
  Object.keys(CORS).forEach(function(k) { res.setHeader(k, CORS[k]); });
  res.setHeader('Content-Type', 'application/json');
  res.status(status).end(JSON.stringify(data));
}

// --- Handler ---
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.keys(CORS).forEach(function(k) { res.setHeader(k, CORS[k]); });
    return res.status(204).end();
  }
  if (req.method !== 'POST') return jsonRes({ error: 'Only POST requests are supported' }, 405, res);

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonRes({ error: 'ANTHROPIC_API_KEY is not set' }, 500, res);

  var q;
  try {
    var body = req.body || {};
    q = (body.query || '').trim();
  } catch(_) { return jsonRes({ error: 'Invalid JSON body' }, 400, res); }

  if (!q || q.length < 2) return jsonRes({ error: 'Query must be at least 2 characters' }, 400, res);

  try {
    var fetched = await Promise.all([fetchGoogleNews(q), fetchWikipedia(q), fetchWikidata(q)]);
    var result  = await analyzeWithClaude(q, buildContext(fetched[0], fetched[1], fetched[2]), apiKey);
    return jsonRes(result, 200, res);
  } catch (err) {
    console.error('Athena Intel error:', err);
    return jsonRes({ error: err.message || 'Analysis failed' }, 500, res);
  }
};
