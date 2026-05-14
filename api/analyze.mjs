// Node.js serverless function — maxDuration 60s set in vercel.json
// Mode-routed analyzer: produces three distinct report shapes
// based on the user's selected analysis mode.

const MODEL        = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 2200;
const MAX_FINDINGS = 6;
const MAX_SNIPPET  = 160;
const ABORT_MS     = 55000;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MODES = new Set(['security', 'business', 'traveler']);

// ── Region → local language map (used in every mode) ────────────────────────
const REGION_LANGS = `Thailand→Thai, Cambodia→Khmer, Myanmar→Burmese, Laos→Lao, Vietnam→Vietnamese, China→Chinese, Malaysia→Malay, Indonesia→Indonesian, Philippines→Filipino, Japan→Japanese, Korea→Korean, Russia→Russian, Ukraine→Ukrainian, France→French, Germany→German, Spain→Spanish, Mexico→Spanish, Brazil→Portuguese, Turkey→Turkish, Iran→Persian, Afghanistan→Pashto/Dari, India→Hindi, Pakistan→Urdu, Saudi Arabia→Arabic, Egypt→Arabic, Syria→Arabic, Iraq→Arabic, Israel→Hebrew, Ethiopia→Amharic, Somalia→Somali, Haiti→Haitian Creole`;

// ── Master system prompt (cached) ───────────────────────────────────────────
const STATIC_SYSTEM = `You are Athena, an Open Source Intelligence (OSINT) analysis platform. Your task is to generate a role-specific intelligence product based on the user's selected analysis mode. The selected mode controls search intent, source priority, analytical lens, report structure, risk label, tone, recommendation style, and final decision guidance.

If mode = Security / Intelligence:
Generate an Intelligence Report. Focus on threat actors, incident patterns, modus operandi, indicators, threat assessment, intelligence gaps, recommended collection, and operational awareness.

If mode = Business / Risk:
Generate a Business Risk Brief. Focus on operational impact, employee and customer exposure, reputation risk, financial exposure, business continuity, executive decision-making, monitoring triggers, and management recommendations.

If mode = Traveler / Public Safety:
Generate a Travel Safety Advisory. Focus on simple safety assessment, areas to avoid, practical do/don't advice, movement guidance, emergency awareness, and go/caution/avoid/no-go recommendation.

Rules for all modes:
- Detect the region and search in English AND the local language for that region.
- Region→Language reference: ${REGION_LANGS}.
- Clearly separate confirmed facts, reported claims, and analytical assessment.
- Always identify information gaps explicitly.
- Never present unverified claims as confirmed facts.
- Avoid unnecessary abbreviations. Define any abbreviation on first use (e.g. "Open Source Intelligence (OSINT)").
- Adapt tone, structure, risk label, and recommendations to the mode.
- Do not fabricate sources, URLs, names, dates, or statistics.
- If information is unavailable, state it clearly in the report or in information gaps.

TRADECRAFT — CALIBRATED PROBABILITY LANGUAGE (Sherman Kent scale):
- "almost certain" 95-99% | "highly likely" 80-95% | "likely" 55-80% | "roughly even chance" 45-55% | "unlikely" 20-45% | "highly unlikely" 5-20% | "almost no chance" 1-5".
Pair the word with a one-line rationale when stakes are material.

SOURCE RELIABILITY GRADING:
- HIGH: official government, primary source, multiple independent corroborating reports.
- MEDIUM: established mainstream or regional outlet, single attribution; NGO with track record.
- LOW: anonymous, single uncorroborated source, partisan outlet, social-media-only claim.
- UNVERIFIED: claim has not been confirmed by any credible outlet.

OUTPUT FORMAT:
Return ONE valid JSON object. No markdown fences. No commentary outside the JSON. ALWAYS close every bracket and brace. The output must parse on the first attempt.`;

// ── Mode-specific user prompts ──────────────────────────────────────────────
function findingsBlock(findings) {
  if (!findings || !findings.length) {
    return '\nNo web search findings were available. Draw on your training knowledge of well-known entities, public events, and established sources. Mark any fact not in findings with appropriate confidence labeling.\n';
  }
  return `\nWEB SEARCH FINDINGS (primary basis for sources, timeline, and key facts — cite URLs verbatim):\n${JSON.stringify(findings, null, 0)}\n`;
}

