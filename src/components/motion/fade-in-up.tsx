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
  // Always render the motion.div: the server cannot know the visitor's
  // motion preference and renders the hidden initial state. Swapping to a
  // plain <div> on the client left that inline opacity:0 in place after
  // hydration, so reduced-motion visitors saw blank sections. Instead, show
  // the content at once (no travel, no duration, no scroll trigger).
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: rise }}
      {...(shouldReduceMotion
        ? { animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
        : {
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "0px 0px -10% 0px" },
            transition: { duration, delay, ease: STANDARD_EASE },
          })}
    >
      {children}
    </motion.div>
  )
}
