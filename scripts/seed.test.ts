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

import { FALLBACK_FAQS } from '../src/lib/fallback-content'
import { FALLBACK_COMPARISON_ROWS, FALLBACK_PRICING_TIERS, PLAN_FLAG_BULLETS } from '../src/lib/pricing-plans'

import { categories, faqs, featureIds, features, givingChannelIds, givingChannels, planFlagBullets, posts, pricingPlans } from './seed'

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

describe('MKT-2 plan bullets follow P-D3 and tenants/plans.py', () => {
  /**
   * The tier each sprint-2026-11 flag is first included in, copied from the
   * backend's `tenants/plans.py` on `sprint/2026-11-parity` (239bcb7):
   * MSINGI_FLAGS, UKUAJI_ADDS, KANISA_ADDS. Tiers accumulate upwards.
   */
  const FIRST_PLAN: Record<string, string> = {
    device_sign_in: 'Msingi',
    giving_campaigns: 'Ukuaji',
    pledge_module: 'Ukuaji',
    campaign_public_pages: 'Ukuaji',
    fundraising_champions: 'Ukuaji',
    department_campaigns: 'Ukuaji',
    whatsapp_leaderboard: 'Kanisa',
  }
  const ORDER = ['Msingi', 'Ukuaji', 'Kanisa', 'Shirikisho']

  test('every new flag has a bullet on the plan that first includes it', () => {
    assert.deepEqual(Object.keys(planFlagBullets).sort(), Object.keys(FIRST_PLAN).sort())
    for (const [flag, { plan, bullet }] of Object.entries(planFlagBullets)) {
      assert.equal(plan, FIRST_PLAN[flag], `${flag} is sold on ${FIRST_PLAN[flag]}`)
      const p = pricingPlans.find((x) => x.name === plan)
      assert.ok(p?.features.includes(bullet), `${plan} lists "${bullet}"`)
    }
  })

  test('no cheaper plan claims a feature it does not include', () => {
    for (const { plan, bullet } of Object.values(planFlagBullets)) {
      for (const cheaper of ORDER.slice(0, ORDER.indexOf(plan))) {
        const p = pricingPlans.find((x) => x.name === cheaper)
        assert.ok(!textOf(p).includes(bullet), `${cheaper} does not list "${bullet}"`)
      }
    }
    const msingi = textOf(pricingPlans.find((x) => x.name === 'Msingi')).toLowerCase()
    for (const word of ['campaign', 'pledge', 'champion', 'leaderboard']) {
      assert.ok(!msingi.includes(word), `Msingi does not mention "${word}"`)
    }
    const ukuaji = textOf(pricingPlans.find((x) => x.name === 'Ukuaji')).toLowerCase()
    assert.ok(!ukuaji.includes('whatsapp'), 'Ukuaji does not mention WhatsApp')
  })

  test('prices are unchanged (Q-3)', () => {
    const prices = Object.fromEntries(pricingPlans.map((p) => [p.name, p.priceKES ?? null]))
    assert.deepEqual(prices, { Msingi: 2000, Ukuaji: 3500, Kanisa: 7500, Shirikisho: null })
  })

  test('the plan guide post says the same thing as the plan cards', () => {
    const post = posts.find((p) => p._id === 'post-choosing-the-right-plan')
    const text = textOf(post?.body)
    const ukuaji = text.slice(text.indexOf('Ukuaji: growth mode'), text.indexOf('Kanisa: the full church office'))
    const kanisa = text.slice(text.indexOf('Kanisa: the full church office'), text.indexOf('Shirikisho: the network'))
    assert.match(ukuaji, /fundraising campaigns/i)
    assert.doesNotMatch(ukuaji, /WhatsApp/)
    assert.match(kanisa, /automatic WhatsApp group leaderboard/i)
    assert.match(text, /fingerprint sign-in/i)
  })
})

