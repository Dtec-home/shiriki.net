'use client'

import * as React from 'react'
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics'

const MILESTONES = [25, 50, 75, 100] as const

/**
 * Mount once per page (e.g. near the bottom of `app/(site)/layout.tsx`, or a
 * specific page) to report scroll-depth milestones for the funnel.
 *
 * Behavior:
 * - Reports each of 25/50/75/100% at most ONCE per page view.
 * - Throttled via `requestAnimationFrame` so the scroll listener never fires
 *   more than once per frame.
 * - Renders nothing — this is instrumentation only, not UI.
 * - A no-op outside production: `trackEvent` itself already guards on
 *   `NODE_ENV`, so this component still attaches (harmless) listeners in
 *   dev but never actually sends anything.
 *
 * Not wired into any layout/page by this sprint (see docs/BUILD_SPEC.md /
 * final report for the exact mount point) — dropping `<ScrollDepth />`
 * anywhere in the tree once is all a page needs.
 */
export function ScrollDepth() {
  React.useEffect(() => {
    const reported = new Set<number>()
    let ticking = false

    function computeDepthPercent(): number {
      const doc = document.documentElement
      const scrollTop = window.scrollY || doc.scrollTop
      const scrollHeight = doc.scrollHeight - doc.clientHeight
      if (scrollHeight <= 0) return 100
      return Math.min(100, Math.round((scrollTop / scrollHeight) * 100))
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const depth = computeDepthPercent()
        for (const milestone of MILESTONES) {
          if (depth >= milestone && !reported.has(milestone)) {
            reported.add(milestone)
            trackEvent(ANALYTICS_EVENTS.SCROLL_DEPTH, { depth: milestone, path: window.location.pathname })
          }
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    // Check once on mount in case the page is short enough to already be
    // fully "scrolled" (scrollHeight === clientHeight).
    onScroll()

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}
