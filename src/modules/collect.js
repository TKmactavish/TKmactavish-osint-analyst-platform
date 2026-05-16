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

CRITICAL: Only return companies that appear in the web search results below. Do NOT invent tickers. If results contain no qualifying small-cap companies, return scanSummary explaining this — do not fabricate candidates.

Find up to 3 U.S.-listed stocks (NYSE or NASDAQ only, not OTC) where the search results reveal a hidden signal not yet priced in by the majority of the market.

SIGNAL TYPES — any of these qualifies:
1. HIDDEN PARTNERSHIP: Confirmed deal with a major AI/Space/Defense/Cloud player in a filing or press release — not yet covered by Bloomberg/CNBC/WSJ
2. CRITICAL SUPPLY CHAIN POSITION: Company makes a key material, substrate, or component that is essential for a hot technology — market doesn't know yet. Example: AXTI (AXT Inc.) makes compound semiconductor substrates (InP, GaAs) that are critical for AI photonics and 5G — nobody knew until the narrative hit. SNDK was the Sandisk spin-off from Western Digital — corporate restructuring that was underpriced before the market understood the value.
3. CORPORATE EVENT: Spin-off, merger, or restructuring that creates a new narrative the market hasn't fully priced yet

Target profile:
- Under $500M market cap strongly preferred, hard max $2B
- Fewer than 5 sell-side analysts — gaps only survive with thin coverage
- Signal confirmed in a named public source (8-K, press release, SEC filing, company website)
- Awareness: Unnoticed or Emerging only — Widely Known means already priced in

Rank by: clarity of signal + thinness of coverage + how close the crowd is to discovering it.`;
}

export async function collectAnalysis(query, mode, onStage) {
  if (!mode) throw new Error('Analysis mode is required');

  // ── RADAR FLOW ──────────────────────────────────────────────────────────────
  if (query.startsWith('RADAR:') && mode === 'investment') {
    const sectors = parseRadarSectors(query);
    const searchTerms = buildRadarSearchTerms(sectors);

    // Run searches sequentially to avoid rate limit (not parallel)
    onStage?.('search');
    const seen = new Set();
    const findings = [];
    for (const term of searchTerms) {
      try {
        const res = await postJson('/api/search', { query: term, mode });
        const raw = Array.isArray(res.findings) ? res.findings : [];
        for (const f of raw) {
          const key = f.url || f.title;
          if (!key || seen.has(key)) continue;
          seen.add(key);
          findings.push(f);
        }
      } catch { /* one search failing doesn't kill the whole scan */ }
    }

    // Analyze grounded in real search results
    onStage?.('analyze');
    const analysisQuery = buildRadarAnalysisQuery(sectors);
    const analysis = await postJson('/api/analyze', { query: analysisQuery, mode, findings });
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
