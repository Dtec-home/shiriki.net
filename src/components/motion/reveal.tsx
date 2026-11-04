import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

type RevealDirection = "up" | "down" | "left" | "right" | "none"

type RevealProps = {
  children: ReactNode
  className?: string
  /** Direction the content travels in from. Defaults to "up". */
  direction?: RevealDirection
  /**
   * Delay in seconds. The reveal is scroll-linked, so this starts it a little
   * later in the element's entry (0.1s ≈ 10% of the entry), capped at 0.4.
   */
  delay?: number
  /** Kept for API compatibility; a scroll-linked reveal has no duration. */
  duration?: number
  /** Distance (px) travelled while revealing. */
  distance?: number
}

function offsetFor(direction: RevealDirection, distance: number): [number, number] {
  switch (direction) {
    case "up":
      return [0, distance]
    case "down":
      return [0, -distance]
    case "left":
      return [distance, 0]
    case "right":
      return [-distance, 0]
    case "none":
    default:
      return [0, 0]
  }
}

/** Inline custom properties read by the `.reveal` rule in globals.css. */
export function revealStyle({
  x = 0,
  y = 16,
  delay = 0,
}: {
  x?: number
  y?: number
  delay?: number
}): CSSProperties {
  return {
    "--reveal-x": `${x}px`,
    "--reveal-y": `${y}px`,
    "--reveal-start": `${Math.min(Math.max(delay, 0), 0.4) * 100}%`,
  } as CSSProperties
}

/**
 * General-purpose reveal-on-scroll wrapper: fade + directional travel as the
 * element enters the viewport.
 *
 * Pure CSS (a scroll-driven animation, `.reveal` in globals.css), not a
 * client component (sprint 2026-11 MKQ-3): the server HTML is visible as-is,
 * so above-the-fold content paints at once instead of waiting for JS to
 * lift an inline `opacity: 0`, and no animation library ships to the
 * browser. Browsers without `animation-timeline` and visitors who prefer
 * reduced motion get the content with no animation.
 */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  distance = 16,
}: RevealProps) {
  const [x, y] = offsetFor(direction, distance)
  return (
    <div className={cn("reveal", className)} style={revealStyle({ x, y, delay })}>
      {children}
    </div>
  )
}
