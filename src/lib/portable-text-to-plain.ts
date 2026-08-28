import { toPlainText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'

type PortableTextLike = {
  _type?: string
  style?: string
  listItem?: string
  children?: { text?: string }[]
}

/**
 * Flatten a Sanity Portable Text value to readable plain text:
 *  - paragraphs/headings are joined with blank-line breaks,
 *  - list items are rendered as `- <text>`,
 *  - images, code blocks, and other non-text blocks are skipped,
 *  - `null`/`undefined`/malformed input safely returns `''`.
 *
 * Falls back to `@portabletext/react`'s `toPlainText` (which just joins all
 * span text) when the richer per-block formatting isn't needed, but here we
 * walk blocks ourselves so list markers and paragraph breaks survive —
 * useful for both JSON-LD (FAQ answers) and the llms-full.txt dump.
 *
 * `maxChars` truncates very long bodies (e.g. full blog posts) so callers
 * that need a short summary don't have to truncate themselves. Pass
 * `Infinity` (or omit for callers that already pass short content) when the
 * full text is wanted.
 */
export function portableTextToPlain(value: unknown, maxChars = Infinity): string {
  if (value == null) return ''

  // Some fields (short FAQ answers, etc.) may already be plain strings.
  if (typeof value === 'string') {
    return truncate(value.replace(/\s+/g, ' ').trim(), maxChars)
  }

  if (!Array.isArray(value) || value.length === 0) return ''

  let text = ''
  try {
    const lines: string[] = []
    for (const block of value as PortableTextLike[]) {
      if (!block || typeof block !== 'object') continue
      if (block._type && block._type !== 'block') continue // skip images/embeds/custom blocks

      const line = toPlainText([block as PortableTextBlock]).trim()
      if (!line) continue

      lines.push(block.listItem ? `- ${line}` : line)
    }
    text = lines.join('\n\n').replace(/[ \t]+/g, ' ').trim()
  } catch {
    return ''
  }

  return truncate(text, maxChars)
}

function truncate(text: string, maxChars: number): string {
  if (!Number.isFinite(maxChars) || text.length <= maxChars) return text
  return `${text.slice(0, maxChars).trimEnd()}…`
}
