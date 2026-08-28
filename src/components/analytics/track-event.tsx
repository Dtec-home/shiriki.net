'use client'

import * as React from 'react'
import { trackEvent, type AnalyticsEventName, type AnalyticsEventProps } from '@/lib/analytics'

export type TrackEventProps = {
  /** Event name from `ANALYTICS_EVENTS`. */
  event: AnalyticsEventName
  /** Optional flat property bag attached to the event. */
  props?: AnalyticsEventProps
  /** The single element to wrap. Its own `onClick` (if any) still runs first. */
  children: React.ReactElement<{ onClick?: React.MouseEventHandler }>
}

/**
 * Non-invasive click-tracking wrapper.
 *
 * Wrap an existing button/link WITHOUT modifying it:
 *
 *   <TrackEvent event={ANALYTICS_EVENTS.CTA_CLICK} props={{ location: 'hero' }}>
 *     <a href="/contact">Talk to sales</a>
 *   </TrackEvent>
 *
 * Uses `React.cloneElement` to splice a click handler onto the child that
 * fires `trackEvent` and then calls through to the child's own `onClick` (if
 * any), so wrapping never changes the child's existing behavior. The child
 * must be a single React element that accepts `onClick` (an `<a>`, `<button>`,
 * or any component that forwards it) — this is a thin composition helper,
 * not a replacement for the element it wraps.
 */
export function TrackEvent({ event, props, children }: TrackEventProps) {
  const child = React.Children.only(children)

  const handleClick: React.MouseEventHandler = (mouseEvent) => {
    trackEvent(event, props)
    child.props.onClick?.(mouseEvent)
  }

  return React.cloneElement(child, { onClick: handleClick })
}
