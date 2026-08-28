/**
 * Site navigation structure. Static (not Sanity-driven) — Shiriki's
 * primary nav is small and stable, so it is hand-authored here rather than
 * modeled as a CMS document.
 */

export type NavLink = {
  label: string
  href: string
}

export type FooterNavColumn = {
  heading: string
  links: NavLink[]
}

/** Header + mobile drawer primary navigation. */
export const MAIN_NAV: NavLink[] = [
  { label: 'Giving', href: '/#giving' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

/** Footer link columns, grouped by audience. */
export const FOOTER_NAV: FooterNavColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Giving', href: '/#giving' },
      { label: 'Features', href: '/#features' },
      { label: 'Security', href: '/#security' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
    ],
  },
]
