// Tag-based on-demand revalidation helpers, shared by `lib/queries.ts`
// (queries attach these as `next.tags`) and `app/api/revalidate/route.ts`
// (the Sanity webhook handler calls `revalidateTag` for the affected tags).
//
// TAGGING SCHEME
// ---------------
// Every GROQ query that depends on documents of type `<type>` should be
// fetched with `{ next: { tags: [typeTag('<type>')] } }`. Queries that
// depend on a single document identified by `slug` should additionally
// include `slugTag('<type>', '<slug>')`. When a document changes, the
// webhook receiver resolves its `_type` (and `slug.current` if present) and
// calls `revalidateTag` for both, so:
//   - index/listing pages (tagged with the type tag) refresh, and
//   - the specific detail page (tagged with the type+slug tag) refreshes,
// without needing a full redeploy.
//
// Singletons (siteSettings, homePage, aboutPage, pricingPage) only ever use
// the type tag, since there is exactly one document per type.

/** Tag for "all documents of this type" — used by index/listing queries. */
export function typeTag(type: string): string {
  return `sanity:${type}`
}

/** Tag for "the document of this type with this slug" — used by detail queries. */
export function slugTag(type: string, slug: string): string {
  return `sanity:${type}:${slug}`
}
