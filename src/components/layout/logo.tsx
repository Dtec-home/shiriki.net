import { cn } from "@/lib/utils"

type LogoTone = "default" | "inverted"

type LogoProps = {
  className?: string
  /**
   * "default" — for light/neutral surfaces (uses the indigo primary).
   * "inverted" — for the indigo header/footer surfaces (uses white).
   */
  tone?: LogoTone
  /** Set false for tight spots (a favicon-sized slot already shows the mark). */
  showMark?: boolean
}

/**
 * The "S" mark.
 *
 * Two arcs of equal radius facing opposite ways: the upper one opens to
 * receive, the lower one turns back out to give. "Shiriki" is Swahili for to
 * share or take part, and the letterform already contains that gesture — it
 * only needed its two halves separated by colour.
 *
 * Stroked rather than set in a typeface so it keeps its weight down at 16px.
 * The tile carries the brand teal, which makes the mark self-contained on
 * light surfaces and in a browser tab strip; `tone="inverted"` drops it for
 * the teal footer, where a teal tile would be invisible anyway. Kept in sync
 * with `public/icon.svg`, which is the same geometry.
 */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: LogoTone }) {
  // On the brand-teal footer the tile would be the same colour as the surface
  // behind it, so it is dropped there and the arcs carry the mark alone.
  const onBrandSurface = tone === "inverted"
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cn("size-7 shrink-0", className)}
    >
      {onBrandSurface ? null : <rect width="64" height="64" rx="14" fill="#008194" />}
      <path
        d="M42 22 A10 10 0 1 0 32 32"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 32 A10 10 0 1 1 22 42"
        stroke="#7ee8f0"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * The full lockup: the "S" mark beside the "Shiriki" wordmark.
 *
 * Purely presentational; wrap it in a `<Link href="/">` where navigation is
 * required.
 */
export function Logo({ className, tone = "default", showMark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {showMark ? <LogoMark tone={tone} /> : null}
      <span
        className={cn(
          "font-display text-lg font-bold tracking-tight",
          tone === "inverted" ? "text-primary-foreground" : "text-primary"
        )}
      >
        Shiriki
      </span>
    </span>
  )
}
