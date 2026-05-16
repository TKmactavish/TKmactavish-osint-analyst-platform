// Two-stage collection: web search then analysis, both mode-aware.
// Radar mode: real-time web sweep grounded in findings from last 30 days only.

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

function parseRadarSectors(query) {
  const payload = query.slice('RADAR:'.length).trim();
  if (!payload || payload === 'ALL') return [];
  return payload.split(',').map(s => s.trim()).filter(Boolean);
}

function buildRadarAnalysisQuery(sectors) {
  const sectorStr = sectors.length
    ? sectors.join(', ')
    : 'AI, semiconductors, defense, space, biotech, robotics, Edge AI';

  const today  = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

Today: ${today}. Sectors: ${sectorStr}.

STEP 1 — DATE FILTER: Discard every finding dated before ${cutoff}. Only work with findings from the last 30 days. If no findings remain, set candidates to [] and write "No current signals found in last 30 days — try again tomorrow" in scanSummary.

STEP 2 — IDENTIFY CANDIDATES from the remaining recent findings only. Do NOT use training knowledge — it is many months old and already priced in by the market. Only return companies explicitly named in the recent findings.

What to look for:
1. HIDDEN PARTNERSHIP — Company just announced a deal with a major AI/Space/Defense/Cloud player. Signal is real and current but not yet front-page on Bloomberg/CNBC.
2. SUPPLY CHAIN POSITION — Company is a confirmed key supplier or component provider for a hot sector. Documented in recent findings, under-covered by financial media.
3. CORPORATE EVENT — Spin-off, restructuring, or rerating catalyst confirmed in recent findings.

Requirements per candidate:
- NYSE or NASDAQ listed only (not OTC, not pink sheets)
- Under $1B market cap preferred
- Cite the exact finding domain + date that confirms the signal
- If you cannot cite a recent finding for a candidate, do not include it`;
}

export async function collectAnalysis(query, mode, onStage) {
  if (!mode) throw new Error('Analysis mode is required');

  // ── RADAR FLOW ────────────────────────────────────────────────────────────
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
    } catch { /* non-fatal — analysis will return no candidates */ }

    onStage?.('analyze');
    const analysis = await postJson('/api/analyze', {
      query: buildRadarAnalysisQuery(sectors),
      mode,
      findings,
    });
    return analysis;
  }

  // ── STANDARD FLOW (ticker, security, traveler) ───────────────────────────
  onStage?.('search');
  let findings = [];
  let searchWarning = null;
  try {
    const searchQuery = query.slice(0, 480);
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
