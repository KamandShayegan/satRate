/**
 * Cloudflare Pages Function: GET /api/results
 * Reads all survey submissions from KV and returns aggregated stats (anonymous).
 * Bind SATRATE_KV in Pages settings.
 */

const RATING_KEYS = [
  'onboardingSmooth',
  'docEffective', 'docUseLater', 'docClear', 'docComplete', 'docReferToOthers', 'docEasyIntuitive',
  'usabilityReflected', 'usabilityCommunication', 'usabilityTailored',
  'supportFeltSupported', 'supportResponsive', 'supportHadResources', 'supportSolvedIssues',
]
const LENGTH_KEYS = ['onboardingLength']
const LENGTH_OPTIONS = ['short', 'appropriate', 'long']

function emptyRatingDist() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
}

function emptyLengthDist() {
  return { short: 0, appropriate: 0, long: 0 }
}

export async function onRequestGet(context) {
  const { env } = context

  if (!env.SATRATE_KV) {
    return new Response(
      JSON.stringify({ error: 'KV not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const submissions = []
    let cursor = undefined
    do {
      const list = await env.SATRATE_KV.list({ prefix: 'submission:', limit: 1000, cursor })
      for (const key of list.keys) {
        const raw = await env.SATRATE_KV.get(key.name)
        if (raw) {
          try {
            submissions.push(JSON.parse(raw))
          } catch (_) {}
        }
      }
      cursor = list.list_complete ? undefined : list.cursor
    } while (cursor)

    const totalResponses = submissions.length
    const ratingDists = {}
    RATING_KEYS.forEach(k => { ratingDists[k] = emptyRatingDist() })
    const lengthDists = {}
    LENGTH_KEYS.forEach(k => { lengthDists[k] = emptyLengthDist() })

    for (const s of submissions) {
      for (const k of RATING_KEYS) {
        const v = s[k]
        if (typeof v === 'number' && v >= 1 && v <= 5) {
          ratingDists[k][v] = (ratingDists[k][v] || 0) + 1
        }
      }
      for (const k of LENGTH_KEYS) {
        const v = s[k]
        if (LENGTH_OPTIONS.includes(v)) {
          lengthDists[k][v] = (lengthDists[k][v] || 0) + 1
        }
      }
    }

    return new Response(
      JSON.stringify({
        totalResponses,
        rating: ratingDists,
        length: lengthDists,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || 'Failed to load results' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
