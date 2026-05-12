export const config = { runtime: 'edge' };

export default async function handler(req) {
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  return new Response(
    JSON.stringify({ ok: true, runtime: 'edge', hasApiKey: hasKey, time: new Date().toISOString() }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
