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


// Full structured analysis prompt — lives here, not in the UI
function buildRadarAnalysisQuery(sectors) {
  const sectorStr = sectors.length
    ? sectors.join(', ')
    : 'AI, semiconductors, photonics, defense, space, biotech, robotics';

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

Sectors in scope: ${sectorStr}

IMPORTANT: Your training data is months old. Do NOT use your training knowledge to pick stocks — those signals are already priced in and it is too late to act on them. Instead, work ONLY from the web search findings provided below. If the findings contain no qualifying small-cap companies with a specific hidden signal, return zero candidates and explain in scanSummary.

From the web search findings, identify U.S.-listed stocks (NYSE or NASDAQ only — not OTC) where a real current signal exists that most retail investors have not yet discovered:

1. HIDDEN PARTNERSHIP: Small company just announced a deal with a major AI/Space/Defense player — confirmed in the search findings but not yet on Bloomberg/CNBC
2. SUPPLY CHAIN POSITION: Company supplies a critical material or component for a hot sector — role confirmed in findings but under-covered by financial media
3. CORPORATE EVENT: Spin-off, restructuring, or rerating event confirmed in findings

Target: under $1B market cap, fewer than 5 analysts, signal traceable to a named source in the findings.

If the search findings do not contain specific small-cap companies with a clear current signal — say so in scanSummary and return no candidates. Do not fill the gap with old knowledge.`;
}

export async function collectAnalysis(query, mode, onStage) {
  if (!mode) throw new Error('Analysis mode is required');

  // ── RADAR FLOW ──────────────────────────────────────────────────────────────
  // Real-time sweep: search.mjs runs 3 targeted web searches in one API call
  // (SEC 8-K filings, press releases, supply chain plays) then analysis is
  // grounded in those live results only — no stale training data.
  if (query.startsWith('RADAR:') && mode === 'investment') {
    const sectors = parseRadarSectors(query);
    const sectorStr = sectors.length ? sectors.join(' ') : 'AI semiconductor defense space biotech';

    onStage?.('search');
    let findings = [];
    try {
      const res = await postJson('/api/search', {
        query: `sectors: ${sectorStr}`,
        mode,
        isRadar: true,
      });
      findings = Array.isArray(res.findings) ? res.findings : [];
    } catch { /* non-fatal — model will return no candidates if no findings */ }

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
