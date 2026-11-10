import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { revealStyle } from "@/components/motion/reveal"

type FadeInProps = {
  children: ReactNode
  className?: string
  /** Delay in seconds; starts the scroll-linked fade a little later (see `Reveal`). */
  delay?: number
  /** Kept for API compatibility; a scroll-linked reveal has no duration. */
  duration?: number
}

/**
 * Fade-in as the element enters the viewport. CSS only (see `Reveal`):
 * visible without JS, never hidden under prefers-reduced-motion.
 */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <div className={cn("reveal", className)} style={revealStyle({ x: 0, y: 0, delay })}>
      {children}
    </div>
  )
}
