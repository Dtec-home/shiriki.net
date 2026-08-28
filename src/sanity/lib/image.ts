import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'

import { dataset, projectId } from '@/sanity/env'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || 'placeholder',
  dataset,
})

/**
 * Build a Sanity image CDN URL builder for the given image source (e.g. an
 * `image` field value with `asset._ref`). Chain `.width()`, `.height()`,
 * `.quality()`, `.fit()`, etc. and call `.url()` for use with `next/image`.
 */
export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source)
}

/**
 * Read the intrinsic width/height baked into a Sanity image asset's `_ref`,
 * e.g. `image-abc123def-1600x900-png`. Returns `null` when the ref can't be
 * parsed (unconfigured Sanity, malformed/absent asset) so callers can fall
 * back to a fixed aspect ratio instead of rendering a broken `next/image`.
 */
export function imageDimensions(
  source: { asset?: { _ref?: string | null } | null } | null | undefined,
): { width: number; height: number } | null {
  const ref = source?.asset?._ref
  if (!ref) return null

  const match = /-(\d+)x(\d+)-/.exec(ref)
  if (!match) return null

  const width = Number(match[1])
  const height = Number(match[2])
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null

  return { width, height }
}
