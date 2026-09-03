import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  /**
   * "default" — for light/neutral surfaces (uses the indigo primary).
   * "inverted" — for the indigo header/footer surfaces (uses white).
   */
  tone?: "default" | "inverted"
}

/**
 * The "Shiriki" wordmark. Previously set the brand as two words — bold
 * "Shiriki" beside a lighter "Connect" — which is why the rename's
 * whole-string search never caught it: the two halves were separate elements.
 *
 * Purely presentational; wrap it in a `<Link href="/">` where navigation is
 * required.
 */
export function Logo({ className, tone = "default" }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display text-lg font-bold tracking-tight select-none",
        tone === "inverted" ? "text-primary-foreground" : "text-primary",
        className
      )}
    >
      Shiriki
    </span>
  )
}
