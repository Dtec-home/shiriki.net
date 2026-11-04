/**
 * Plans contract: shiriki.net's plan bullets ↔ the backend's `tenants/plans.py`
 * (sprint 2026-11 "Parity", lane MKT-QA, MKQ-1; decisions P-D3, P-D14, Q-3).
 *
 * The site is a promise: every fundraising feature it sells on a plan must be
 * switched on for that plan by the backend, and no cheaper plan may claim it.
 *
 *   pnpm exec tsx scripts/check-plans-contract.ts                    # check (exit 1 on mismatch)
 *   pnpm exec tsx scripts/check-plans-contract.ts --update [ref]     # regenerate the snapshot
 *   pnpm exec tsx scripts/check-plans-contract.ts --verify-snapshot  # snapshot == backend file?
 *
 * The backend is read through `tests/contract/plans-snapshot.json`, so the
 * check and its test need no backend checkout (CI). `--update` reads
 * `tenants/plans.py` from the backend repo with `git show <ref>:tenants/plans.py`
 * (read-only, the working tree is never touched) and evaluates it with
 * python3, stubbing its one import (`tenants.features`), so the snapshot holds
 * exactly what the backend's own `flags_for_plan` computes.
 * Backend repo: $SHIRIKI_BACKEND_REPO, default /home/md/Tweny5/KanisaConnect/backend.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { FALLBACK_COMPARISON_ROWS, FALLBACK_PRICING_TIERS, PLAN_FLAG_BULLETS, PLAN_NAMES } from '../src/lib/pricing-plans'

import { pricingPlans } from './seed'

const HERE = dirname(fileURLToPath(import.meta.url))
export const SNAPSHOT_PATH = resolve(HERE, '../tests/contract/plans-snapshot.json')
export const BACKEND_REPO = process.env.SHIRIKI_BACKEND_REPO ?? '/home/md/Tweny5/KanisaConnect/backend'
export const DEFAULT_REF = 'sprint/2026-11-parity'

/** The P-D3 flags the site sells by name. A flag here with no bullet, or a bullet on the wrong plan, fails. */
export const CONTRACT_FLAGS = [
  'device_sign_in',
  'giving_campaigns',
  'campaign_public_pages',
  'pledge_module',
  'fundraising_champions',
  'department_campaigns',
  'whatsapp_leaderboard',
] as const

export type SnapshotPlan = {
  code: string
  label: string
  priceKes: number | null
  limits: { members: number | null; sms_per_month: number | null; branches: number | null }
  /** Flags this tier adds to the one below (plans.py `*_ADDS`), sorted. */
  adds: string[]
}

export type PlansSnapshot = {
  source: { repo: string; path: string; ref: string; commit: string; blob: string }
  plans: SnapshotPlan[]
}

export type SitePlanCard = { name: string; priceKes: number | null; features: string[] }

export type SitePlans = {
  /** Flag → plan, as `PLAN_FLAG_BULLETS` states it. */
  flagPlans: Record<string, string>
  /** Flag → bullet text. */
  flagBullets: Record<string, string>
  /** Each place plan cards come from: the pricing page fallback and the Sanity seed. */
  sources: { name: string; plans: SitePlanCard[] }[]
  comparison: { feature: string; values: (string | boolean)[] }[]
}

// ---------------------------------------------------------------------------
// Reading both sides
// ---------------------------------------------------------------------------

export function loadSnapshot(path = SNAPSHOT_PATH): PlansSnapshot {
  return JSON.parse(readFileSync(path, 'utf8')) as PlansSnapshot
}

export function siteFromSources(): SitePlans {
  const entries = Object.entries(PLAN_FLAG_BULLETS) as [string, { plan: string; bullet: string }][]
  return {
    flagPlans: Object.fromEntries(entries.map(([f, v]) => [f, v.plan])),
    flagBullets: Object.fromEntries(entries.map(([f, v]) => [f, v.bullet])),
    sources: [
      {
        name: 'pricing page (src/lib/pricing-plans.ts)',
        plans: FALLBACK_PRICING_TIERS.map((t) => ({
          name: t.name,
          priceKes: typeof t.priceKes === 'number' ? t.priceKes : null,
          features: [...t.features, t.billingNote, t.description],
        })),
      },
      {
        name: 'Sanity seed (scripts/seed.ts)',
        plans: pricingPlans.map((p) => {
          const plan = p as { name: string; priceKES?: number; features: string[]; description: string }
          return {
            name: plan.name,
            priceKes: typeof plan.priceKES === 'number' ? plan.priceKES : null,
            features: [...plan.features, plan.description],
          }
        }),
      },
    ],
    comparison: FALLBACK_COMPARISON_ROWS.map((r) => ({ feature: r.feature, values: [...r.values] })),
  }
}

