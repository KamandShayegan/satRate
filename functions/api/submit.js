/**
 * Cloudflare Pages Function: POST /api/submit
 * Stores survey payload in KV. Bind a KV namespace as SATRATE_KV in Pages settings.
 */
export async function onRequestPost(context) {
  const { request, env } = context

  if (!env.SATRATE_KV) {
    return new Response(
      JSON.stringify({ error: 'KV not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await request.json()
    const id = `submission:${Date.now()}:${Math.random().toString(36).slice(2, 9)}`
    const value = JSON.stringify({
      ...body,
      submittedAt: body.submittedAt || new Date().toISOString(),
    })
    await env.SATRATE_KV.put(id, value)
    return new Response(JSON.stringify({ ok: true, id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || 'Failed to save' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
