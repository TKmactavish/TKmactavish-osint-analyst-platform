// Node.js serverless function — maxDuration 60s set in vercel.json
// Mode-routed analyzer: produces three distinct report shapes
// based on the user's selected analysis mode.

const MODEL        = 'claude-haiku-4-5-20251001';
const MAX_TOKENS   = 3500;
const MAX_FINDINGS = 6;
const MAX_SNIPPET  = 160;
const ABORT_MS     = 55000;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MODES = new Set(['security', 'investment', 'traveler']);

// ── Region → local language map (used in every mode) ────────────────────────
const REGION_LANGS = `Thailand→Thai, Cambodia→Khmer, Myanmar→Burmese, Laos→Lao, Vietnam→Vietnamese, China→Chinese, Malaysia→Malay, Indonesia→Indonesian, Philippines→Filipino, Japan→Japanese, Korea→Korean, Russia→Russian, Ukraine→Ukrainian, France→French, Germany→German, Spain→Spanish, Mexico→Spanish, Brazil→Portuguese, Turkey→Turkish, Iran→Persian, Afghanistan→Pashto/Dari, India→Hindi, Pakistan→Urdu, Saudi Arabia→Arabic, Egypt→Arabic, Syria→Arabic, Iraq→Arabic, Israel→Hebrew, Ethiopia→Amharic, Somalia→Somali, Haiti→Haitian Creole`;

// ── Master system prompt (cached) ───────────────────────────────────────────
const STATIC_SYSTEM = `You are Athena, an Open Source Intelligence (OSINT) analysis platform. Your task is to generate a role-specific intelligence product based on the user's selected analysis mode. The selected mode controls search intent, source priority, analytical lens, report structure, risk label, tone, recommendation style, and final decision guidance.

If mode = Security / Intelligence:
Generate an Intelligence Report. Focus on threat actors, incident patterns, modus operandi, indicators, threat assessment, intelligence gaps, recommended collection, and operational awareness.

If mode = Investment Intelligence:
Generate an Investment Intelligence Report. Focus on early public catalyst detection, SEC filing analysis, insider Form 4 activity, government contract awards, regulatory decisions, market awareness gap, red flag detection (dilution, reverse splits, paid promotion), and a clear actionable verdict.

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

RADAR SCANS — GROUNDING RULE:
When the query is a RADAR SCAN COMMAND, your training data is months old — any signal you know from training is already public and priced in. You MUST work only from the web search findings provided. If a company is not in the findings, do not include it. If findings contain no qualifying small-cap companies with a current hidden signal, set candidates to empty array and explain honestly in scanSummary. Returning old-knowledge stocks (AXTI, DGXX, RDW, OSS, or any company the user has seen before) when they are not in the current findings is a critical error.

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

Return EXACTLY this JSON schema (top-to-bottom field order). ALL text fields FIRST, ALL arrays LAST. Use empty string "" for unknown text, empty array [] for unknown arrays:

{
  "reportType": "intelligence",
  "mode": "security",
  "query": "${query}",
  "reportTitle": "Intelligence Report",
  "threatLevel": "Low|Moderate|Medium|High|Critical",
  "confidenceLevel": "HIGH|MEDIUM|LOW",
  "intelligenceSummary": "3-4 sentence summary using calibrated probability.",
  "threatAssessment": "Lead judgment with calibrated probability; 1-2 alternative hypotheses if contested.",
  "recommendedAction": "WRITE THIS — 1-2 sentences on what the reader should do or monitor right now. Never empty.",
  "recommendedCollection": "WRITE THIS — What to monitor, search, or verify next. Never empty.",
  "confidenceJustification": "One sentence naming the dominant evidence basis.",
  "incidentOverview": "What happened — facts only, source-attributed.",
  "locationContext": "Geography, jurisdiction, surrounding area dynamics.",
  "modusOperandi": ["method or tactic 1", "method or tactic 2"],
  "keyJudgments": ["3-5 short judgments anchored to evidence"],
  "intelligenceGaps": ["specific unknowns that would change the assessment"],
  "indicatorsAndPatterns": ["3-5 short indicators or escalation patterns"],
  "actors": [{ "name": "...", "type": "individual|group|state|unknown", "role": "subject|suspect|witness|authority|victim", "status": "CONFIRMED|UNCONFIRMED|UNDER INVESTIGATION" }],
  "timeline": [{ "date": "YYYY-MM-DD", "event": "...", "source_url": "...", "confidence": "high|medium|low" }],
  "sourceAssessment": [{ "title": "...", "url": "...", "domain": "...", "date": "YYYY-MM-DD|null", "type": "official|established media|local media|social media|ngo|corporate|travel advisory|unverified", "language": "EN|local code", "reliability": "HIGH|MEDIUM|LOW|UNVERIFIED", "note": "one-line relevance" }]
}`;
}

