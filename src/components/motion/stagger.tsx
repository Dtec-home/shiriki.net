"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion, type Variants } from "motion/react"

const STANDARD_EASE = [0.2, 0, 0, 1] as const
const ITEM_RISE = 12
const ITEM_DURATION = 0.2

type StaggerProps = {
  children: ReactNode
  className?: string
  /** Delay between each child's reveal, in seconds. Defaults to 70ms. */
  staggerDelay?: number
}

const containerVariants = (staggerDelay: number): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
})

const itemVariants: Variants = {
  hidden: { opacity: 0, y: ITEM_RISE },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: ITEM_DURATION, ease: STANDARD_EASE },
  },
}

/**
 * Stagger container: reveals its `StaggerItem` children one after another,
 * fading + rising in once when scrolled into view. Renders statically (no
 * animation, nothing hidden) under prefers-reduced-motion.
 */
export function Stagger({ children, className, staggerDelay = 0.07 }: StaggerProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={containerVariants(staggerDelay)}
    >
      {children}
    </motion.div>
  )
}

type StaggerItemProps = {
  children: ReactNode
  className?: string
}

/** A single item within a `Stagger` container. */
export function StaggerItem({ children, className }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
