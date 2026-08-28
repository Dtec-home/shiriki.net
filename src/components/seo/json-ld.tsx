/**
 * Renders one or more schema.org JSON-LD payloads as
 * `<script type="application/ld+json">` tags.
 *
 * The JSON is escaped so a stray `</script>` inside string content (e.g. a
 * post title) can't break out of the script element — the standard XSS
 * mitigation for inline JSON-LD. Pass a single object, or an array to emit
 * several schemas in one page (e.g. Organization + WebSite on the home page).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data]

  return (
    <>
      {items.map((item, index) => {
        const json = JSON.stringify(item).replace(/</g, '\\u003c')
        return (
          <script
            key={index}
            type="application/ld+json"
            // JSON is serialized by us (no user HTML), and `<` is escaped above.
            dangerouslySetInnerHTML={{ __html: json }}
          />
        )
      })}
    </>
  )
}
