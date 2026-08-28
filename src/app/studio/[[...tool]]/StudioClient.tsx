'use client'

import { NextStudio } from 'next-sanity/studio'

import config from '../../../../sanity.config'

/**
 * Client-only wrapper around NextStudio.
 *
 * Importing `next-sanity/studio` (and therefore the whole Sanity Studio
 * module graph, including styled-components/@sanity/ui/@floating-ui) from a
 * Server Component causes Next's build-time "Collecting page data" step to
 * evaluate that graph in a server module context, which can throw. Isolating
 * the import behind a "use client" boundary keeps that module graph out of
 * the server compilation entirely (see next-sanity/#2201).
 */
export default function StudioClient() {
  return <NextStudio config={config} />
}