describe('MKT-3 blog posts and FAQ entries', () => {
  const NEW_POSTS = [
    'post-run-a-harambee-on-shiriki',
    'post-whatsapp-group-leaderboards',
    'post-pledges-that-clear-themselves',
  ]
  const NEW_FAQS = [
    'faq-can-we-run-fundraising-campaigns-and-harambees-on-shiriki',
    'faq-how-do-pledges-get-paid-off',
    'faq-what-are-fundraising-champions',
    'faq-can-a-campaign-count-everything-a-department-has-ever-received',
    'faq-how-does-the-automatic-whatsapp-group-leaderboard-work',
    'faq-who-can-see-donor-names',
    'faq-how-does-fingerprint-sign-in-on-the-shiriki-app-work',
  ]
  const post = (id: string) => {
    const p = posts.find((x) => x._id === id)
    assert.ok(p, `post ${id} exists`)
    return p
  }
  const faq = (id: string) => {
    const f = faqs.find((x) => x._id === id)
    assert.ok(f, `faq ${id} exists`)
    return f
  }

  test('the three new posts exist with an excerpt, a body and a known category', () => {
    const categoryIds = new Set(categories.map((c) => c._id))
    for (const id of NEW_POSTS) {
      const p = post(id)
      assert.ok(p.excerpt.length > 60, `${id} has an excerpt`)
      assert.ok(p.body.length >= 8, `${id} has a real body`)
      for (const c of p.categories) assert.ok(categoryIds.has(c._ref), `${id} category ${c._ref} exists`)
      assert.ok(!Number.isNaN(Date.parse(p.publishedAt)), `${id} has a date`)
    }
    const slugs = posts.map((p) => p.slug.current)
    assert.equal(new Set(slugs).size, slugs.length)
  })

  test('the harambee post walks through code, approval, page, pledges, champions and close-out', () => {
    const text = textOf(post(NEW_POSTS[0]))
    for (const re of [/Pay Bill/, /second person|four-eyes/i, /public page/i, /pledge/i, /champion/i, /statement/i, /Ukuaji/]) {
      assert.match(text, re)
    }
  })

  test('the WhatsApp post is Kanisa-only, uses the church’s own number and honours the naming setting (P-D5)', () => {
    const text = textOf(post(NEW_POSTS[1]))
    assert.match(text, /Kanisa/)
    assert.match(text, /own (WhatsApp )?number/i)
    assert.match(text, /first name and initial/i)
    assert.match(text, /totals only/i)
    assert.match(text, /Well-wisher/)
    assert.doesNotMatch(text, /every donor is named/i)
  })

  test('the pledges post explains oldest-first and only-later-money clearing', () => {
    const text = textOf(post(NEW_POSTS[2]))
    assert.match(text, /oldest first/i)
    assert.match(text, /after the pledge/i)
    assert.match(text, /SMS credits/i)
  })

  test('the new FAQs exist, sold on the right plan', () => {
    for (const id of NEW_FAQS) faq(id)
    assert.match(textOf(faq(NEW_FAQS[0])), /Ukuaji/)
    assert.match(textOf(faq(NEW_FAQS[4])), /Kanisa/)
    assert.match(textOf(faq(NEW_FAQS[5])), /totals only/i)
    assert.match(textOf(faq(NEW_FAQS[6])), /every plan/i)
  })

  test('the mobile app FAQ mentions fingerprint sign-in', () => {
    assert.match(textOf(faq('faq-is-there-a-shiriki-mobile-app')), /fingerprint/i)
  })

  test('FAQ ids are unique and the display order has no gaps', () => {
    const ids = faqs.map((f) => f._id)
    assert.equal(new Set(ids).size, ids.length)
    assert.deepEqual(
      faqs.map((f) => f.order),
      faqs.map((_, i) => i + 1),
    )
  })
})

