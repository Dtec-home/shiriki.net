import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

import { slugTag, typeTag } from '@/sanity/lib/live'

/**
 * Webhook receiver for Sanity's on-demand revalidation.
 *
 * Configure in sanity.io/manage -> API -> Webhooks:
 *   - URL: https://<your-domain>/api/revalidate
 *   - Dataset: production (or your dataset)
 *   - Trigger on: Create, Update, Delete
 *   - Filter: leave empty to revalidate on any document change (recommended),
 *     or scope to specific types, e.g. `_type in ["post", "faq", ...]`
 *   - Projection: `{ _type, "slug": slug.current }`
 *     (this route reads `_type` and `slug` from the payload body)
 *   - Secret: set to the same value as SANITY_REVALIDATE_SECRET
 *   - HTTP method: POST
 *   - API version: matches NEXT_PUBLIC_SANITY_API_VERSION
 *
 * Tagging scheme (see src/sanity/lib/live.ts for the canonical definitions):
 *   - `typeTag(type)`        -> `sanity:<type>`        — index/listing queries
 *   - `slugTag(type, slug)`  -> `sanity:<type>:<slug>` — detail queries
 *
 * On every webhook delivery we revalidate the type tag (so index pages pick
 * up the change) and, if the document has a slug, the slug tag (so the
 * specific detail page picks up the change) too.
 */

interface RevalidatePayload {
  _type?: string
  slug?: string
}

export async function POST(req: NextRequest) {
  if (!process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: 'SANITY_REVALIDATE_SECRET is not set' },
      { status: 400 },
    )
  }

  try {
    const { isValidSignature, body } = await parseBody<RevalidatePayload>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    )

    if (!isValidSignature) {
      return NextResponse.json(
        { revalidated: false, message: 'Invalid signature' },
        { status: 401 },
      )
    }

    if (!body?._type) {
      return NextResponse.json(
        { revalidated: false, message: 'Missing _type in payload' },
        { status: 400 },
      )
    }

    const tags = [typeTag(body._type)]

    if (body.slug) {
      tags.push(slugTag(body._type, body.slug))
    }

    // `{ expire: 0 }` forces immediate expiration (as opposed to a
    // stale-while-revalidate profile like `"max"`) since this route only
    // runs when the Sanity webhook fires because content actually changed,
    // and we want the next request to see fresh data right away.
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 })
    }

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      tags,
    })
  } catch (err) {
    console.error('Error revalidating', err)
    return NextResponse.json(
      { revalidated: false, message: 'Error revalidating' },
      { status: 500 },
    )
  }
}
