import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { revealStyle } from "@/components/motion/reveal"

type FadeInUpProps = {
  children: ReactNode
  className?: string
  /** Delay in seconds; starts the scroll-linked reveal a little later (see `Reveal`). */
  delay?: number
  /** Kept for API compatibility; a scroll-linked reveal has no duration. */
  duration?: number
  /** Distance (px) the content rises while fading in. */
  rise?: number
}

/**
 * Fade + rise as the element enters the viewport. CSS only (see `Reveal`):
 * visible without JS, never hidden under prefers-reduced-motion.
 */
export function FadeInUp({ children, className, delay = 0, rise = 12 }: FadeInUpProps) {
  return (
    <div className={cn("reveal", className)} style={revealStyle({ x: 0, y: rise, delay })}>
      {children}
    </div>
  )
}