/** Python that evaluates plans.py (read from stdin) with its import stubbed and prints JSON. */
const PY_EXPORT = String.raw`
import json, sys, types
src = sys.stdin.read()
pkg = types.ModuleType('tenants'); pkg.__path__ = []
feat = types.ModuleType('tenants.features'); feat.FLAG_SETTINGS = {}
sys.modules['tenants'] = pkg; sys.modules['tenants.features'] = feat
ns = {'__name__': 'tenants.plans'}
exec(compile(src, 'tenants/plans.py', 'exec'), ns)
out = []
for code in ns['PLAN_ORDER']:
    lim = ns['PLAN_LIMITS'][code]
    out.append({
        'code': code,
        'label': ns['PLAN_LABELS'][code],
        'priceKes': ns['PLAN_PRICES_KES'].get(code),
        'limits': {'members': lim.members, 'sms_per_month': lim.sms_per_month, 'branches': lim.branches},
        'adds': sorted(ns['PLAN_ADDITIONS'][code]),
    })
print(json.dumps(out))
`

export function exportBackendPlans(ref = DEFAULT_REF, repo = BACKEND_REPO): PlansSnapshot {
  const git = (...args: string[]) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim()
  const path = 'tenants/plans.py'
  const source = git('show', `${ref}:${path}`)
  const plans = JSON.parse(execFileSync('python3', ['-I', '-c', PY_EXPORT], { input: source, encoding: 'utf8' })) as SnapshotPlan[]
  return {
    source: {
      repo: 'shiriki backend',
      path,
      ref,
      commit: git('log', '-1', '--format=%H', ref, '--', path),
      blob: git('rev-parse', `${ref}:${path}`),
    },
    plans,
  }
}

// ---------------------------------------------------------------------------
// The contract
// ---------------------------------------------------------------------------