describe('MKT-4 giving channels mention campaign codes on Pay Bill and USSD', () => {
  const channel = (id: string) => {
    const c = givingChannels.find((x) => x._id === id)
    assert.ok(c, `channel ${id} exists`)
    return textOf(c)
  }

  test('Pay Bill explains campaign and champion account codes', () => {
    const text = channel(givingChannelIds.mpesaPaybill)
    assert.match(text, /campaign/i)
    assert.match(text, /BUILD/)
    assert.match(text, /champion/i)
  })

  test('USSD offers campaigns and pledges', () => {
    const text = channel(givingChannelIds.ussd)
    assert.match(text, /campaign/i)
    assert.match(text, /pledge/i)
  })

  test('channel ids are unchanged', () => {
    assert.deepEqual(givingChannels.map((c) => c._id).sort(), Object.values(givingChannelIds).sort())
  })
})

describe('follow-up: the built-in pricing (no Sanity) matches the seed', () => {
  const ORDER = ['Msingi', 'Ukuaji', 'Kanisa', 'Shirikisho']
  const newBullets = new Set(Object.values(planFlagBullets).map((b) => b.bullet as string))

  test('seed and fallback read the plan bullets from one shared module', () => {
    assert.equal(planFlagBullets, PLAN_FLAG_BULLETS)
  })

  test('each fallback tier lists the same sprint bullets as the seed plan', () => {
    for (const plan of pricingPlans) {
      const tier = FALLBACK_PRICING_TIERS.find((t) => t.name === plan.name)
      assert.ok(tier, `fallback tier ${plan.name} exists`)
      const fromSeed = plan.features.filter((f: string) => newBullets.has(f))
      const fromFallback = tier.features.filter((f) => newBullets.has(f))
      assert.deepEqual(fromFallback, fromSeed, `${plan.name} bullets match`)
    }
  })

  test('the comparison table ticks each sprint feature from its first plan upwards', () => {
    for (const { plan, bullet } of Object.values(planFlagBullets)) {
      const row = FALLBACK_COMPARISON_ROWS.find((r) => r.feature === bullet)
      assert.ok(row, `comparison row "${bullet}" exists`)
      assert.deepEqual(
        row.values,
        ORDER.map((_, i) => i >= ORDER.indexOf(plan)),
      )
    }
  })
})

describe('follow-up: built-in FAQs (no Sanity) carry the new topics and no stale plans', () => {
  /** Fallback FAQ id → the seed FAQ it must say the same as. */
  const MIRRORS: Record<string, string> = {
    'fundraising-campaigns': 'faq-can-we-run-fundraising-campaigns-and-harambees-on-shiriki',
    'fundraising-pledges': 'faq-how-do-pledges-get-paid-off',
    'whatsapp-leaderboard': 'faq-how-does-the-automatic-whatsapp-group-leaderboard-work',
    'donor-names': 'faq-who-can-see-donor-names',
    'fingerprint-sign-in': 'faq-how-does-fingerprint-sign-in-on-the-shiriki-app-work',
  }

  test('each new fallback FAQ says exactly what the seed FAQ says', () => {
    for (const [fallbackId, seedId] of Object.entries(MIRRORS)) {
      const fb = FALLBACK_FAQS.find((f) => f._id === fallbackId)
      const seed = faqs.find((f) => f._id === seedId)
      assert.ok(fb, `fallback FAQ ${fallbackId} exists`)
      assert.ok(seed, `seed FAQ ${seedId} exists`)
      assert.equal(fb.question, seed.question)
      const plain = (seed.answer as { children: { text: string }[] }[])
        .map((b) => b.children.map((c) => c.text).join(''))
        .join(' ')
      assert.equal(fb.answer, plain)
    }
  })

  test('no retired plan names or free-forever promises', () => {
    const text = textOf(FALLBACK_FAQS)
    for (const stale of [/free forever/i, /\bStarter\b/, /\bGrowth\b/, /\bEnterprise\b/, /up to 100 members/i]) {
      assert.doesNotMatch(text, stale)
    }
    assert.match(textOf(FALLBACK_FAQS.find((f) => f._id === 'pricing-free')), /30-day free trial/)
  })
})
