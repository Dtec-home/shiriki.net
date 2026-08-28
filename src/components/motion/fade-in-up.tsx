"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

const STANDARD_EASE = [0.2, 0, 0, 1] as const

type FadeInUpProps = {
  children: ReactNode
  className?: string
  /** Delay in seconds before the animation starts. */
  delay?: number
  /** Duration in seconds. Defaults to the "moderate" reveal timing (~200ms). */
  duration?: number
  /** Distance (px) the content rises while fading in. */
  rise?: number
}

/**
 * Fade + rise reveal, triggered once when scrolled into view. Renders
 * statically (no animation, no hidden initial state) under
 * prefers-reduced-motion.
 */
export function FadeInUp({
  children,
  className,
  delay = 0,
  duration = 0.2,
  rise = 12,
}: FadeInUpProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: rise }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay, ease: STANDARD_EASE }}
    >
      {children}
    </motion.div>
  )
}
