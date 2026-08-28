import { isSanityConfigured } from '@/sanity/env'

import StudioClient from './StudioClient'

// The Studio is a client-rendered SPA; prerender its HTML shell once at
// build time instead of attempting (and failing) to collect dynamic page
// data for it. This is the configuration documented by next-sanity for the
// App Router embed.
export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: '#0b1020',
          color: '#f5f5f7',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Sanity Studio is not configured
          </h1>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.85 }}>
            Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and{' '}
            <code>NEXT_PUBLIC_SANITY_DATASET</code>) in your environment, then
            restart the app to open the Studio here.
          </p>
        </div>
      </div>
    )
  }

  return <StudioClient />
}
