import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * The small label that sits above a section's `<h2>`.
 *
 * Deliberately *not* the all-caps, wide-letterspaced treatment: that
 * combination is one of the most recognisable generated-template tells, and it
 * appeared on all sixteen sections of this site. Sentence case with a short
 * leading rule reads as a considered typographic choice instead of a default.
 *
 * Colour is passed in via `className` because the label sits on four different
 * surfaces (light, muted, `bg-primary`, and `bg-foreground`).
 */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-center gap-3 text-sm font-semibold text-primary', className)}>
      <span aria-hidden="true" className="h-px w-8 shrink-0 bg-current opacity-40" />
      {children}
    </p>
  )
}
