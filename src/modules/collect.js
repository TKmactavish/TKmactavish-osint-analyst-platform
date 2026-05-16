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

THE STRATEGY: Find news that is strong enough to eventually make Bloomberg/CNBC — but identify it BEFORE Bloomberg/CNBC covers it. The user buys the information gap, holds while FOMO builds, sells at the peak.

STEP 1 — DATE FILTER: Discard every finding dated before ${cutoff}. Only work with findings from the last 30 days. If nothing remains after filtering, set candidates to [] and explain honestly in scanSummary.

STEP 2 — SIGNAL STRENGTH TEST: For each company in the findings, ask: "If Bloomberg published this tomorrow as a headline, would the stock move 10-40%?" Only include companies where the answer is yes. Weak signals (vague roadmaps, "exploring opportunities", generic outlooks) are automatically excluded.

STEP 3 — IDENTIFY CANDIDATES from the recent, strong-signal findings only. Do NOT use training knowledge — it is many months old and already priced in.

Strong signals that qualify:
- Named major partnership or contract with a known company (NVIDIA, AWS, SpaceX, DOD, major pharma, etc.)
- Revenue inflection (+50% or more YoY confirmed in earnings)
- Government contract award with a specific dollar value
- Technology milestone or approval (FDA, regulatory) that de-risks the commercial story
- Short squeeze setup: high short interest + strong incoming catalyst

Weak signals that do NOT qualify:
- "Strategic roadmap" or "platform integration" with no contract or revenue
- NDA submissions with 10-12 month timelines (too far away)
- Vague "discussions" or "exploring partnerships" language

Target profile:
- NYSE or NASDAQ listed only (not OTC, not pink sheets)
- Market cap $500M to $30B — liquid enough to trade, small enough to move
- Not yet front-page on Bloomberg, WSJ, or CNBC (that means the crowd already knows)
- Cite the exact finding domain + date for each candidate's signal`;
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
