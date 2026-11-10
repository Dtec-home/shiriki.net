import { ImageResponse } from 'next/og'

import { getOgFonts } from '@/components/seo/og-fonts'
import { OG_SIZE, OgTemplate } from '@/components/seo/og-template'

// OG variant for /features/fundraising: same branded template as the site
// default. Lives outside the (site) route group because Next suffixes metadata
// routes inside groups with a hash; here the URL stays stable for buildMetadata.
// Same template as the site
// default, with fundraising copy so shared links say what the page is about.
export const alt = 'Shiriki fundraising campaigns: Pay Bill codes, pledges, champions and a WhatsApp leaderboard.'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function Image() {
  const { fonts, displayFont, sansFont } = await getOgFonts()

  return new ImageResponse(
    (
      <OgTemplate
        eyebrow="Fundraising campaigns"
        title="Every harambee on your own Pay Bill."
        subtitle="Campaign codes, pledges that clear themselves, champions and an automatic WhatsApp leaderboard."
        displayFont={displayFont}
        sansFont={sansFont}
      />
    ),
    { ...size, fonts },
  )
}
