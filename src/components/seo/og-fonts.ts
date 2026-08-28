import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Font loading for next/og `ImageResponse` OG images.
//
// Satori (the engine behind `ImageResponse`) requires AT LEAST ONE font and
// only accepts ttf/otf/woff (not woff2). Two-tier strategy:
//
//  1. ALWAYS load a bundled, openly-licensed fallback font from
//     `public/og-fallback-font/` (Liberation Sans, SIL OFL) so OG
//     generation NEVER fails for lack of a font, regardless of network
//     access at build/edge time. Both the display and body roles use the
//     same grotesque face: the brand font (Plus Jakarta Sans) is a sans in
//     both roles, so a serif stand-in would render the wordmark visibly
//     off-brand in exactly the offline case this fallback exists for.
//
//  2. OPPORTUNISTICALLY fetch the real brand font (Plus Jakarta Sans, used
//     across the site via `next/font/google` in the root layout) from
//     Google Fonts at request time. When reachable, the card renders in the
//     true brand face; if the fetch fails (offline build, sandboxed CI),
//     we transparently keep the bundled fallback. The visual layout and
//     brand colors are identical either way.
const FONT_DIR = join(process.cwd(), 'public', 'og-fallback-font')

type OgFont = {
  name: string
  data: ArrayBuffer
  weight: 400 | 500 | 600 | 700
  style: 'normal'
}

/** Normalize a Node `Buffer` to a standalone `ArrayBuffer` (what Satori expects). */
function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

const LEGACY_UA =
  'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.93 Safari/537.36'

/**
 * Google's default CSS response serves woff2 to modern user agents, which
 * Satori can't parse. Requesting with a legacy UA string gets back a
 * ttf/woff URL instead — the same trick the reference implementation uses.
 */
async function fetchGoogleFont(
  family: string,
  weight: 400 | 500 | 600 | 700,
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css?family=${encodeURIComponent(family)}:${weight}`
    const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': LEGACY_UA } })
    if (!cssRes.ok) return null
    const css = await cssRes.text()
    const match = css.match(/src:\s*url\(([^)]+\.(?:woff|ttf|otf))\)/)
    if (!match) return null
    const fontRes = await fetch(match[1])
    if (!fontRes.ok) return null
    return await fontRes.arrayBuffer()
  } catch {
    return null
  }
}

/**
 * Returns the `fonts` array for `ImageResponse` plus the resolved family
 * names the template should reference. The bundled fonts are always present
 * (under "OG Display" / "OG Sans"); when the brand font loads it's
 * registered under "Plus Jakarta Sans" and used instead.
 */
export async function getOgFonts(): Promise<{
  fonts: OgFont[]
  displayFont: string
  sansFont: string
}> {
  // 1. Bundled fallbacks (guaranteed).
  const [sans, sansBold] = await Promise.all([
    readFile(join(FONT_DIR, 'sans.ttf')),
    readFile(join(FONT_DIR, 'sans-bold.ttf')),
  ])

  // The same two files back both the display and body roles — see note above.
  const fonts: OgFont[] = [
    { name: 'OG Display', data: toArrayBuffer(sans), weight: 500, style: 'normal' },
    { name: 'OG Display', data: toArrayBuffer(sansBold), weight: 700, style: 'normal' },
    { name: 'OG Sans', data: toArrayBuffer(sans), weight: 400, style: 'normal' },
    { name: 'OG Sans', data: toArrayBuffer(sansBold), weight: 600, style: 'normal' },
  ]

  let displayFont = 'OG Display'
  let sansFont = 'OG Sans'

  // 2. Try the real brand font (works wherever fonts.gstatic.com is
  //    reachable; a no-op otherwise).
  const [brand600, brand700] = await Promise.all([
    fetchGoogleFont('Plus Jakarta Sans', 600),
    fetchGoogleFont('Plus Jakarta Sans', 700),
  ])

  if (brand600) {
    fonts.push({ name: 'Plus Jakarta Sans', data: brand600, weight: 600, style: 'normal' })
    sansFont = 'Plus Jakarta Sans'
  }
  if (brand700) {
    fonts.push({ name: 'Plus Jakarta Sans', data: brand700, weight: 700, style: 'normal' })
    displayFont = 'Plus Jakarta Sans'
  }

  return { fonts, displayFont, sansFont }
}