function investmentPrompt(query, findings) {
  return `Query: "${query}"
Active mode: Investment Intelligence.

QUERY TYPE DETECTION — classify before writing:
- TYPE A (Single Ticker): query contains a stock ticker symbol (e.g. $ASTS, PLTR, RKLB) or asks about one specific company → use TICKER ANALYSIS schema
- TYPE B (Radar Scan): query asks for stock candidates, upcoming opportunities, stocks to watch, rerating setups, "radar", "what stocks", "which stocks", "next week", "scan" → use RADAR SCAN schema

Source priority: SEC EDGAR 8-K filings, Form 4 insider open-market purchases, USASpending.gov government contract awards, FDA.gov PDUFA calendar, ClinicalTrials.gov, SAM.gov solicitations, company press releases, financial media coverage gaps, FINRA short interest data.
${findingsBlock(findings)}
BREVITY: 1-2 sentences per text field. Arrays capped at 5 items. Radar candidates capped at 4. Write critical fields first.

RED FLAG SIGNALS (check for all queries):
- Equity offerings, ATM programs, warrant exercises, shelf registrations
- Reverse split history (strong negative for small caps)
- Insider selling (Form 4) vs insider buying — distinguish clearly
- No revenue + high cash burn rate
- Paid promotion PR patterns

MARKET AWARENESS: label as Unnoticed / Emerging / Widely Known based on mainstream financial media and analyst coverage.

━━━ TYPE A — TICKER ANALYSIS SCHEMA ━━━
Return this exact JSON when query is about a specific ticker or company:

{
  "reportType": "investment",
  "mode": "investment",
  "query": "${query}",
  "reportTitle": "Investment Intelligence Report",
  "catalystRating": "Strong|Moderate|Weak|Red Flag",
  "confidenceLevel": "HIGH|MEDIUM|LOW",
  "catalystSummary": "WRITE THIS — name the specific catalyst, filing, or development explicitly with date. Never generic.",
  "whyItMatters": "WRITE THIS — specific revenue impact, narrative shift, or institutional attention trigger.",
  "marketAwarenessGap": "WRITE THIS — Unnoticed/Emerging/Widely Known + what mainstream outlets have or have not covered.",
  "insiderActivity": "Form 4 open-market purchases last 90 days — name, role, shares, date, value. State if none found.",
  "governmentContracts": "USASpending.gov awards last 90 days — agency, value, date. State if none found.",
  "financialHealth": "Cash position, burn rate, dilution history, debt. Flag concerns.",
  "recommendedAction": "WRITE THIS — Watch | Research Further | High Conviction | Avoid + one specific rationale sentence.",
  "timeWindow": "Days, weeks, months, or specific upcoming event date.",
  "confidenceJustification": "One sentence naming the dominant evidence basis.",
  "keyFindings": ["3-5 findings — each must name a source, date, or specific data point"],
  "redFlags": ["specific red flags detected. Empty array if none."],
  "riskFactors": ["3-5 investment risks"],
  "sourceAssessment": [{ "title": "...", "url": "...", "domain": "...", "date": "YYYY-MM-DD|null", "type": "official|established media|sec-filing|government-contract|corporate|unverified", "language": "EN", "reliability": "HIGH|MEDIUM|LOW|UNVERIFIED", "note": "one-line relevance" }]
}

━━━ TYPE B — RADAR SCAN SCHEMA ━━━
Return this exact JSON when query is a RADAR SCAN COMMAND or asks for candidates, upcoming rerates, or a market scan.

RADAR HARD RULES — enforce before writing a single candidate:
1. AWARENESS IS THE ONLY SIZE FILTER: Any market cap is valid — micro, small, mid, large. The filter is whether the news/catalyst is already priced in. NEVER return candidates where market awareness is "Widely Known" — that means the crowd already knows and it's already priced in. Only "Unnoticed" or "Emerging" stocks have edge.
2. SPECIFIC CATALYST REQUIRED: Every candidate must have a real, identifiable upcoming event or developing news story. "May announce something" or "routine operations" is not valid.
3. INFORMATION EDGE: For each candidate, explain precisely why the majority of the market does NOT know about this yet — what makes this information gap real.
4. QUALITY OVER QUANTITY: Return 3 strong candidates with clear information edge rather than 5 padded ones. Rank by conviction — clearest information gap + strongest catalyst first.
5. THE STRATEGY: Users buy when awareness is "Unnoticed"/"Emerging", hold 3-7 days as news spreads and FOMO builds, sell when it reaches "Widely Known" peak.

{
  "reportType": "radar",
  "mode": "investment",
  "query": "${query}",
  "reportTitle": "Hidden News Radar",
  "scanSummary": "2-3 sentences: what was scanned, what information gaps were found, and why these candidates have edge over the crowd right now.",
  "candidates": [
    {
      "ticker": "XXXX",
      "company": "Full Company Name",
      "sector": "Biotech|Defense|AI|Energy|Semiconductor|Other",
      "catalystType": "Partnership Play|Tech Narrative|Short Squeeze Setup|FDA PDUFA|Government Contract|Clinical Trial Readout|Earnings Catalyst|Insider Buying Cluster|Regulatory Decision|Partnership Announcement",
      "catalystSummary": "Specific upcoming catalyst — what it is, source, known date if available.",
      "catalystDate": "YYYY-MM-DD or approximate (e.g. 'Expected Q2 2025') or 'Unknown'",
      "whyItMightRerate": "Why this specific event could move the stock price. Be specific.",
      "marketAwareness": "Unnoticed|Emerging|Widely Known",
      "shortInterestNote": "Short interest % and squeeze potential, or 'Not elevated' if low",
      "insiderActivityNote": "Recent Form 4 open-market buys or 'None found'",
      "redFlags": "Key risk or concern. Empty string if none.",
      "confidence": "High|Moderate|Low",
      "timeWindow": "This week|1-2 weeks|2-4 weeks|1 month+"
    }
  ],
  "watchList": ["TICKER — one-line reason to monitor"],
  "avoidList": ["TICKER — specific reason to avoid"],
  "confidenceJustification": "One sentence on evidence basis for this radar scan.",
  "sourceAssessment": [{ "title": "...", "url": "...", "domain": "...", "date": "YYYY-MM-DD|null", "type": "official|established media|sec-filing|government-contract|corporate|unverified", "language": "EN", "reliability": "HIGH|MEDIUM|LOW|UNVERIFIED", "note": "one-line relevance" }]
}`;
}

