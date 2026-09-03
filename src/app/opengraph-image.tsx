import { ImageResponse } from 'next/og'

import { getOgFonts } from '@/components/seo/og-fonts'
import { OG_SIZE, OgTemplate } from '@/components/seo/og-template'
import { SITE_TAGLINE } from '@/lib/site'

// Branded default OG image for the whole site — used by any route that
// doesn't define its own `opengraph-image.tsx` and by `buildMetadata` as the
// fallback `image` for pages with no Sanity `ogImage`.
export const alt = 'Shiriki — Church management that runs on M-Pesa.'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  const { fonts, displayFont, sansFont } = await getOgFonts()

  return new ImageResponse(
    (
      <OgTemplate
        eyebrow="Church management platform"
        title={SITE_TAGLINE}
        subtitle="M-Pesa, Airtel Money and USSD giving, reconciled against your member register."
        displayFont={displayFont}
        sansFont={sansFont}
      />
    ),
    { ...size, fonts },
  )
}