function brevityLine() {
  return `BREVITY: every text field 1-3 short sentences max; arrays capped to 5 items each. Output must fit within token budget — write critical fields first.`;
}

function securityPrompt(query, findings) {
  return `Query: "${query}"
Active mode: Security / Intelligence.
Source priority: threat actors, suspects, criminal groups, official statements, police reports, local-language reporting, incident history, escalation indicators, modus operandi, security patterns, social-media signals.
${findingsBlock(findings)}
${brevityLine()}

Return EXACTLY this JSON schema (top-to-bottom field order). Use null for unknown:

{
  "reportType": "intelligence",
  "mode": "security",
  "query": "${query}",
  "reportTitle": "Intelligence Report",
  "intelligenceSummary": "3-4 sentence intelligence-style summary using calibrated probability.",
  "keyJudgments": ["3-5 short analytical judgments, each anchored to evidence"],
  "incidentOverview": "What happened or what is observed — facts only, source-attributed.",
  "timeline": [{ "date": "YYYY-MM-DD", "event": "...", "source_url": "...", "confidence": "high|medium|low" }],
  "locationContext": "Geography, terrain, jurisdiction, surrounding area dynamics.",
  "actors": [{ "name": "...", "type": "individual|group|state|unknown", "role": "subject|suspect|witness|authority|victim", "status": "CONFIRMED|UNCONFIRMED|UNDER INVESTIGATION" }],
  "modusOperandi": "Methods, tactics, weapons, patterns — if pattern of life or repeat behavior.",
  "indicatorsAndPatterns": ["3-5 short indicators or escalation patterns"],
  "threatAssessment": "Lead analytical judgment with calibrated probability; name 1-2 alternative hypotheses if evidence is contested.",
  "threatLevel": "Low|Moderate|Medium|High|Critical",
  "intelligenceGaps": ["specific unknowns that would change the assessment"],
  "recommendedCollection": "Targeted collection priorities: what to seek, where, in what language.",
  "recommendedAction": "Operational awareness, monitoring, verification, or escalation steps.",
  "confidenceLevel": "HIGH|MEDIUM|LOW",
  "confidenceJustification": "One sentence naming the dominant evidence basis and any load-bearing assumption.",
  "sourceAssessment": [{ "title": "...", "url": "...", "domain": "...", "date": "YYYY-MM-DD|null", "type": "official|established media|local media|social media|ngo|corporate|travel advisory|unverified", "language": "EN|local code", "reliability": "HIGH|MEDIUM|LOW|UNVERIFIED", "note": "one-line relevance" }]
}`;
}

function businessPrompt(query, findings) {
  return `Query: "${query}"
Active mode: Business / Risk.
Source priority: business impact, operational disruption, transport, road closures, business districts, staff movement, customer exposure, supply chain, market impact, reputation risk, continuity concern, executive decision impact.
${findingsBlock(findings)}
${brevityLine()}

Return EXACTLY this JSON schema (top-to-bottom field order). Use null for unknown:

{
  "reportType": "business",
  "mode": "business",
  "query": "${query}",
  "reportTitle": "Business Risk Brief",
  "executiveSummary": "3-4 sentence executive summary aimed at a decision-maker.",
  "keyBusinessJudgments": ["3-5 short decision-oriented judgments"],
  "situationOverview": "What is happening, where, when, and how it intersects with business operations.",
  "businessImpact": "Direct impact on operations, revenue, or service delivery (1-3 sentences).",
  "operationalRisk": "Logistics, transport, staff movement, premises access, IT/cyber, vendor exposure.",
  "employeeCustomerExposure": "Specific exposure for staff and customers — locations, timing, demographics.",
  "reputationRisk": "Brand, PR, regulatory, or stakeholder reputation considerations.",
  "financialMarketExposure": "Currency, market, insurance, contract, or financing exposure if relevant; null if none.",
  "businessContinuity": "Continuity concern — what could disrupt critical functions, for how long, recoverability.",
  "businessRiskLevel": "Low|Moderate|Medium|High|Severe",
  "recommendedBusinessAction": "Concrete management actions — staffing, sites, communications, controls.",
  "decisionGuidance": "Go / hold / scale-back / pause guidance for the next 24-72 hours and beyond.",
  "monitoringTriggers": ["specific events or thresholds that should trigger reassessment"],
  "confidenceLevel": "HIGH|MEDIUM|LOW",
  "confidenceJustification": "One sentence naming the dominant evidence basis and any load-bearing assumption.",
  "sourceAssessment": [{ "title": "...", "url": "...", "domain": "...", "date": "YYYY-MM-DD|null", "type": "official|established media|local media|social media|ngo|corporate|travel advisory|unverified", "language": "EN|local code", "reliability": "HIGH|MEDIUM|LOW|UNVERIFIED", "note": "one-line relevance" }]
}`;
}

