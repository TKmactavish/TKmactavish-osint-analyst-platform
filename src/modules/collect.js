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

// 3 different search angles so we get a diverse pool of real small-cap news
function buildRadarSearchTerms(sectors) {
  const s = sectors.length
    ? sectors.join(' ')
    : 'AI EdgeAI defense space semiconductor biotech robotics';
  return [
    `small cap micro cap ${s} partnership announcement 2025 undiscovered NYSE NASDAQ`,
    `micro cap stock ${s} supply chain contract award hidden signal 2025`,
    `small company ${s} 8-K partnership NVIDIA Cerebras SpaceX AWS announcement 2025`,
  ];
}

// Full structured analysis prompt — lives here, not in the UI
function buildRadarAnalysisQuery(sectors) {
  const sectorStr = sectors.length
    ? sectors.join(', ')
    : 'AI, EdgeAI, defense, space, semiconductors, biotech, robotics';

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

Sectors in scope: ${sectorStr}

CRITICAL: Use ONLY companies that appear in the web search results below. Do NOT invent tickers or partnerships. If the search results do not contain qualifying small-cap companies with specific hidden signals, return 0-1 candidates with low confidence and explain in scanSummary.

Find up to 3 U.S.-listed stocks (NYSE or NASDAQ only, NOT OTC penny stocks) where a confirmed partnership, supply chain role, or contract appears in the search results — but the signal has NOT yet been amplified by mainstream financial media (Bloomberg, CNBC, WSJ).

Target profile:
- Market cap under $500M strongly preferred, hard max $2B
- Fewer than 5 sell-side analysts (information gaps only survive with thin coverage)
- Signal must be confirmed in a named public source (8-K filing, press release, company website, conference)
- Market awareness: Unnoticed or Emerging only

Real examples of this exact play: DGXX confirmed Cerebras partnership sat in filings for days; RDW had RKLB/SpaceX documentation before retail found it; OSS was Edge AI hardware supplier with zero coverage. All were real, all were small, all were in public sources nobody had amplified yet.

Rank by: specificity of signal + thinness of analyst coverage + imminence of retail discovery.`;
}

export async function collectAnalysis(query, mode, onStage) {
  if (!mode) throw new Error('Analysis mode is required');

  // ── RADAR FLOW ──────────────────────────────────────────────────────────────
  if (query.startsWith('RADAR:') && mode === 'investment') {
    const sectors = parseRadarSectors(query);
    const searchTerms = buildRadarSearchTerms(sectors);

    // Run 3 targeted searches in parallel
    onStage?.('search');
    const searchResults = await Promise.allSettled(
      searchTerms.map(term => postJson('/api/search', { query: term, mode }))
    );

    // Combine and deduplicate findings across all 3 searches
    const seen = new Set();
    const findings = [];
    for (const result of searchResults) {
      if (result.status !== 'fulfilled') continue;
      const raw = Array.isArray(result.value?.findings) ? result.value.findings : [];
      for (const f of raw) {
        const key = f.url || f.title;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        findings.push(f);
      }
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
