// Two-stage collection: web search then analysis, both mode-aware.
// Radar mode runs 3 targeted searches to ground the model in real companies.

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let data;
  try { data = await res.json(); }
  catch { throw new Error(`Server returned non-JSON response (HTTP ${res.status}). The function may have timed out.`); }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

// Parse sector list from RADAR:sector1,sector2 format
function parseRadarSectors(query) {
  const payload = query.slice('RADAR:'.length).trim();
  if (!payload || payload === 'ALL') return [];
  return payload.split(',').map(s => s.trim()).filter(Boolean);
}

// 2 search angles — sequential, not parallel, to stay within rate limits
function buildRadarSearchTerms(sectors) {
  const s = sectors.length
    ? sectors.join(' ')
    : 'AI semiconductor photonics defense space biotech robotics';
  return [
    `small cap micro cap ${s} partnership supply chain announcement undiscovered 2025 NYSE NASDAQ`,
    `micro cap ${s} critical supplier substrate material component hidden gem 2025 stock`,
  ];
}

// Full structured analysis prompt — lives here, not in the UI
function buildRadarAnalysisQuery(sectors) {
  const sectorStr = sectors.length
    ? sectors.join(', ')
    : 'AI, semiconductors, photonics, defense, space, biotech, robotics';

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

Sectors in scope: ${sectorStr}

Using your training knowledge of publicly documented information, identify up to 3 U.S.-listed stocks (NYSE or NASDAQ only — not OTC, not pink sheets) that fit this profile:

WHAT TO FIND — any of these signal types:
1. HIDDEN PARTNERSHIP: Small company with a confirmed deal with a major AI/Space/Defense/Cloud player (NVIDIA, Cerebras, SpaceX, RKLB, AWS, L3Harris etc.) that was documented in public filings or press releases but not widely covered by Bloomberg/CNBC/WSJ. Like DGXX+Cerebras or RDW+SpaceX before they became well known.
2. CRITICAL SUPPLY CHAIN POSITION: Company that makes a key material, substrate, or component essential for a hot technology sector — but retail investors haven't discovered this role yet. Like AXTI (AXT Inc.) making InP/GaAs substrates critical for AI photonics and 5G, or OSS as Edge AI hardware enabler.
3. CORPORATE EVENT: Spin-off, restructuring, or merger creating a new narrative the market hasn't priced yet. Like SNDK spin-off from Western Digital that was dramatically undervalued before the market understood it.

TARGET PROFILE — all must be true:
- NYSE or NASDAQ listed (not OTC, not pink sheets)
- Market cap under $1B strongly preferred
- Fewer than 5 sell-side analysts covering it
- The signal was documented in public sources (name the source in catalystSummary)
- Awareness: Unnoticed or Emerging

QUALITY RULES:
- Only include companies you are highly confident are real, NYSE/NASDAQ listed, and had the specific signal you describe documented publicly
- If you are not confident about a ticker or its signal, do not include it
- Return 2-3 strong picks rather than 4 uncertain ones
- It is better to return 1 genuine candidate than 3 fabricated ones`;
}

export async function collectAnalysis(query, mode, onStage) {
  if (!mode) throw new Error('Analysis mode is required');

  // ── RADAR FLOW ──────────────────────────────────────────────────────────────
  // No web search for radar — web searches consume 15-25k tokens each and
  // return generic news, not specific small-cap tickers. The model's training
  // knowledge is better suited for this; anti-hallucination rules enforce quality.
  if (query.startsWith('RADAR:') && mode === 'investment') {
    const sectors = parseRadarSectors(query);
    onStage?.('analyze');
    const analysisQuery = buildRadarAnalysisQuery(sectors);
    const analysis = await postJson('/api/analyze', { query: analysisQuery, mode, findings: [] });
    return analysis;
  }

  // ── STANDARD FLOW (ticker, security, traveler) ───────────────────────────
  onStage?.('search');
  let findings = [];
  let searchWarning = null;
  try {
    const searchQuery = query.slice(0, 480); // search.mjs limit
    const searchRes = await postJson('/api/search', { query: searchQuery, mode });
    findings = Array.isArray(searchRes.findings) ? searchRes.findings : [];
    searchWarning = searchRes.warning || null;
  } catch (err) {
    searchWarning = err.message;
  }

  onStage?.('analyze');
  const analysis = await postJson('/api/analyze', { query, mode, findings });
  if (searchWarning) analysis._searchWarning = searchWarning;
  return analysis;
}
