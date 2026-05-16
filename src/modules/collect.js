// Two-stage collection: web search then analysis, both mode-aware.

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

export async function collectAnalysis(query, mode, onStage) {
  if (!mode) throw new Error('Analysis mode is required');

  // Search only needs keywords — strip the structured radar command prefix
  // and cap at 400 chars so search.mjs never rejects on length
  const searchQuery = query.startsWith('RADAR SCAN COMMAND')
    ? query.replace(/^RADAR SCAN COMMAND[^\n]*\n+/m, '').slice(0, 400)
    : query.slice(0, 400)

  onStage?.('search');
  let findings = [];
  let searchWarning = null;
  try {
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
