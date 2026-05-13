// Two-stage collection: web search, then analysis
// Each stage runs as its own edge function to stay under Vercel's 25s limit.

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned non-JSON response (HTTP ${res.status}). The function may have timed out.`);
  }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export async function collectAnalysis(query, onStage) {
  // Stage 1: web search (soft-fails into empty findings on timeout)
  onStage?.('search');
  let findings = [];
  let searchWarning = null;
  try {
    const searchRes = await postJson('/api/search', { query });
    findings = Array.isArray(searchRes.findings) ? searchRes.findings : [];
    searchWarning = searchRes.warning || null;
  } catch (err) {
    // Don't abort the whole run — fall through to analysis without findings
    searchWarning = err.message;
  }

  // Stage 2: analysis using findings
  onStage?.('analyze');
  const analysis = await postJson('/api/analyze', { query, findings });

  // Surface any search warning so the UI can show it (non-fatal)
  if (searchWarning) analysis._searchWarning = searchWarning;
  return analysis;
}
