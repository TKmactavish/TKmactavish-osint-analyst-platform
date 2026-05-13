// Node.js serverless function — maxDuration 60s set in vercel.json
// (was edge runtime, 25s hard limit → caused intermittent 504s on complex queries)

const MODEL        = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 2000;
const MAX_FINDINGS = 5;
const MAX_SNIPPET  = 150;
const ABORT_MS     = 55000;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Language detection ──────────────────────────────────────────────────────
const LANG_HINTS = [
  { re: /[฀-๿]/, code: 'TH', name: 'Thai' },
  { re: /[؀-ۿ]/, code: 'AR', name: 'Arabic' },
  { re: /[一-鿿]/, code: 'ZH', name: 'Chinese' },
  { re: /[぀-ゟ゠-ヿ]/, code: 'JA', name: 'Japanese' },
  { re: /[가-힯]/, code: 'KO', name: 'Korean' },
  { re: /[Ѐ-ӿ]/, code: 'RU', name: 'Russian' },
  { re: /[ऀ-ॿ]/, code: 'HI', name: 'Hindi' },
];

const KEYWORD_LANGS = [
  { words: ['thailand','thai','bangkok','pattani','yala','narathiwat','songkhla','chiang mai'], code: 'TH', name: 'Thai' },
  { words: ['japan','japanese','tokyo','osaka'], code: 'JA', name: 'Japanese' },
  { words: ['china','chinese','beijing','shanghai','hong kong','taiwan'], code: 'ZH', name: 'Chinese' },
  { words: ['korea','korean','seoul'], code: 'KO', name: 'Korean' },
  { words: ['myanmar','burma','burmese','yangon','naypyidaw'], code: 'MY', name: 'Burmese' },
  { words: ['syria','iraq','yemen','gaza','palestine','egypt','libya','sudan','saudi','jordan','lebanon'], code: 'AR', name: 'Arabic' },
  { words: ['iran','iranian','tehran'], code: 'FA', name: 'Persian' },
  { words: ['afghanistan','afghan','kabul','taliban'], code: 'PS', name: 'Pashto' },
  { words: ['russia','russian','moscow','kremlin','ukraine','ukrainian','kyiv','belarus'], code: 'RU', name: 'Russian' },
  { words: ['france','french','paris','mali','burkina','niger','chad','cameroon','senegal'], code: 'FR', name: 'French' },
  { words: ['germany','german','berlin'], code: 'DE', name: 'German' },
  { words: ['spain','spanish','madrid','mexico','cartel','colombia','venezuela','ecuador','peru','argentina'], code: 'ES', name: 'Spanish' },
  { words: ['brazil','brazilian','rio','sao paulo','favela'], code: 'PT', name: 'Portuguese' },
  { words: ['turkey','turkish','ankara','istanbul'], code: 'TR', name: 'Turkish' },
  { words: ['india','indian','delhi','mumbai','kashmir'], code: 'HI', name: 'Hindi' },
  { words: ['ethiopia','amhara','tigray'], code: 'AM', name: 'Amharic' },
  { words: ['somalia','somali','mogadishu'], code: 'SO', name: 'Somali' },
  { words: ['drc','congo','kinshasa'], code: 'FR', name: 'French' },
  { words: ['israel','tel aviv','jerusalem'], code: 'HE', name: 'Hebrew' },
  { words: ['haiti','haitian','port-au-prince'], code: 'HT', name: 'Haitian Creole' },
];

function detectLang(query) {
  for (const h of LANG_HINTS) {
    if (h.re.test(query)) return h;
  }
  const q = query.toLowerCase();
  for (const entry of KEYWORD_LANGS) {
    if (entry.words.some(w => q.includes(w))) return entry;
  }
  return { code: 'EN', name: 'English' };
}

