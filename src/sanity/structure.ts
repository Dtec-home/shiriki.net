import type { StructureResolver } from 'sanity/structure'

import { icons } from '@sanity/icons'

/**
 * Studio desk structure:
 *  - Pinned singletons (siteSettings, homePage, aboutPage, pricingPage) —
 *    single documents, edited directly, no list/create/delete.
 *  - Content group: Giving channels, Features, Testimonials, FAQs, Legal
 *    pages.
 *  - Blog group: Posts, Authors, Categories.
 *  - Inquiries: a read-only list (no "create new" action), sorted newest
 *    first, with a per-status filtered view.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // --- Pinned singletons ---
      S.listItem()
        .title('Site settings')
        .icon(icons.cog)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('Home page')
        .icon(icons.home)
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('About page')
        .icon(icons['info-outline'])
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
      S.listItem()
        .title('Pricing page')
        .icon(icons['credit-card'])
        .child(S.document().schemaType('pricingPage').documentId('pricingPage')),

      S.divider(),

      // --- Content ---
      S.listItem()
        .title('Content')
        .icon(icons.folder)
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('givingChannel').title('Giving channels').icon(icons.bill),
              S.documentTypeListItem('feature').title('Features').icon(icons.sparkles),
              S.documentTypeListItem('testimonial').title('Testimonials').icon(icons.comment),
              S.documentTypeListItem('faq').title('FAQs').icon(icons['help-circle']),
              S.documentTypeListItem('legalPage').title('Legal pages').icon(icons.document),
            ]),
        ),

      // --- Blog ---
      S.listItem()
        .title('Blog')
        .icon(icons['document-text'])
        .child(
          S.list()
            .title('Blog')
            .items([
              S.documentTypeListItem('post').title('Posts').icon(icons['document-text']),
              S.documentTypeListItem('author').title('Authors').icon(icons.user),
              S.documentTypeListItem('category').title('Categories').icon(icons.tag),
            ]),
        ),

      S.divider(),

      // --- Inquiries: read-only, no create-new action ---
      S.listItem()
        .title('Inquiries')
        .icon(icons.inbox)
        .child(
          S.list()
            .title('Inquiries')
            .items([
              S.listItem()
                .title('All inquiries')
                .child(
                  S.documentTypeList('inquiry')
                    .title('All inquiries')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
                ),
              S.listItem()
                .title('New')
                .child(
                  S.documentTypeList('inquiry')
                    .title('New')
                    .filter('_type == "inquiry" && status == "new"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Contacted')
                .child(
                  S.documentTypeList('inquiry')
                    .title('Contacted')
                    .filter('_type == "inquiry" && status == "contacted"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Qualified')
                .child(
                  S.documentTypeList('inquiry')
                    .title('Qualified')
                    .filter('_type == "inquiry" && status == "qualified"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Closed')
                .child(
                  S.documentTypeList('inquiry')
                    .title('Closed')
                    .filter('_type == "inquiry" && status == "closed"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }]),
                ),
            ]),
        ),
    ])

/** Document type names that are singletons (pinned, not listable/creatable). */
export const SINGLETON_TYPES = new Set(['siteSettings', 'homePage', 'aboutPage', 'pricingPage'])

/** Document types excluded from the global "create new document" menu. */
export const HIDDEN_FROM_CREATE_TYPES = new Set([...SINGLETON_TYPES, 'inquiry'])