function travelerPrompt(query, findings) {
  return `Query: "${query}"
Active mode: Traveler / Public Safety.
Source priority: public safety, travel advisories, areas to avoid, transport status, local warnings, police instructions, tourist exposure, safe routes, timing advice, practical safety guidance.
${findingsBlock(findings)}
${brevityLine()}
TONE: simple, calm, practical, public-facing. Plain language. No intelligence jargon. No abbreviations.

Return EXACTLY this JSON schema (top-to-bottom field order). ALL text fields FIRST, ALL arrays LAST. Use empty string "" for unknown text, empty array [] for unknown arrays:

{
  "reportType": "traveler",
  "mode": "traveler",
  "query": "${query}",
  "reportTitle": "Travel Safety Advisory",
  "travelAdviceLevel": "Safe|Use Caution|Avoid Area|No-Go",
  "confidenceLevel": "HIGH|MEDIUM|LOW",
  "isItSafe": "Direct answer in 1-2 sentences. Plain language.",
  "finalRecommendation": "Single clear bottom-line: Go / Caution / Avoid / No-Go and why.",
  "safetySummary": "3-4 plain sentences. What is happening and what it means for personal safety.",
  "movementAdvice": "Transport, timing, daylight vs night, route choices.",
  "emergencyAwareness": "Emergency numbers, nearest hospitals, embassy contact.",
  "confidenceJustification": "One sentence naming the dominant evidence basis.",
  "areasToAvoid": ["specific districts, streets, or landmarks to avoid"],
  "mainSafetyConcerns": ["3-5 short safety concerns in plain language"],
  "whatYouShouldDo": ["3-5 concrete do-actions"],
  "whatYouShouldAvoid": ["3-5 concrete avoid-actions"],
  "sourceAssessment": [{ "title": "...", "url": "...", "domain": "...", "date": "YYYY-MM-DD|null", "type": "official|established media|local media|social media|ngo|corporate|travel advisory|unverified", "language": "EN|local code", "reliability": "HIGH|MEDIUM|LOW|UNVERIFIED", "note": "one-line relevance" }]
}`;
}

