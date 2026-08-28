import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
  /**
   * "default" — for light/neutral surfaces (uses the indigo primary).
   * "inverted" — for the indigo header/footer surfaces (uses white + gold).
   */
  tone?: "default" | "inverted"
}

/**
 * The "Kanisa Connect" wordmark — bold "Kanisa", lighter-weight "Connect".
 * Purely presentational; wrap it in a `<Link href="/">` where navigation is
 * required.
 */
export function Logo({ className, tone = "default" }: LogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-display text-lg tracking-tight select-none",
        className
      )}
    >
      <span
        className={cn(
          "font-bold",
          tone === "inverted" ? "text-primary-foreground" : "text-primary"
        )}
      >
        Kanisa
      </span>{" "}
      <span
        className={cn(
          "font-medium",
          tone === "inverted" ? "text-secondary dark:text-primary-foreground" : "text-foreground/70"
        )}
      >
        Connect
      </span>
    </span>
  )
}