// ── Static system prompt (prompt-cached) ────────────────────────────────────
const STATIC_SYSTEM = `You are a senior OSINT analyst producing formal intelligence briefs that follow US Intelligence Community analytic tradecraft standards (ICD-203).

═══════════════════════════════════════════════════════
ANALYTIC TRADECRAFT STANDARDS (apply rigorously)
═══════════════════════════════════════════════════════

1. SEPARATE EVIDENCE FROM INFERENCE
   - State what is observed (facts, source-attributed) before what is concluded (judgments).
   - Every judgment must be defensible by named evidence elsewhere in the brief.

2. USE CALIBRATED PROBABILITY LANGUAGE — never bare "may" or "could"
   - "almost certain" / "virtually certain"  (95-99%)
   - "highly likely"                          (80-95%)
   - "likely" / "probable"                    (55-80%)
   - "roughly even chance"                    (45-55%)
   - "unlikely" / "improbable"                (20-45%)
   - "highly unlikely"                        (5-20%)
   - "almost no chance"                       (1-5%)
   Pair the word with a one-line rationale when stakes are material.

3. DISTINGUISH ASSUMPTIONS FROM JUDGMENTS
   - If a conclusion rests on an unverified premise, label it: "Assumption: …".
   - Surface load-bearing assumptions in the informationGaps array.

4. CONSIDER ALTERNATIVES (mini-ACH)
   - When a lead hypothesis is contested or evidence is thin, name 1-2 alternative explanations briefly in intelligenceAssessment.
   - Note what evidence would distinguish them.

5. SOURCE RELIABILITY GRADING
   - HIGH: official government statement, direct primary source, or multiple independent corroborating reports.
   - MEDIUM: established mainstream / regional outlet with single-source attribution, or NGO with track record.
   - LOW: anonymous account, single uncorroborated source, partisan outlet, or social-media-only claim.

6. CONFIRMED vs UNCONFIRMED
   - CONFIRMED: 2+ independent credible sources OR an authoritative primary source (court doc, treaty text, official statement).
   - UNCONFIRMED: single-sourced, claimed but not verified, or contested.

7. INFORMATION GAPS DRIVE THE ASSESSMENT
   - State what is unknown that would change the assessment if known.
   - Be specific: "Casualty count not independently verified" not "more info needed".

═══════════════════════════════════════════════════════
WRITING STYLE
═══════════════════════════════════════════════════════
- Short declarative sentences. Active voice. Direct attribution ("Reuters reports …" not "It is reported …").
- No academic prose, no throat-clearing, no hedging without a calibrated probability anchor.
- No fabricated sources, URLs, names, dates, or statistics. If unknown, say so explicitly.
- Plain-language recommendations: spell out an abbreviation the first time it appears.

═══════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════
Return ONE valid JSON object. No markdown fences, no commentary outside the JSON.
ALWAYS close every bracket and brace. The output must parse on the first attempt.`;

function buildDynamicPrompt(query, lang, findings) {
  const isEnglish = lang.code === 'EN';
  const langInstruction = isEnglish
    ? 'Use English sources.'
    : `Prefer sources in BOTH English AND ${lang.name} (${lang.code}). Label each source with its language code, e.g. [EN] or [${lang.code}].`;

  const findingsSection = (findings && findings.length)
    ? `\nWEB SEARCH FINDINGS (use these as the primary basis for sources, timeline, and key facts — cite their URLs verbatim):\n${JSON.stringify(findings, null, 0)}\n`
    : '\nNo web search findings were available; draw on your training knowledge and cite well-known public sources you remember.\n';

  return `Query: "${query}"
${langInstruction}
${findingsSection}

BREVITY RULES (critical — schema is long, output must fit):
- Every text field: 1-2 short sentences MAX.
- keyFacts: max 5 entries.
- timeline: max 4 entries (most recent first).
- riskIndicators: max 4 short strings.
- informationGaps: max 3 short strings.
- sourceAssessment: max 5 entries, copy domain/url from findings verbatim.
- Each recommendation subfield: 1 sentence only.

Return this EXACT JSON schema. Field order matters — write top to bottom. All fields mandatory, use null for unavailable data. ALWAYS close all brackets:

{
  "query": "${query}",
  "type": "person|incident|location|organization|travel_risk",
  "executiveSummary": "3-4 sentence summary using calibrated language. What, where, when, significance.",
  "confidenceLevel": "HIGH|MEDIUM|LOW",
  "confidenceJustification": "One sentence naming the dominant evidence basis and any load-bearing assumption.",
  "intelligenceAssessment": "3-5 short sentences. State the lead judgment with calibrated probability. Name 1-2 alternative explanations if evidence is contested. End with the single indicator that would most change the assessment.",
  "recommendations": {
    "whatToWatch":         "Indicators to monitor (1 sentence).",
    "whatToAvoid":         "Locations, activities, or contacts to avoid and why (1 sentence).",
    "recommendedAction":   "Clear steps (1 sentence).",
    "travelSafetyAdvice":  "Safety advice if location-relevant (1 sentence).",
    "monitoringPriority":  "What to track over coming days/weeks (1 sentence).",
    "nextSteps":           "Concrete follow-up actions (1 sentence)."
  },
  "keyFacts": [{ "fact": "...", "status": "CONFIRMED|UNCONFIRMED" }],
  "riskIndicators": ["short string per indicator"],
  "impactAssessment": {
    "civilian":  "1-2 sentences.",
    "political": "1-2 sentences.",
    "economic":  "1-2 sentences.",
    "security":  "1-2 sentences."
  },
  "informationGaps": ["what is unknown"],
  "timeline": [{ "date": "YYYY-MM-DD", "event": "...", "source_title": "...", "source_url": "...", "confidence": "high|medium|low" }],
  "sourceAssessment": [{ "title": "...", "url": "...", "domain": "...", "date": "YYYY-MM-DD|null", "type": "official|mainstream|ngo|local|reference", "credibility": "HIGH|MEDIUM|LOW", "language": "${isEnglish ? 'EN' : lang.code}|EN" }]
}`;
}

