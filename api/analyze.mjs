export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  let q = 'diagnostic';
  try {
    if (req.method === 'POST') {
      const body = await req.json();
      q = (body.query || 'diagnostic').trim();
    }
  } catch {}

  const data = {
    query: q,
    type: 'location',
    summary: 'DIAGNOSTIC RESPONSE: If you see this, the /api/analyze route is reaching analyze.mjs successfully. The Anthropic API call has been disabled to isolate the failure mode.',
    risk: 'LOW',
    sources: [
      { title: 'Diagnostic', url: 'https://example.com', domain: 'example.com', date: null, type: 'reference', confidence: 'high' }
    ],
    timeline: [],
    flags: [],
    risk_assessment: { level: 'LOW', rationale: 'Diagnostic build, no real assessment', factors: ['no-op'] },
    analytical_perspective: 'This is a hardcoded diagnostic response from the edge function. The fact that you can see this JSON proves the /api/analyze route works end-to-end and the edge runtime is correctly serving the .mjs file. If this works but the full version (with Anthropic API call) does not, the failure is specifically in the outbound fetch to api.anthropic.com from Vercel Edge runtime. Next step is to restore the API call and inspect the network path.',
    recommendations: {
      law_enforcement: ['Confirm this diagnostic appears', 'Re-enable Anthropic call next', 'Inspect Vercel function logs', 'Verify ANTHROPIC_API_KEY is correct'],
      private_sector: ['Use this output to confirm routing works', 'Then re-enable AI call', 'Monitor edge function logs', 'Check egress connectivity'],
      traveler: ['Diagnostic only', 'No real travel info yet', 'Awaiting AI re-enable', 'Stay tuned']
    }
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