/** Every mismatch between the backend snapshot and the site, as readable lines. Empty = agree. */
export function checkPlansContract(snapshot: PlansSnapshot, site: SitePlans): string[] {
  const errors: string[] = []
  const labels = snapshot.plans.map((p) => p.label)

  if (JSON.stringify(labels) !== JSON.stringify([...PLAN_NAMES])) {
    errors.push(`plan names/order: backend ${labels.join(', ')} ≠ site ${PLAN_NAMES.join(', ')}`)
  }

  // Cheapest backend tier that includes each flag (tiers accumulate upwards).
  const firstPlan = new Map<string, string>()
  for (const plan of snapshot.plans) {
    for (const flag of plan.adds) if (!firstPlan.has(flag)) firstPlan.set(flag, plan.label)
  }
  const rank = (plan: string) => labels.indexOf(plan)

  for (const flag of CONTRACT_FLAGS) {
    const backendPlan = firstPlan.get(flag)
    const sitePlan = site.flagPlans[flag]
    if (!backendPlan) {
      errors.push(`${flag}: in no tier of tenants/plans.py, but the site sells it on ${sitePlan ?? '—'}`)
      continue
    }
    if (!sitePlan) {
      errors.push(`${flag}: backend turns it on from ${backendPlan}, the site has no bullet for it`)
      continue
    }
    if (sitePlan !== backendPlan) {
      errors.push(`${flag}: backend turns it on from ${backendPlan}, the site sells it from ${sitePlan}`)
    }
  }
  for (const flag of Object.keys(site.flagPlans)) {
    if (!(CONTRACT_FLAGS as readonly string[]).includes(flag)) {
      errors.push(`${flag}: has a site bullet but is not a contract flag (add it to CONTRACT_FLAGS)`)
    }
  }

  // A bullet lives on the cheapest backend plan of every flag it stands for.
  const bulletPlan = new Map<string, string>()
  for (const flag of CONTRACT_FLAGS) {
    const bullet = site.flagBullets[flag]
    const plan = firstPlan.get(flag)
    if (!bullet || !plan) continue
    const prev = bulletPlan.get(bullet)
    if (prev && prev !== plan) errors.push(`"${bullet}": stands for flags first sold on ${prev} and ${plan}`)
    else bulletPlan.set(bullet, plan)
  }

  for (const source of site.sources) {
    for (const [bullet, plan] of bulletPlan) {
      const card = source.plans.find((p) => p.name === plan)
      if (!card) {
        errors.push(`${source.name}: no ${plan} card`)
        continue
      }
      if (!card.features.includes(bullet)) errors.push(`${source.name}: ${plan} card is missing "${bullet}"`)
      for (const other of source.plans) {
        const r = rank(other.name)
        if (r >= 0 && r < rank(plan) && other.features.some((f) => f.includes(bullet))) {
          errors.push(`${source.name}: ${other.name} lists "${bullet}" but the backend sells it from ${plan}`)
        }
      }
    }
    for (const plan of snapshot.plans) {
      const card = source.plans.find((p) => p.name === plan.label)
      if (!card) continue
      if (card.priceKes !== plan.priceKes) {
        errors.push(`${source.name}: ${plan.label} price KES ${card.priceKes ?? 'custom'} ≠ backend ${plan.priceKes ?? 'custom'}`)
      }
      const text = card.features.join(' · ')
      const { members, sms_per_month: sms } = plan.limits
      if (members !== null && !text.includes(`up to ${members.toLocaleString('en-US')} members`) &&
          !text.includes(`Up to ${members.toLocaleString('en-US')} members`)) {
        errors.push(`${source.name}: ${plan.label} does not say "up to ${members.toLocaleString('en-US')} members" (backend limit)`)
      }
      if (sms !== null && !text.includes(`${sms} SMS/month`)) {
        errors.push(`${source.name}: ${plan.label} does not say "${sms} SMS/month" (backend limit)`)
      }
    }
  }

  // Comparison table: a sprint row is ticked from its backend plan upwards, nowhere cheaper.
  for (const [bullet, plan] of bulletPlan) {
    const row = site.comparison.find((r) => r.feature === bullet)
    if (!row) {
      errors.push(`comparison table: no row for "${bullet}"`)
      continue
    }
    const expected = labels.map((_, i) => i >= rank(plan))
    if (JSON.stringify(row.values) !== JSON.stringify(expected)) {
      errors.push(`comparison table: "${bullet}" ticks ${JSON.stringify(row.values)}, backend sells it from ${plan}`)
    }
  }

  return errors
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main(argv: string[]) {
  if (argv[0] === '--update') {
    const snapshot = exportBackendPlans(argv[1] ?? DEFAULT_REF)
    writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2) + '\n')
    console.log(`[plans-contract] wrote ${SNAPSHOT_PATH} from ${snapshot.source.ref} (${snapshot.source.commit.slice(0, 7)})`)
    return 0
  }
  const snapshot = loadSnapshot()
  if (argv[0] === '--verify-snapshot') {
    const fresh = exportBackendPlans(snapshot.source.ref)
    const same = JSON.stringify(fresh.plans) === JSON.stringify(snapshot.plans)
    console.log(same
      ? `[plans-contract] snapshot matches ${fresh.source.ref} (${fresh.source.commit.slice(0, 7)})`
      : `[plans-contract] snapshot is stale against ${fresh.source.ref}: run --update`)
    return same ? 0 : 1
  }
  const errors = checkPlansContract(snapshot, siteFromSources())
  if (errors.length) {
    console.error(`[plans-contract] ${errors.length} mismatch(es) with tenants/plans.py @ ${snapshot.source.commit.slice(0, 7)}:`)
    for (const e of errors) console.error(`  - ${e}`)
    return 1
  }
  console.log(`[plans-contract] OK: site plans match tenants/plans.py @ ${snapshot.source.commit.slice(0, 7)}`)
  return 0
}

const isDirectRun = Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirectRun) process.exit(main(process.argv.slice(2)))