function buildPromptForMode(mode, query, findings) {
  switch (mode) {
    case 'security':   return securityPrompt(query, findings);
    case 'investment': return investmentPrompt(query, findings);
    case 'traveler':   return travelerPrompt(query, findings);
    default:           return securityPrompt(query, findings);
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
  if (query.length > 5000)         return res.status(400).json({ error: 'Query too long (max 5000 characters)' });

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

    // Guarantee critical fields are never null — model sometimes skips them
    if (mode === 'security') {
      if (!result.recommendedAction)
        result.recommendedAction = 'Monitor the situation closely. Follow official guidance from local authorities and verify through credible open sources before taking action.';
      if (!result.recommendedCollection)
        result.recommendedCollection = 'Continue monitoring local media, official police/government statements, and regional news sources for further developments and official confirmation.';
      if (!result.modusOperandi || (Array.isArray(result.modusOperandi) && !result.modusOperandi.length))
        result.modusOperandi = ['Insufficient information available to characterize methods at this time.'];
    }
    if (mode === 'investment') {
      if (result.reportType === 'radar') {
        if (!Array.isArray(result.candidates) || !result.candidates.length)
          result.candidates = [{ ticker: 'N/A', company: 'No candidates identified', sector: '', catalystType: '', catalystSummary: 'No confirmed hidden signals found for this scan. The information gap may not exist yet — try a different sector focus or run again.', catalystDate: '', whyItMightRerate: '', marketAwareness: 'Unknown', shortInterestNote: '', insiderActivityNote: '', redFlags: '', confidence: 'Low', timeWindow: 'Unknown' }];
        if (!result.scanSummary)
          result.scanSummary = 'Hidden news scan completed. All candidates have confirmed public signals not yet amplified by mainstream financial media. Verify each signal source independently before entering a position.';
      } else {
        if (!result.catalystSummary)
          result.catalystSummary = 'No specific catalyst identified from available open-source data. Verify through SEC EDGAR directly.';
        if (!result.recommendedAction)
          result.recommendedAction = 'Watch — insufficient data for high-conviction assessment. Monitor for new 8-K filings and Form 4 insider activity.';
        if (!result.marketAwarenessGap)
          result.marketAwarenessGap = 'Market awareness could not be estimated. Check recent price and volume action against catalyst dates independently.';
      }
    }

    return res.status(200).json(result);

  } catch (err) {
    const msg = err?.message || 'Analysis failed';
    const status = msg.includes('timed out') || msg.includes('timeout') ? 504 : 500;
    return res.status(status).json({ error: msg });
  }
}
