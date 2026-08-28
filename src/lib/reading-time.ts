/**
 * Estimate reading time for a Portable Text `post.body`.
 *
 * Walks the Portable Text array, summing the word count of every text span
 * in standard blocks plus any plain-text fields on custom blocks (callouts,
 * quotes, code), then divides by an average adult reading speed of 200
 * words/minute, rounding up so a post never under-promises.
 */

const WORDS_PER_MINUTE = 200

type PortableSpan = { _type?: string; text?: string }

type PortableBlock = {
  _type?: string
  children?: PortableSpan[]
  text?: string
  quote?: string
  attribution?: string
  code?: { code?: string }
}

function countWords(value: string | undefined | null): number {
  if (!value) return 0
  const trimmed = value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/** Total number of words across a Portable Text body. */
export function countBodyWords(body: ReadonlyArray<unknown> | null | undefined): number {
  if (!body || body.length === 0) return 0

  let words = 0
  for (const raw of body) {
    const block = raw as PortableBlock
    switch (block._type) {
      case 'callout':
        words += countWords(block.text)
        break
      case 'quoteBlock':
        words += countWords(block.quote) + countWords(block.attribution)
        break
      case 'codeBlock':
        words += countWords(block.code?.code)
        break
      default:
        if (Array.isArray(block.children)) {
          for (const child of block.children) {
            if (child?._type === 'span' || child?.text != null) {
              words += countWords(child.text)
            }
          }
        }
        break
    }
  }
  return words
}

/** Estimated reading time in whole minutes (minimum 1), words/200 rounded up. */
export function readingTimeMinutes(body: ReadonlyArray<unknown> | null | undefined): number {
  const words = countBodyWords(body)
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}

/** Human-readable reading-time label, e.g. "4 min read". */
export function readingTimeLabel(body: ReadonlyArray<unknown> | null | undefined): string {
  const minutes = readingTimeMinutes(body)
  return `${minutes} min read`
}
