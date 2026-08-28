'use client'

import * as React from 'react'
import { Container } from '@/components/layout/container'

type SectionErrorBoundaryProps = {
  children: React.ReactNode
  /** Short label used only in the dev/server console log, e.g. "Testimonials". */
  label?: string
  /**
   * Render nothing on failure instead of the default apology note — for
   * genuinely optional/decorative sections where silently omitting the
   * section is friendlier than drawing attention to a broken block.
   */
  silent?: boolean
}

type SectionErrorBoundaryState = { hasError: boolean }

/**
 * Client Component error boundary that isolates one page section (which may
 * itself be a Server Component passed in as `children`) so a render failure
 * there can't blank the rest of the page. A route's `error.tsx` only catches
 * failures for its whole segment — this catches at the section level, which
 * is what lets an unrelated section keep rendering when e.g. malformed CMS
 * content trips up a Portable Text block or an icon lookup.
 *
 * Deliberately does not offer a client-side "retry" for the wrapped content:
 * the failure originates in a server render, so the only real recovery is a
 * full page reload, offered as a plain, low-drama affordance.
 */
export class SectionErrorBoundary extends React.Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
  state: SectionErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error(`[section:error]${this.props.label ? ` (${this.props.label})` : ''}`, error)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.silent) return null

    return (
      <Container as="div" className="py-10 text-center">
        <p className="text-sm text-muted-foreground">
          This part of the page didn&apos;t load. The rest of the page is unaffected —{' '}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-semibold text-primary underline underline-offset-2 focus-visible:outline-primary"
          >
            reload
          </button>{' '}
          to try again.
        </p>
      </Container>
    )
  }
}
