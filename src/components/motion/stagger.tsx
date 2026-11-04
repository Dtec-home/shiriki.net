import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

type StaggerProps = {
  children: ReactNode
  className?: string
  /**
   * Offset between consecutive items, in seconds (default 70ms). Scroll-
   * linked, so each item starts its reveal this much later in its entry
   * (0.07 ≈ 7%); see `.reveal-stagger` in globals.css.
   */
  staggerDelay?: number
}

/**
 * Stagger container: its `StaggerItem` children fade and rise in one after
 * another as they enter the viewport. CSS only (see `Reveal`): visible
 * without JS, never hidden under prefers-reduced-motion.
 */
export function Stagger({ children, className, staggerDelay = 0.07 }: StaggerProps) {
  return (
    <div
      className={cn("reveal-stagger", className)}
      style={{ "--reveal-step": `${Math.min(Math.max(staggerDelay, 0), 0.1) * 100}%` } as CSSProperties}
    >
      {children}
    </div>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

/** A single item within a `Stagger` container. */
export function StaggerItem({ children, className }: StaggerItemProps) {
  return <div className={cn("reveal reveal-item", className)}>{children}</div>
}
