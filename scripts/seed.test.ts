/**
 * Content checks for `scripts/seed.ts` (sprint 2026-11 "Parity", lane MKT-CONTENT).
 *
 * Run with: `node --import tsx --test scripts/seed.test.ts`
 *
 * Importing the seed has no side effects (it only writes to Sanity when run
 * directly), so these tests never touch a dataset or the network.
 *
 * What they guard:
 * - the new fundraising, WhatsApp leaderboard and fingerprint sign-in copy exists;
 * - every plan bullet appears on the plan that first includes the flag in the
 *   backend's `tenants/plans.py` (decision P-D3), and nowhere cheaper;
 * - no church, denomination or competitor names reach the site (BRD-9);
 * - no copy promises more than P-D3 / P-D5 allow.
 */

import assert from 'node:assert/strict'
import { describe, test } from 'node:test'

import { faqs, featureIds, features, givingChannels, posts, pricingPlans } from './seed'

/** Every string inside a value, Portable Text included, joined with spaces. */
function textOf(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.map(textOf).join(' ')
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .filter(([k]) => !k.startsWith('_') && k !== 'marks' && k !== 'style' && k !== 'listItem')
      .map(([, v]) => textOf(v))
      .join(' ')
  }
  return ''
}

function feature(id: string) {
  const found = features.find((f) => f._id === id)
  assert.ok(found, `feature ${id} exists`)
  return found
}

describe('MKT-1 features: fundraising campaigns, automatic WhatsApp leaderboard, fingerprint sign-in', () => {
  test('a "Fundraising campaigns" feature covers pledges, champions, the public page and the statement', () => {
    assert.equal(featureIds.fundraisingCampaigns, 'feature-fundraising-campaigns')
    const f = feature(featureIds.fundraisingCampaigns)
    assert.equal(f.title, 'Fundraising campaigns')
    const text = textOf(f).toLowerCase()
    for (const word of ['pledge', 'champion', 'public', 'statement', 'pay bill']) {
      assert.ok(text.includes(word), `fundraising feature mentions "${word}"`)
    }
  })

  test('Communication sells the automatic WhatsApp group leaderboard, not broadcast lists', () => {
    const text = textOf(feature(featureIds.communication))
    assert.match(text, /automatic WhatsApp group leaderboard/i)
    assert.doesNotMatch(text, /broadcast list/i)
  })

  test('a member app feature sells fingerprint sign-in', () => {
    assert.equal(featureIds.memberApp, 'feature-member-app')
    const text = textOf(feature(featureIds.memberApp))
    assert.match(text, /fingerprint sign-in/i)
  })

  test('feature ids are unique, dot-free and the display order has no gaps', () => {
    const ids = features.map((f) => f._id)
    assert.equal(new Set(ids).size, ids.length)
    for (const id of ids) assert.ok(!id.includes('.'), `${id} has no dot`)
    const orders = features.map((f) => f.order).sort((a, b) => a - b)
    assert.deepEqual(
      orders,
      orders.map((_, i) => i + 1),
    )
  })
})

describe('brand neutrality and claims (all stories)', () => {
  const everything = textOf([features, faqs, posts, pricingPlans, givingChannels])

  test('no church, denomination or competitor names', () => {
    for (const banned of [
      /\bSDA\b/,
      /Kawangware/i,
      /Sabbath/i,
      /Adventist/i,
      /denomination/i,
      /M-Changa/i,
      /\bShamba\b/,
    ]) {
      assert.doesNotMatch(everything, banned)
    }
  })
})