function travelerPrompt(query, findings) {
  return `Query: "${query}"
Active mode: Traveler / Public Safety.
Source priority: public safety, travel advisories, areas to avoid, transport status, local warnings, police instructions, tourist exposure, safe routes, timing advice, practical safety guidance.
${findingsBlock(findings)}
${brevityLine()}
TONE: simple, calm, practical, public-facing. Plain language. No intelligence jargon. No abbreviations.

Return EXACTLY this JSON schema (top-to-bottom field order). Use null for unknown:

{
  "reportType": "traveler",
  "mode": "traveler",
  "query": "${query}",
  "reportTitle": "Travel Safety Advisory",
  "safetySummary": "3-4 plain sentences any traveler can understand. What is happening and what it means for personal safety.",
  "isItSafe": "Direct answer in 1-2 sentences. Use plain language.",
  "travelAdviceLevel": "Safe|Use Caution|Avoid Area|No-Go",
  "areasToAvoid": ["specific districts, streets, or landmarks to avoid"],
  "mainSafetyConcerns": ["3-5 short safety concerns in plain language"],
  "whatYouShouldDo": ["3-5 concrete do-actions"],
  "whatYouShouldAvoid": ["3-5 concrete avoid-actions"],
  "movementAdvice": "How to move around: transport, timing, daylight vs night, route choices.",
  "emergencyAwareness": "Local emergency numbers if known, nearest hospitals, embassy contact guidance.",
  "finalRecommendation": "Single clear bottom-line: Go / Caution / Avoid / No-Go and why.",
  "confidenceLevel": "HIGH|MEDIUM|LOW",
  "confidenceJustification": "One sentence naming the dominant evidence basis.",
  "sourceAssessment": [{ "title": "...", "url": "...", "domain": "...", "date": "YYYY-MM-DD|null", "type": "official|established media|local media|social media|ngo|corporate|travel advisory|unverified", "language": "EN|local code", "reliability": "HIGH|MEDIUM|LOW|UNVERIFIED", "note": "one-line relevance" }]
}`;
}

function buildPromptForMode(mode, query, findings) {
  switch (mode) {
    case 'security': return securityPrompt(query, findings);
    case 'business': return businessPrompt(query, findings);
    case 'traveler': return travelerPrompt(query, findings);
    default:         return securityPrompt(query, findings);
  }
}

// ── JSON repair (bracket-balanced) ──────────────────────────────────────────
function extractJson(text) {
  const start = text.indexOf('{');
  if (start < 0) throw new Error('No JSON object found in response');
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
  return JSON.parse(prefix);
}

// ── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Only POST requests are supported' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY environment variable is not set' });

  let query, findings, mode;
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    query = (body.query || '').trim();
    mode  = String(body.mode || '').toLowerCase();
    if (!MODES.has(mode)) return res.status(400).json({ error: 'mode must be one of: security, business, traveler' });
    const raw = Array.isArray(body.findings) ? body.findings.slice(0, MAX_FINDINGS) : [];
    findings = raw.map(f => ({
      title:    typeof f?.title    === 'string' ? f.title.slice(0, 130)   : '',
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
    const userPrompt = buildPromptForMode(mode, query, findings);

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
          { type: 'text', text: STATIC_SYSTEM, cache_control: { type: 'ephemeral' } },
        ],
        messages: [
          { role: 'user', content: userPrompt },
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
