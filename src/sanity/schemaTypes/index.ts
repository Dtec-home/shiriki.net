import { type SchemaTypeDefinition } from 'sanity'

// Singletons
import { siteSettings } from './singletons/siteSettings'
import { homePage } from './singletons/homePage'
import { aboutPage } from './singletons/aboutPage'
import { pricingPage } from './singletons/pricingPage'

// Embedded objects
import { seo } from './objects/seo'
import { socialLink } from './objects/socialLink'
import { ctaLink } from './objects/ctaLink'

// Portable Text custom block types
import { callout } from './blocks/callout'
import { codeBlock } from './blocks/codeBlock'
import { quoteBlock } from './blocks/quoteBlock'
import { divider } from './blocks/divider'

// Documents
import { legalPage } from './documents/legalPage'
import { givingChannel } from './documents/givingChannel'
import { feature } from './documents/feature'
import { testimonial } from './documents/testimonial'
import { faq } from './documents/faq'
import { post } from './documents/post'
import { author } from './documents/author'
import { category } from './documents/category'
import { inquiry } from './documents/inquiry'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  siteSettings,
  homePage,
  aboutPage,
  pricingPage,

  // Embedded objects
  seo,
  socialLink,
  ctaLink,

  // Portable Text custom block types
  callout,
  codeBlock,
  quoteBlock,
  divider,

  // Documents
  legalPage,
  givingChannel,
  feature,
  testimonial,
  faq,
  post,
  author,
  category,
  inquiry,
]
