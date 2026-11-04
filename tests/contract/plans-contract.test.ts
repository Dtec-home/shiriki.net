/**
 * Contract: what shiriki.net sells on each plan ↔ what the backend's
 * `tenants/plans.py` turns on for that plan (sprint 2026-11 "Parity",
 * lane MKT-QA, story MKQ-1; decisions P-D3, P-D14, Q-3).
 *
 * Run with: `pnpm test:contract`
 *   (= `node --import tsx --test tests/contract/*.test.ts`)
 *
 * The backend is read through a checked-in snapshot,
 * `tests/contract/plans-snapshot.json`, so this runs without the backend repo.
 * Regenerate it after `tenants/plans.py` changes with:
 *   `pnpm exec tsx scripts/check-plans-contract.ts --update`
 * and `--verify-snapshot` checks the snapshot still equals the backend file.
 */

import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { describe, test } from 'node:test'

import {
  BACKEND_REPO,
  CONTRACT_FLAGS,
  checkPlansContract,
  exportBackendPlans,
  loadSnapshot,
  siteFromSources,
  type PlansSnapshot,
  type SitePlans,
} from '../../scripts/check-plans-contract'

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

describe('MKQ-1 plan bullets ↔ tenants/plans.py', () => {
  const snapshot = loadSnapshot()
  const site = siteFromSources()

  test('the snapshot covers the four tiers and every fundraising flag', () => {
    assert.deepEqual(
      snapshot.plans.map((p) => p.label),
      ['Msingi', 'Ukuaji', 'Kanisa', 'Shirikisho'],
    )
    const all = new Set(snapshot.plans.flatMap((p) => p.adds))
    for (const flag of CONTRACT_FLAGS) assert.ok(all.has(flag), `${flag} is in a tier of plans.py`)
  })

  test('the site matches the backend: no mismatches', () => {
    assert.deepEqual(checkPlansContract(snapshot, site), [])
  })

  test('fails when the backend moves a flag to another tier', () => {
    const moved = clone(snapshot)
    const kanisa = moved.plans.find((p) => p.code === 'KANISA')!
    const ukuaji = moved.plans.find((p) => p.code === 'UKUAJI')!
    kanisa.adds = kanisa.adds.filter((f) => f !== 'whatsapp_leaderboard')
    ukuaji.adds.push('whatsapp_leaderboard')
    const errors = checkPlansContract(moved, site)
    assert.ok(errors.some((e) => e.includes('whatsapp_leaderboard')), errors.join('\n'))
  })

  test('fails when the backend drops a fundraising flag from every tier', () => {
    const dropped = clone(snapshot)
    for (const p of dropped.plans) p.adds = p.adds.filter((f) => f !== 'pledge_module')
    const errors = checkPlansContract(dropped, site)
    assert.ok(errors.some((e) => e.includes('pledge_module')), errors.join('\n'))
  })

  test('fails when a site card lists a bullet on a cheaper plan', () => {
    const leaky: SitePlans = clone(site)
    const msingi = leaky.sources[0].plans.find((p) => p.name === 'Msingi')!
    msingi.features.push('Automatic WhatsApp group leaderboard')
    const errors = checkPlansContract(snapshot, leaky)
    assert.ok(errors.some((e) => e.includes('Msingi') && e.includes('WhatsApp')), errors.join('\n'))
  })

  test('fails when a site card is missing a bullet', () => {
    const missing: SitePlans = clone(site)
    const ukuaji = missing.sources[1].plans.find((p) => p.name === 'Ukuaji')!
    ukuaji.features = ukuaji.features.filter((f) => !f.startsWith('Fundraising champions'))
    const errors = checkPlansContract(snapshot, missing)
    assert.ok(errors.some((e) => e.includes('Ukuaji') && e.includes('champions')), errors.join('\n'))
  })

  test('fails when the bullet map names the wrong plan', () => {
    const wrong: SitePlans = clone(site)
    wrong.flagPlans.device_sign_in = 'Ukuaji'
    const errors = checkPlansContract(snapshot, wrong)
    assert.ok(errors.some((e) => e.includes('device_sign_in')), errors.join('\n'))
  })

  test('fails when the comparison table ticks a cheaper plan', () => {
    const ticked: SitePlans = clone(site)
    const row = ticked.comparison.find((r) => r.feature === 'Automatic WhatsApp group leaderboard')!
    row.values[1] = true
    const errors = checkPlansContract(snapshot, ticked)
    assert.ok(errors.some((e) => e.includes('comparison')), errors.join('\n'))
  })

  test('fails when a price or a member/SMS limit disagrees (Q-3)', () => {
    const pricier = clone(snapshot) as PlansSnapshot
    pricier.plans.find((p) => p.code === 'UKUAJI')!.priceKes = 4000
    assert.ok(checkPlansContract(pricier, site).some((e) => e.includes('price')))
    const bigger = clone(snapshot) as PlansSnapshot
    bigger.plans.find((p) => p.code === 'MSINGI')!.limits.members = 200
    assert.ok(checkPlansContract(bigger, site).some((e) => e.includes('members')))
  })

  const backendAvailable = existsSync(BACKEND_REPO) && Boolean(process.env.PLANS_CONTRACT_BACKEND !== 'skip')
  test(
    'the snapshot equals a fresh export of the backend file (local only)',
    { skip: backendAvailable ? false : 'backend repo not on this machine' },
    () => {
      const fresh = exportBackendPlans(snapshot.source.ref)
      assert.deepEqual(fresh.plans, snapshot.plans)
      assert.equal(fresh.source.blob, snapshot.source.blob)
    },
  )
})
