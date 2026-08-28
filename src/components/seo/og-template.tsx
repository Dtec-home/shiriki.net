import type { ReactElement } from 'react'

/**
 * Shared visual template for every OG image (root default + any per-page
 * `opengraph-image.tsx` other agents add for blog posts, etc.), rendered via
 * `next/og` `ImageResponse` (Satori). Kanisa Connect brand:
 *   - deep indigo background (`--primary` ≈ #082675)
 *   - gold accent (`--secondary` ≈ #edae12)
 *   - a subtle diagonal-stripe motif, echoing the site header treatment
 *
 * Only flexbox + the CSS subset Satori supports is used (no grid). Fonts are
 * supplied via `ImageResponse`'s `fonts` option by the caller (see
 * `getOgFonts` in `./og-fonts`); this template just references font-family
 * names that match what was registered.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const

const INDIGO = '#082675'
const INDIGO_DEEP = '#051a52'
const GOLD = '#edae12'
const LIGHT = '#dce6f7'

type OgTemplateArgs = {
  eyebrow: string
  title: string
  /** Optional small line under the title (e.g. tagline). */
  subtitle?: string
  /** Font family name for the display/heading text (matches `ImageResponse` fonts). */
  displayFont?: string
  /** Font family name for sans/body text. */
  sansFont?: string
}

/** Diagonal gold stripes in the top-right corner, clipped by the outer frame. */
function StripeMotif() {
  const stripes = Array.from({ length: 6 })
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 420,
        height: 630,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {stripes.map((_, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: -100,
            right: 40 + index * 56,
            width: 22,
            height: 900,
            backgroundColor: GOLD,
            opacity: 0.08 + (index % 2 === 0 ? 0.05 : 0),
            transform: 'rotate(18deg)',
          }}
        />
      ))}
    </div>
  )
}

export function OgTemplate({
  eyebrow,
  title,
  subtitle,
  displayFont = 'system-ui',
  sansFont = 'system-ui',
}: OgTemplateArgs): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: INDIGO_DEEP,
        backgroundImage: `linear-gradient(135deg, ${INDIGO} 0%, ${INDIGO_DEEP} 65%)`,
        padding: '72px 80px',
        position: 'relative',
      }}
    >
      <StripeMotif />

      {/* Top: wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: GOLD,
          }}
        />
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 34,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.01em',
          }}
        >
          Kanisa Connect
        </div>
      </div>

      {/* Middle: eyebrow + title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 980 }}>
        <div
          style={{
            fontFamily: sansFont,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: GOLD,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontFamily: sansFont, fontSize: 26, color: LIGHT, lineHeight: 1.4 }}>
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Bottom: gold rule + domain */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', height: 4, width: 120, backgroundColor: GOLD }} />
        <div style={{ fontFamily: sansFont, fontSize: 22, color: LIGHT }}>
          kanisaconnect.com
        </div>
      </div>
    </div>
  )
}
