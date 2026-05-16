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
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return `RADAR SCAN COMMAND — output RADAR SCAN schema only.

Today: ${today}. Sectors: ${sectorStr}.

THE STRATEGY: Find news that is strong enough to eventually make Bloomberg/CNBC — but identify it BEFORE Bloomberg/CNBC covers it. The user buys the information gap, holds while FOMO builds, sells at the peak.

THE GOAL: Find the signal before the crowd does. The user buys, holds while FOMO builds, sells at the peak.

STEP 1 — DATE FILTER: Hard cutoff ${cutoff}. Discard every finding older than 7 days. If nothing remains, set candidates to [] and write "No fresh signals in last 7 days" in scanSummary. Do not pad with older news.

STEP 2 — SIGNAL STRENGTH TEST: For each company in the fresh findings, ask:
"Would Bloomberg run this as a headline and move the stock 10-40%?"
If yes AND it has not yet appeared on Bloomberg/CNBC/WSJ front page → that is the play.
If no → exclude it.

STEP 3 — TIMING ASSESSMENT: For each candidate, assess where it is in the discovery cycle:
- JUST BROKE (0-2 days old): Strongest edge. Crowd has not reacted yet.
- EARLY (3-5 days old): Still early, some movement may have started.
- FADING (6-7 days old): Flag this — the window may be closing.

STEP 4 — RETURN CANDIDATES from the fresh findings only. No training knowledge.

Strong signals:
- Named partnership/acquisition with a known company (NVIDIA, AWS, SpaceX, DOD)
- Earnings beat + raised guidance (revenue inflection, not just a beat)
- Government contract award with specific dollar value announced this week
- Insider buying cluster: 2+ executives buying open-market in the last 7 days
- Upcoming catalyst confirmed: conference slot, FDA date, contract decision known

Weak signals (exclude):
- "Strategic roadmap", "exploring", "may announce", vague integration language
- Any news older than 7 days

Target: NYSE/NASDAQ, $500M–$30B market cap. Cite source domain + date for every candidate.`;
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
