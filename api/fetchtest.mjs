export const config = { runtime: 'edge' };

export default async function handler(req) {
  const out = { tests: {}, env: { hasKey: !!process.env.ANTHROPIC_API_KEY } };

  // Test 1: Generic external HTTPS
  try {
    const r = await fetch('https://api.github.com/zen', { signal: AbortSignal.timeout(8000) });
    out.tests.github = { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 100) };
  } catch (e) {
    out.tests.github = { error: e.message };
  }

  // Test 2: api.anthropic.com unauthenticated (should give 401, not hang)
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'test', max_tokens: 1, messages: [{ role: 'user', content: 'x' }] }),
      signal: AbortSignal.timeout(15000),
    });
    out.tests.anthropic_noauth = { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 200) };
  } catch (e) {
    out.tests.anthropic_noauth = { error: e.message, name: e.name };
  }

  // Test 3: api.anthropic.com with real key (should give a real response)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Say hi' }],
        }),
        signal: AbortSignal.timeout(20000),
      });
      out.tests.anthropic_auth = { ok: r.ok, status: r.status, body: (await r.text()).slice(0, 300) };
    } catch (e) {
      out.tests.anthropic_auth = { error: e.message, name: e.name };
    }
  }

  return new Response(JSON.stringify(out, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
