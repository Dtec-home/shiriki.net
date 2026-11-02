"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

const STANDARD_EASE = [0.2, 0, 0, 1] as const

type FadeInProps = {
  children: ReactNode
  className?: string
  /** Delay in seconds before the animation starts. */
  delay?: number
  /** Duration in seconds. Defaults to the "moderate" reveal timing (~180ms). */
  duration?: number
}

/**
 * Simple viewport-triggered fade-in. Renders content statically (no
 * animation, no initial opacity: 0) when the visitor prefers reduced
 * motion, so nothing is ever hidden for them.
 */
export function FadeIn({ children, className, delay = 0, duration = 0.18 }: FadeInProps) {
  // Always render the motion.div: the server cannot know the visitor's
  // motion preference and renders the hidden initial state. Swapping to a
  // plain <div> on the client left that inline opacity:0 in place after
  // hydration, so reduced-motion visitors saw blank sections. Instead, show
  // the content at once (no travel, no duration, no scroll trigger).
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      {...(shouldReduceMotion
        ? { animate: { opacity: 1 }, transition: { duration: 0 } }
        : {
            whileInView: { opacity: 1 },
            viewport: { once: true, margin: "0px 0px -10% 0px" },
            transition: { duration, delay, ease: STANDARD_EASE },
          })}
    >
      {children}
    </motion.div>
  )
}