// ── JSON extraction + repair ─────────────────────────────────────────────────
function extractJson(text) {
  const start = text.indexOf('{');
  if (start < 0) throw new Error('No JSON object found in response');
  let s = text.slice(start);

  try { return JSON.parse(s); } catch {}

  const m = s.match(/^\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }

  s = s.replace(/\s+$/, '');
  const stack = [];
  let depth = 0, inString = false, escape = false, lastSafe = 0;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape)      { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"')  { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') { stack.push(ch); depth++; }
    else if (ch === '}' || ch === ']') { stack.pop(); depth--; if (depth === 0) lastSafe = i + 1; }
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
  return JSON.parse(prefix);
}

// ── Handler (Node.js serverless — req/res pattern) ───────────────────────────
export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Only POST requests are supported' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is not set' });

  let query, findings;
  try {
    // Vercel auto-parses JSON bodies; fall back to manual parse if needed
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    query = (body.query || '').trim();
    const raw = Array.isArray(body.findings) ? body.findings.slice(0, MAX_FINDINGS) : [];
    findings = raw.map(f => ({
      title:    typeof f?.title    === 'string' ? f.title.slice(0, 120)   : '',
      url:      typeof f?.url      === 'string' ? f.url                   : '',
      domain:   typeof f?.domain   === 'string' ? f.domain                : '',
      date:     f?.date || null,
      snippet:  typeof f?.snippet  === 'string' ? f.snippet.slice(0, MAX_SNIPPET) : '',
      language: typeof f?.language === 'string' ? f.language.slice(0, 4)  : 'EN',
    }));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  if (!query || query.length < 2)  return res.status(400).json({ error: 'Query must be at least 2 characters' });
  if (query.length > 500)          return res.status(400).json({ error: 'Query too long (max 500 characters)' });

  try {
    const lang = detectLang(query);
    const dynamicPrompt = buildDynamicPrompt(query, lang, findings);

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        system: [
          {
            type: 'text',
            text: STATIC_SYSTEM,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          { role: 'user', content: dynamicPrompt },
        ],
      }),
      signal: AbortSignal.timeout(ABORT_MS),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      throw new Error(`Anthropic API ${apiRes.status}: ${errBody.slice(0, 300)}`);
    }

    const data = await apiRes.json();
    let text = '';
    for (const block of (data.content || [])) {
      if (block.type === 'text') text += block.text;
    }
    text = text.replace(/^```(?:json)?\s*/m, '').replace(/```\s*$/m, '').trim();

    if (!text) throw new Error('No text content in API response. Stop reason: ' + (data.stop_reason || 'unknown'));

    const result = extractJson(text);
    return res.status(200).json(result);

  } catch (err) {
    const msg = err?.message || 'Analysis failed';
    const status = msg.includes('timed out') || msg.includes('timeout') ? 504 : 500;
    return res.status(status).json({ error: msg });
  }
}
