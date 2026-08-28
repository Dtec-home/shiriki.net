"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

const STANDARD_EASE = [0.2, 0, 0, 1] as const

type RevealDirection = "up" | "down" | "left" | "right" | "none"

type RevealProps = {
  children: ReactNode
  className?: string
  /** Direction the content travels in from. Defaults to "up". */
  direction?: RevealDirection
  /** Delay in seconds before the animation starts. */
  delay?: number
  /** Duration in seconds. Defaults to the "moderate" reveal timing (~200ms). */
  duration?: number
  /** Distance (px) travelled while revealing. */
  distance?: number
}

function offsetFor(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance }
    case "down":
      return { y: -distance }
    case "left":
      return { x: distance }
    case "right":
      return { x: -distance }
    case "none":
    default:
      return {}
  }
}

/**
 * General-purpose reveal-on-scroll wrapper: fade + directional travel,
 * fires once when the element enters the viewport. Renders content
 * statically (no animation, never hidden) under prefers-reduced-motion.
 */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.2,
  distance = 16,
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  const offset = offsetFor(direction, distance)

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay, ease: STANDARD_EASE }}
    >
      {children}
    </motion.div>
  )
}
