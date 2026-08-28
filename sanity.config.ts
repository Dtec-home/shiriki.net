import { codeInput } from '@sanity/code-input'
import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from '@/sanity/env'
import { schemaTypes } from '@/sanity/schemaTypes'
import { HIDDEN_FROM_CREATE_TYPES, SINGLETON_TYPES, structure } from '@/sanity/structure'

/**
 * `projectId` may be an empty string when Sanity is unconfigured. Sanity's
 * `defineConfig`/Studio components require a syntactically valid project id
 * to be constructible, so we fall back to a placeholder — the `/studio`
 * route itself guards on `isSanityConfigured` and renders a message instead
 * of mounting this config when no real project id is set.
 */
export default defineConfig({
  name: 'default',
  title: 'Kanisa Connect',

  projectId: projectId || 'placeholder',
  dataset,

  plugins: [
    structureTool({ structure }),
    codeInput(),
    // Vision (GROQ playground) is a development-only tool.
    ...(process.env.NODE_ENV === 'development' ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Remove singletons and `inquiry` from the global "+ New document" menu
    // — singletons are pinned/edited via the desk structure, and `inquiry`
    // documents are created only by the forms server actions.
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((template) => !HIDDEN_FROM_CREATE_TYPES.has(template.templateId))
      }
      return prev
    },
    // Singletons can't be deleted or duplicated from the document pane.
    actions: (prev, { schemaType }) => {
      if (SINGLETON_TYPES.has(schemaType)) {
        return prev.filter((action) => {
          const actionName = (action as unknown as { action?: string }).action
          return actionName !== 'delete' && actionName !== 'duplicate'
        })
      }
      return prev
    },
  },
})
