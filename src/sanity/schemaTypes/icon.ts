import { icons } from '@sanity/icons'
import type { ComponentType } from 'react'

/**
 * `@sanity/icons` v5 no longer exports individual named icon components
 * (e.g. `CogIcon`); it exports a single `icons` map of lazily-loaded
 * components keyed by kebab-case name (e.g. `icons.cog`). `defineType`'s
 * `icon` field accepts `React.ComponentType | React.ReactNode`, and a
 * `React.lazy` component satisfies `ComponentType`, so this small wrapper
 * just looks the name up with a friendlier call site: `icon('cog')`.
 */
export function icon(name: keyof typeof icons): ComponentType {
  return icons[name]
}
