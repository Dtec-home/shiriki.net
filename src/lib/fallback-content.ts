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
    _id: 'fundraising-campaigns',
    category: 'Fundraising',
    question: 'Can we run fundraising campaigns and harambees on Shiriki?',
    answer:
      'Yes, on the Ukuaji plan and above. Give each drive — a building fund, a land purchase, a harambee, a mission trip — a target, optional dates, a department, and a short Pay Bill account code such as BUILD. Once a second person approves it, members give with your church’s own Pay Bill and that code, by M-Pesa prompt from the campaign page, through USSD, or at the desk, and every gift counts towards one progress bar. Each campaign gets a shareable public page on your church’s own Shiriki address with progress, updates, and a give button, plus a statement of money in and money out for the board. There is no limit on the number of campaigns.',
  },
  {
    _id: 'fundraising-pledges',
    category: 'Fundraising',
    question: 'How do pledges get paid off?',
    answer:
      'Automatically. Members pledge in the app, on the campaign page, through USSD, or on a pledge card at the desk. When a gift arrives, Shiriki applies it to that member’s open pledges oldest first — and only money given after the pledge was made can clear it, so old giving never makes a new promise look kept. Members see what they still owe and can pay the balance in one tap. Reminder SMS are optional, are sent only between 8am and 8pm, and draw from your church’s SMS credits.',
  },
  {
    _id: 'whatsapp-leaderboard',
    category: 'Fundraising',
    question: 'How does the automatic WhatsApp group leaderboard work?',
    answer:
      'On the Kanisa plan and above, a church admin links your church’s own WhatsApp number by scanning a QR code in Settings, then picks the group for each campaign. After gifts come in, Shiriki posts an updated leaderboard to that group — gathered into one post about every minute, so a busy service does not flood the chat. If a post fails it is retried, never sent twice, and the campaign page shows whether the last one went out. Your church chooses how givers appear: full name, first name and initial (the default), or hidden with totals only. Any member can also choose to be listed as “Well-wisher”.',
  },
  {
    _id: 'donor-names',
    category: 'Fundraising',
    question: 'Who can see donor names?',
    answer:
      'Public campaign pages show totals only — amount raised, number of givers, days left — never names or amounts. Names are visible to your church staff and the department’s leaders, and each champion sees the people who gave through their own code. In WhatsApp leaderboards, names follow your church’s setting and each member’s own choice to stay anonymous.',
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
    _id: 'fingerprint-sign-in',
    category: 'Security',
    question: 'How does fingerprint sign-in on the Shiriki app work?',
    answer:
      'The first time a member signs in, they confirm their phone with an SMS code. After that, the app creates a sign-in key that is locked inside the phone’s own security hardware, and a fingerprint is all it takes — no SMS code every week. The key never leaves the phone and cannot be copied to another device. The app locks after 5 minutes away, amounts are hidden in the app switcher, and members can see and sign out their other phones themselves. Fingerprint sign-in is included in every plan.',
  },
  {
    _id: 'pricing-free',
    category: 'Pricing',
    question: 'Is there a free trial?',
    answer:
      'Yes. Every church starts with a 30-day free trial on the Msingi plan — M-Pesa STK Push giving, USSD giving, a member directory, attendance tracking, and 100 SMS included. After the trial, Msingi is KES 2,000 per month. See the pricing page for the full comparison.',
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
      'Msingi includes community support. Ukuaji and Kanisa add priority support, with an onboarding call on Kanisa, and Shirikisho includes a dedicated account manager and an SLA. Our team helps in English and Swahili by phone, WhatsApp, and email.',
  },
]
