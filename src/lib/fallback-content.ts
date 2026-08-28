/**
 * Fallback content shared by the rendered pages and the AI/AEO text routes
 * (`/llms.txt`, `/llms-full.txt`).
 *
 * These routes and the pages must agree on what the site says when no Sanity
 * project is configured — otherwise the AEO endpoints advertise a nearly
 * empty site while the pages render a full one. Content lives here once and
 * is imported by both.
 */

import { USSD_CODE } from '@/lib/site'

export type FaqDoc = {
  _id: string
  question: string
  /** Plain text for the fallback set; Portable Text blocks for real Sanity `faq` documents. */
  answer: string | ReadonlyArray<unknown>
  category?: string | null
}


export const FALLBACK_FAQS: FaqDoc[] = [
  {
    _id: 'mpesa-how',
    category: 'Giving',
    question: 'How does M-Pesa giving work with Shiriki?',
    answer:
      'Members can give via M-Pesa STK Push (a payment prompt sent straight to their phone) or your church\'s M-Pesa PayBill number. Every transaction is automatically matched to a member and giving category, and unmatched payments are held for an admin to resolve rather than rejected.',
  },
  {
    _id: 'mpesa-fees',
    category: 'Giving',
    question: 'Do you take a cut of M-Pesa giving?',
    answer:
      "No. Shiriki does not add a markup on top of Safaricom's standard M-Pesa transaction charges — your church receives the full contribution amount, minus only the standard telco fee.",
  },
  {
    _id: 'ussd-what',
    category: 'Giving',
    question: `What is the USSD code ${USSD_CODE} and who can use it?`,
    answer:
      'It is a giving channel that works on any phone, including feature phones with no internet or app. Members dial the code, select a giving category, and confirm with their M-Pesa PIN. An SMS receipt is sent immediately.',
  },
  {
    _id: 'airtel-card',
    category: 'Giving',
    question: 'Can members give with Airtel Money or a card?',
    answer:
      'Yes. Airtel Money is supported for Airtel subscribers, and card payments (via Paystack) are available for diaspora members giving in other currencies.',
  },
  {
    _id: 'security-data',
    category: 'Security',
    question: 'How is our members\' data kept secure?',
    answer:
      'Access is phone-OTP only — there are no passwords to leak or reuse. All data is encrypted in transit and at rest, admin sessions use short-lived rotating tokens, and every financial action is written to an immutable audit log.',
  },
  {
    _id: 'security-roles',
    category: 'Security',
    question: 'Can we limit what each admin or volunteer can see?',
    answer:
      'Yes. Shiriki ships with 7+ granular admin roles (for example: finance-only, membership-only, or event coordinator) so volunteers only ever see the data relevant to their responsibility.',
  },
  {
    _id: 'pricing-free',
    category: 'Pricing',
    question: 'Is there a free plan for small congregations?',
    answer:
      'Yes — the Starter plan is free forever for congregations up to 100 members, and includes M-Pesa STK Push giving, a member directory, and one admin login. See the pricing page for the full comparison.',
  },
  {
    _id: 'pricing-switch',
    category: 'Pricing',
    question: 'Can we change plans later?',
    answer:
      'You can upgrade, downgrade, or cancel at the end of any billing month. Your giving history, member records, and configuration always carry over — nothing is lost when you change plans.',
  },
  {
    _id: 'onboarding-time',
    category: 'Onboarding',
    question: 'How long does it take to get our church set up?',
    answer:
      'Most churches are live within a week. We help you import your member list (CSV, up to 5,000 records), configure your giving categories and M-Pesa PayBill, and train your admin team on a short onboarding call.',
  },
  {
    _id: 'onboarding-migration',
    category: 'Onboarding',
    question: 'We already track members in Excel or another system — can you migrate our data?',
    answer:
      'Yes. Send us your existing member spreadsheet and our team will help map and import it, so your congregation history and existing giving records aren\'t lost.',
  },
  {
    _id: 'offline-use',
    category: 'Reliability',
    question: 'What happens if our internet connection is unreliable on a Sunday?',
    answer:
      'Giving keeps working: the USSD channel needs no internet at all, and M-Pesa STK Push and PayBill payments are processed by Safaricom independent of your church\'s own connectivity. Admin dashboards sync automatically once connectivity returns.',
  },
  {
    _id: 'support-channels',
    category: 'Support',
    question: 'How do we reach support if something goes wrong?',
    answer:
      'Every plan includes email support with a one-business-day response time. Growth and Enterprise plans add phone and priority chat support, and Enterprise includes a dedicated account contact.',
  },
]
