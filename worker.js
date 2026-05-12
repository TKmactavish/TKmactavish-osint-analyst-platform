/**
 * Athena Intel – Cloudflare Worker
 *
 * Fetches live public-source data (Google News RSS, Wikipedia, Wikidata),
 * passes it to Claude for structured OSINT analysis, and returns JSON.
 *
 * Deploy:
 *   wrangler deploy
 *   wrangler secret put ANTHROPIC_API_KEY
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL  = 'claude-sonnet-4-6';
const MAX_TOKENS    = 3500;

// ─── Geographic security context injected into every analysis ────────────────

const GEO_CONTEXT = `
MANDATORY GEOGRAPHIC SECURITY CONTEXT
Apply this knowledge whenever a location query matches, regardless of whether
recent news explicitly mentions the conflict. Failure to flag known conflicts
for matching locations is an analytical error.

SOUTHEAST ASIA
• Yala, Narathiwat, Pattani, Songkhla (southern Thailand / "Deep South"):
  Active Malay-Muslim separatist insurgency since 2004. BRN (Barisan Revolusi
  Nasional) and splinter groups conduct bombings, IED attacks, drive-by
  shootings, arson of schools and government buildings. 7,000+ deaths since
  2004. ALWAYS flag HIGH RISK. Key sources: Bangkok Post, Khaosod English,
  Benar News, ICG, Human Rights Watch.
• Myanmar: Civil war since Feb 2021 coup. PDF, ethnic armies (KIA, KNU,
  KNPP, TNLA, AA, MNDAA) control large areas. Active kinetic conflict in
  Sagaing, Chin, Kachin, northern Shan, Karen, Kayah. Junta airstrikes on
  civilian areas. EXTREME/HIGH RISK.
• Mindanao, Philippines: BIFF, remnant Abu Sayyaf active in BARMM and
  Zamboanga Peninsula. NPA (communist) active in rural areas nationwide.
  MEDIUM–HIGH risk in affected areas.
• West Papua, Indonesia: Low-level TPNPB insurgency. Periodic attacks on
  security forces and civilians in highland regencies. MEDIUM risk in
  highland areas.

MIDDLE EAST & NORTH AFRICA
• Gaza / West Bank: Active armed conflict. EXTREME risk.
• Yemen: Houthi control north; active conflict. HIGH risk.
• Syria: Ongoing conflict, multiple armed actors. HIGH risk outside major cities.
• Iraq: Residual ISIS activity, militia clashes. MEDIUM–HIGH.
• Lebanon: Volatile; Hezbollah presence; periodic cross-border fire. MEDIUM–HIGH.
• Libya: Rival governments, armed groups. HIGH risk outside secured areas.
• Sudan: Civil war since April 2023 (SAF vs RSF). HIGH risk in Khartoum, Darfur.

SOUTH ASIA
• Kashmir (India/Pakistan): Militant attacks, Line of Control incidents. HIGH.
• Khyber Pakhtunkhwa / FATA, Pakistan: TTP, ISIS-K activity. HIGH.
• Balochistan, Pakistan: BLA insurgency, militant attacks. MEDIUM–HIGH.
• Afghanistan: Taliban control; ISIS-K attacks on civilians. HIGH.

AFRICA
• Sahel (Mali, Burkina Faso, Niger): JNIM and ISWAP active across large areas.
  Security forces losing ground. HIGH risk outside capitals.
• Cabo Delgado, Mozambique: ISIS-affiliated insurgency since 2017. HIGH.
• Eastern DRC: M23 (RWC-backed), ADF, and dozens of other armed groups.
  Active conflict in North/South Kivu, Ituri. HIGH–EXTREME.
• Somalia: Al-Shabaab controls rural south-central areas; attacks in Mogadishu.
• Nigeria (Borno, northeast): Boko Haram/ISWAP. HIGH in Borno rural areas.
• Ethiopia (Amhara, Oromia): Active armed conflict. HIGH.

LATIN AMERICA
• Haiti: Gang control of most Port-au-Prince and major routes. EXTREME risk.
• Ecuador: Cartel violence; declared internal armed conflict Jan 2024. HIGH.
• Mexico (Guerrero, Sinaloa, Michoacán, Tamaulipas, Zacatecas): Cartel
  territory; kidnapping, violence against foreigners. HIGH in affected states.
• Colombia (rural areas): FARC dissidents (EMC/FARC-EP), ELN active in
  Cauca, Nariño, Norte de Santander, Arauca, Pacific coast. MEDIUM–HIGH.
• Venezuela: Widespread crime, colectivos, FARC/ELN presence in border areas.
`;

// ─── Claude system prompt ─────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior OSINT analyst for Athena Intel, a professional
open-source intelligence platform used by:
  (A) Law enforcement and government intelligence analysts
  (B) Private-sector corporate security and risk professionals
  (C) Travelers and individuals assessing personal safety

You will receive a search query plus gathered public-source material (news
articles, Wikipedia entries, Wikidata entities). Your job is to produce a
comprehensive, structured intelligence brief.

${GEO_CONTEXT}

ANALYTICAL STANDARDS
1. Prioritise factual claims backed by cited sources. Label confidence honestly.
2. For location queries, ALWAYS cross-reference the geographic security context
   above. Even if no recent news article mentions a known conflict, you MUST
   flag it — the absence of fresh news does not mean the conflict has ended.
3. The "analytical_perspective" field must contain substantive analysis of at
   least 5 sentences covering: (a) situation assessment, (b) patterns and
   trends, (c) contradictions or gaps between sources, (d) what an experienced
   analyst would flag beyond the obvious headlines, (e) relevant geopolitical
   or socio-political context.
4. The "recommendations" object must contain non-empty, actionable arrays for
   ALL THREE user types. Each array must have at least 4 specific items.
   Generic advice is not acceptable — tailor to the specific query.
5. Every flag must include evidence citing a specific source or the geographic
   security context knowledge base.
6. Cite source URLs wherever possible.

OUTPUT FORMAT
Return ONLY a valid JSON object — no markdown fences, no commentary, no
preamble. The JSON must conform exactly to this schema:

{
  "query": "<original query>",
  "type": "person | incident | location | organization | travel_risk",
  "summary": "<2-3 sentence executive summary>",
  "risk": "HIGH | MEDIUM | LOW",
  "sources": [
    {
      "title": "<title>",
      "url": "<url>",
      "domain": "<domain>",
      "date": "<YYYY-MM-DD or null>",
      "type": "official | mainstream | ngo | local | reference",
      "confidence": "high | medium | low"
    }
  ],
  "timeline": [
    {
      "date": "<YYYY-MM-DD>",
      "event": "<what happened>",
      "source_title": "<source name>",
      "source_url": "<url>",
      "confidence": "high | medium | low"
    }
  ],
  "flags": [
    {
      "name": "<flag name>",
      "description": "<detailed description>",
      "severity": "high | medium | low",
      "evidence": "<specific evidence from sources or geographic knowledge base>",
      "source_url": "<url or null>"
    }
  ],
  "risk_assessment": {
    "level": "HIGH | MEDIUM | LOW",
    "rationale": "<explanation of why this risk level>",
    "factors": ["<factor 1>", "<factor 2>"]
  },
  "analytical_perspective": "<REQUIRED: 5+ sentences. Situation assessment, patterns, contradictions, analyst-level flags, geopolitical context>",
  "recommendations": {
    "law_enforcement": [
      "<specific action item — minimum 4>"
    ],
    "private_sector": [
      "<specific action item — minimum 4>"
    ],
    "traveler": [
      "<specific safety/preparation item — minimum 4>"
    ]
  }
}`;

// ─── Helper: timeout-safe fetch ───────────────────────────────────────────────

async function timedFetch(url, opts = {}, ms = 7000) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { ...opts, signal: ctrl.signal });
    return r;
  } finally {
    clearTimeout(tid);
  }
}

// ─── Data sources ─────────────────────────────────────────────────────────────

async function fetchGoogleNews(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en&gl=US&ceid=US:en`;
  try {
    const r = await timedFetch(url, { headers: { 'User-Agent': 'AthenIntel/1.0' } }, 8000);
    if (!r.ok) return [];
    return parseRSS(await r.text());
  } catch (_) { return []; }
}

function parseRSS(xml) {
  const out  = [];
  const re   = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null && out.length < 20) {
    const chunk = m[1];
    const title   = (/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/.exec(chunk) || [])[1] || '';
    const link    = (/<link>(.*?)<\/link>/.exec(chunk) || [])[1] || '';
    const pubDate = (/<pubDate>(.*?)<\/pubDate>/.exec(chunk) || [])[1] || '';
    const srcEl   = (/<source[^>]*url="([^"]*)"[^>]*>(.*?)<\/source>/.exec(chunk) || []);
    const srcUrl  = srcEl[1] || '';
    const srcName = srcEl[2] || '';

    const cleanTitle = title.includes(' - ')
      ? title.split(' - ').slice(0, -1).join(' - ')
      : title;

    if (cleanTitle && link) {
      const domain = srcUrl ? new URL(srcUrl).hostname.replace(/^www\./, '') : '';
      out.push({
        title: cleanTitle.trim(),
        url:   link.trim(),
        date:  pubDate ? (() => { try { return new Date(pubDate).toISOString().slice(0,10); } catch(_) { return null; } })() : null,
        sourceName: srcName.trim() || domain,
        domain,
      });
    }
  }
  return out;
}

async function fetchWikipedia(query) {
  try {
    const r = await timedFetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5&srprop=snippet`,
      {}, 6000
    );
    const d = await r.json();
    return (d?.query?.search || []).map(w => ({
      title:   w.title,
      snippet: w.snippet.replace(/<[^>]+>/g, ''),
      url:     `https://en.wikipedia.org/wiki/${encodeURIComponent(w.title.replace(/ /g, '_'))}`,
      domain:  'wikipedia.org',
      source:  'Wikipedia',
    }));
  } catch(_) { return []; }
}

async function fetchWikidata(query) {
  try {
    const r = await timedFetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&origin=*&limit=3`,
      {}, 5000
    );
    const d = await r.json();
    return (d?.search || []).filter(e => e.description).map(e => ({
      title:   e.label,
      snippet: e.description,
      url:     `https://www.wikidata.org/wiki/${e.id}`,
      domain:  'wikidata.org',
      source:  'Wikidata',
    }));
  } catch(_) { return []; }
}

function buildContext(news, wiki, wikidata) {
  let ctx = '';

  if (news.length) {
    ctx += '=== NEWS ARTICLES (live, from Google News RSS) ===\n';
    news.forEach((a, i) => {
      ctx += `[N${i+1}] "${a.title}"\n  Source: ${a.sourceName || a.domain}\n  URL: ${a.url}\n  Date: ${a.date || 'unknown'}\n\n`;
    });
  }

  if (wiki.length) {
    ctx += '=== WIKIPEDIA REFERENCE ===\n';
    wiki.forEach((w, i) => {
      ctx += `[W${i+1}] "${w.title}"\n  ${w.snippet}\n  URL: ${w.url}\n\n`;
    });
  }

  if (wikidata.length) {
    ctx += '=== WIKIDATA ENTITIES ===\n';
    wikidata.forEach((e, i) => {
      ctx += `[D${i+1}] "${e.title}": ${e.snippet}\n  URL: ${e.url}\n\n`;
    });
  }

  return ctx.trim() || 'No external sources could be retrieved. Base analysis on your knowledge and the geographic security context.';
}

// ─── Claude analysis ──────────────────────────────────────────────────────────

async function analyzeWithClaude(query, context, apiKey) {
  const userMsg = `Query: "${query}"

GATHERED INTELLIGENCE:
${context}

Produce the complete intelligence brief as a single JSON object. All fields including analytical_perspective and recommendations (all three user types) are mandatory.`;

  const r = await timedFetch(
    ANTHROPIC_API,
    {
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
        messages:   [{ role: 'user', content: userMsg }],
      }),
    },
    45000
  );

  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Anthropic API ${r.status}: ${body.slice(0, 200)}`);
  }

  const data = await r.json();
  const text = data.content?.[0]?.text || '';

  // Strip potential markdown fences
  const cleaned = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Try to extract JSON object from the response
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Claude returned malformed JSON');
  }
}

// ─── CORS helper ─────────────────────────────────────────────────────────────

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age':       '86400',
};

function jsonRes(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ─── Worker entry point ───────────────────────────────────────────────────────

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== 'POST') {
      return jsonRes({ error: 'Only POST requests are supported' }, 405);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return jsonRes({ error: 'ANTHROPIC_API_KEY secret is not set on this Worker' }, 500);
    }

    let query, lang;
    try {
      ({ query = '', lang = 'en' } = await request.json());
      query = query.trim();
    } catch (_) {
      return jsonRes({ error: 'Invalid request body — expected JSON with "query" field' }, 400);
    }

    if (!query || query.length < 2) {
      return jsonRes({ error: 'Query must be at least 2 characters' }, 400);
    }

    try {
      const [news, wiki, wikidata] = await Promise.all([
        fetchGoogleNews(query),
        fetchWikipedia(query),
        fetchWikidata(query),
      ]);

      const context  = buildContext(news, wiki, wikidata);
      const analysis = await analyzeWithClaude(query, context, env.ANTHROPIC_API_KEY);

      return jsonRes(analysis);
    } catch (err) {
      console.error('Athena Intel Worker error:', err);
      return jsonRes({ error: err.message || 'Analysis failed — please try again' }, 500);
    }
  },
};
