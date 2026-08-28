import { Database, Globe, LockKeyhole, ShieldCheck, Smartphone, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { FadeInUp } from '@/components/motion/fade-in-up'
import { Reveal } from '@/components/motion/reveal'
import { DemoRequestDialog } from '@/components/forms/demo-request-dialog'
import { USSD_CODE } from '@/lib/site'

/** Loosely keyed so a free-text `icon` string from Sanity resolves sensibly. */
const ICONS: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  'shield-check': ShieldCheck,
  lock: LockKeyhole,
  'lock-keyhole': LockKeyhole,
  database: Database,
  globe: Globe,
}

export type SecurityBadge = {
  /** Free-text icon key (e.g. "shield", "lock"). Unrecognized values fall back to a default icon. */
  icon: string
  label: string
}

export type SecurityBandProps = {
  eyebrow: string
  heading: string
  lead: string
  badges: SecurityBadge[]
  ussd: {
    eyebrow: string
    code: string
    text: string
    ctaLabel: string
  }
}

export const FALLBACK_SECURITY_BAND: SecurityBandProps = {
  eyebrow: 'Ready for what is next',
  heading: 'Enterprise-grade security. Church-simple UX.',
  lead: 'Built on a robust, scalable architecture that protects your data and keeps ministry moving.',
  badges: [
    { icon: 'shield', label: 'OTP-only auth' },
    { icon: 'lock', label: 'Rotating JWTs' },
    { icon: 'database', label: 'Immutable audit logs' },
    { icon: 'globe', label: 'Multi-tenancy scale' },
  ],
  ussd: {
    eyebrow: 'Every phone is a giving phone',
    code: USSD_CODE,
    text: 'Our USSD channel works on feature phones without internet or app downloads. Members can register, give, and request SMS statements instantly.',
    ctaLabel: 'View USSD simulator',
  },
}

/**
 * "Enterprise-grade security" band: a 2x2 badge grid on the left, the USSD
 * feature-phone panel on the right. Anchored as `#security`.
 */
export function SecurityBand({ eyebrow, heading, lead, badges, ussd }: SecurityBandProps) {
  return (
    <section id="security" className="scroll-mt-20 bg-primary/5 py-20 lg:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2">
        <FadeInUp>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-5xl">{heading}</h2>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{lead}</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {badges.map((badge) => {
              const Icon = ICONS[badge.icon?.toLowerCase() ?? ''] ?? ShieldCheck
              return (
                <div key={badge.label} className="rounded-xl border bg-card p-4 shadow-brand-sm">
                  <Icon className="text-primary" aria-hidden="true" />
                  <p className="mt-4 text-sm font-bold">{badge.label}</p>
                </div>
              )
            })}
          </div>
        </FadeInUp>

        <Reveal delay={0.08}>
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground shadow-brand-xl lg:p-10">
            <Smartphone className="text-secondary dark:text-primary-foreground" aria-hidden="true" />
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-secondary dark:text-primary-foreground">{ussd.eyebrow}</p>
            <p className="mt-3 font-mono text-3xl font-bold">{ussd.code}</p>
            <p className="mt-5 leading-7 text-primary-foreground/70">{ussd.text}</p>
            <DemoRequestDialog>
              <button
                type="button"
                className="mt-8 min-h-11 rounded-lg bg-primary-foreground px-5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-foreground/90 focus-visible:outline-primary-foreground"
              >
                {ussd.ctaLabel}
              </button>
            </DemoRequestDialog>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
