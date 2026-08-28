import type { ComponentProps, ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

const sizeClassName = {
  prose: "max-w-2xl",
  content: "max-w-5xl",
  wide: "max-w-7xl",
} as const

type ContainerSize = keyof typeof sizeClassName

type ContainerProps<T extends ElementType> = {
  as?: T
  size?: ContainerSize
  className?: string
  children: ReactNode
} & Omit<ComponentProps<T>, "as" | "className" | "children">

/**
 * Centered max-width wrapper with responsive horizontal gutters (24px
 * mobile / 32px desktop, per the 4/8px spacing grid). Default size is
 * "content" (max-w-5xl); use "prose" (max-w-2xl) for article copy and
 * "wide" (max-w-7xl) for full-bleed sections that still need a max width.
 */
export function Container<T extends ElementType = "div">({
  as,
  size = "content",
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Component = as ?? "div"

  return (
    <Component
      className={cn("mx-auto w-full px-6 lg:px-8", sizeClassName[size], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
