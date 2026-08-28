"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

type CountUpStatProps = {
  /** Final numeric value to count up to. */
  value: number
  className?: string
  /** Duration in seconds. Defaults to 1.2s. */
  duration?: number
  /** Text shown before the number, e.g. "+". */
  prefix?: string
  /** Text shown after the number, e.g. "%", "+", " churches". */
  suffix?: string
  /** Decimal places to display. Defaults to 0. */
  decimals?: number
  /** Locale used to format the number (thousand separators, etc). */
  locale?: string
}

/**
 * Animates a number counting up from 0 to `value` once it scrolls into
 * view. Under prefers-reduced-motion, renders the final value immediately
 * — the number is never left at 0 or mid-count for those users.
 */
export function CountUpStat({
  value,
  className,
  duration = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
  locale = "en-US",
}: CountUpStatProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" })
  const shouldReduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  // Derived during render, not stored: `useReducedMotion()` resolves to
  // `null` on the first render and only settles afterwards, so a state
  // initializer would capture the wrong value and never correct itself.
  const shown = shouldReduceMotion ? value : display

  const format = (n: number) =>
    n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })

  useEffect(() => {
    // Reduced motion is handled during render via `shown`; no animation
    // and no state write needed here.
    if (shouldReduceMotion || !isInView) return

    const controls = animate(0, value, {
      duration,
      ease: [0.2, 0, 0, 1],
      onUpdate: (latest) => setDisplay(latest),
    })

    return () => controls.stop()
  }, [isInView, shouldReduceMotion, value, duration])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(shown)}
      {suffix}
    </span>
  )
}
