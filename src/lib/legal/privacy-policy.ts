/**
 * The Shiriki privacy policy, as Portable Text.
 *
 * One source for two consumers: `scripts/seed.ts` writes it to the
 * `legal-privacy` Sanity document, and `/privacy` renders it directly when
 * Sanity is unreachable or unconfigured. Keeping it here stops the seeded copy
 * and the fallback copy drifting apart, which they had.
 *
 * Every claim below is traced to the platform code (the Shiriki backend,
 * web app and `app.shiriki.mobile` Android app). When the product changes
 * what it collects, who it shares with, or how long it keeps data, change
 * this file, bump `PRIVACY_POLICY_LAST_UPDATED`, and re-run `pnpm seed`.
 *
 * The "Deleting your account and data" heading renders with the anchor
 * `#deleting-your-account-and-data` (see the h2 renderer), which is the
 * account-deletion URL given to Google Play. Renaming the heading changes
 * that URL.
 */

import {
  APP_URL,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  DEVELOPER_NAME,
  ORGANIZATION_ADDRESS,
  SITE_URL,
  USSD_CODE,
} from '@/lib/site'

export const PRIVACY_POLICY_LAST_UPDATED = '2026-09-23'

/** Google Play's "Delete account URL" — see the module comment. */
export const ACCOUNT_DELETION_ANCHOR = 'deleting-your-account-and-data'

// ---------------------------------------------------------------------------
// Portable Text builders
// ---------------------------------------------------------------------------

// Keys are deterministic so re-seeding doesn't churn every block's `_key`.
let keyCounter = 0
function key(): string {
  keyCounter += 1
  return `pp${keyCounter.toString(36)}`
}

/** A run of text: plain, bold, or a link. */
type Part = string | { b: string } | { text: string; href: string }

function block(parts: Part[], style: 'normal' | 'h2' | 'h3' = 'normal', listItem?: 'bullet' | 'number') {
  const markDefs: { _type: 'link'; _key: string; href: string }[] = []
  const children = parts.map((part) => {
    if (typeof part === 'string') return { _type: 'span', _key: key(), text: part, marks: [] as string[] }
    if ('b' in part) return { _type: 'span', _key: key(), text: part.b, marks: ['strong'] }
    const linkKey = key()
    markDefs.push({ _type: 'link', _key: linkKey, href: part.href })
    return { _type: 'span', _key: key(), text: part.text, marks: [linkKey] }
  })
  return {
    _type: 'block',
    _key: key(),
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs,
    children,
  }
}

const p = (...parts: Part[]) => block(parts)
const h2 = (text: string) => block([text], 'h2')
const h3 = (text: string) => block([text], 'h3')
const bullets = (...items: Part[][]) => items.map((parts) => block(parts, 'normal', 'bullet'))
const steps = (...items: Part[][]) => items.map((parts) => block(parts, 'normal', 'number'))

const email = { text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` }
const siteHost = SITE_URL.replace(/^https?:\/\//, '')
const appHost = APP_URL.replace(/^https?:\/\//, '')
const address = `${ORGANIZATION_ADDRESS.streetAddress}, ${ORGANIZATION_ADDRESS.addressLocality}, Kenya`

// ---------------------------------------------------------------------------
// The policy
// ---------------------------------------------------------------------------

export const privacyPolicyBody = [
  p(
    `This Privacy Policy explains how ${DEVELOPER_NAME}, the developer of Shiriki (“${DEVELOPER_NAME}”, “we”, “us”), collects, uses, shares and protects personal information when you use the Shiriki church management platform. It covers:`,
  ),
  ...bullets(
    ['the Shiriki website at ', { text: siteHost, href: SITE_URL }, ';'],
    ['the Shiriki web app at ', { text: appHost, href: APP_URL }, ' and each church’s own Shiriki address;'],
    [
      'the ',
      { b: 'Shiriki' },
      ' mobile app for Android (package ',
      { b: 'app.shiriki.mobile' },
      `, published on Google Play by ${DEVELOPER_NAME}) and iOS;`,
    ],
    ['USSD giving on ', { b: USSD_CODE }, ' and giving by M-Pesa Paybill to a church that uses Shiriki.'],
  ),
  p(
    'In short: we collect what a church needs to run its membership, giving and communication; we use it only to provide that service; we do not sell it, we do not show ads, and we do not use it to track you across other apps or websites.',
  ),

  h2('1. Who is responsible for your information'),
  p(
    `Shiriki is developed and operated by ${DEVELOPER_NAME}, based in ${ORGANIZATION_ADDRESS.addressLocality}, Kenya.`,
  ),
  p(
    'Shiriki is used by churches. When a church uses Shiriki to keep its member register, record giving or send messages, ',
    { b: 'the church is the data controller' },
    ' of its members’ information — it decides what is recorded and why — and ',
    { b: `${DEVELOPER_NAME} is its data processor` },
    ', handling that information on the church’s instructions and for no other purpose.',
  ),
  p(
    `${DEVELOPER_NAME} is the data controller for the information we collect for our own purposes: church administrator accounts, subscription billing, website enquiries, and the security and technical data needed to run the platform.`,
  ),
  p('You can contact us about anything in this policy at ', email, '.'),

  h2('2. Information we collect'),
  h3('Sign-in and account information'),
  ...bullets(
    ['Your mobile phone number and, if you use it, your email address.'],
    [
      'One-time sign-in codes sent by SMS or email. Shiriki has no passwords for members: you sign in with a 6-digit code that expires after 10 minutes.',
    ],
    ['Your role in your church (for example member, treasurer, or administrator) and when you last signed in.'],
  ),
  h3('Member profile'),
  ...bullets(
    ['First and last name, member number, department and small groups.'],
    ['Department identifiers your church uses (for example a welfare number).'],
    ['A profile photo, only if you choose to add one.'],
    ['Date of birth, only if you or your church provide it.'],
  ),
  h3('Children and dependants'),
  p(
    'A parent or guardian can add their children to their household. For a child we record only first name, last name and date of birth. Children cannot sign in, have no phone number of their own in Shiriki, and any messages about them go to their parent or guardian. See section 11.',
  ),
  h3('Giving and payment information'),
  ...bullets(
    [
      { b: 'M-Pesa: ' },
      'the phone number you give from, the amount, the M-Pesa transaction code, and — for Paybill payments — the payer name that Safaricom returns with the payment.',
    ],
    [{ b: 'Airtel Money: ' }, 'the same kind of information, where your church has turned Airtel Money on.'],
    [
      { b: 'Card: ' },
      'card payments are handled by Paystack. We receive your email address, the amount, a payment reference and the result. We never see or store your full card number, expiry date or security code.',
    ],
    [{ b: 'USSD: ' }, 'your phone number, the steps of the USSD session and whether the gift completed.'],
    [
      { b: 'Your giving record: ' },
      'what you gave, when, to which fund or purpose, and the receipt issued. Cash gifts recorded by church officials are included.',
    ],
  ),
  p(
    'To match a Paybill payment to the right member, we compare a one-way cryptographic hash (SHA-256) of the paying phone number with the hashes of members’ numbers. When someone who is not yet a member gives, their gift is recorded against a guest giver record so the church can issue a receipt.',
  ),
  h3('Prayer requests'),
  p(
    'If you submit a prayer request, we store what you write, whether you asked for it to be anonymous, and who it is visible to (only you, the church’s prayer team, or the congregation). Prayer requests can reveal sensitive information such as religious beliefs or health. Please share only what you are comfortable with the audience you chose seeing.',
  ),
  h3('Events and messages'),
  ...bullets(
    ['Event registrations: your name and, optionally, your phone number.'],
    [
      'Messages your church sends you through Shiriki (SMS, email and push notifications), including the text sent and delivery status.',
    ],
  ),
  h3('Church staff and finance records'),
  p('Where a church uses these features, Shiriki also holds:'),
  ...bullets(
    ['for church employees: job title, employment dates, salary band, line manager and leave applications;'],
    [
      'for expenses and payouts: the payee’s name, phone number or bank account details, the amount, and any receipt the church uploads;',
    ],
    ['for church officials: a record of the financial actions they take (for example recording, approving or voiding).'],
  ),
  h3('Church accounts and billing'),
  p(
    'When a church signs up we collect the church’s name, address and contact email, its M-Pesa Paybill details, branding, and the IP address used at sign-up (to help us detect fraudulent sign-ups). For subscription billing, Paystack gives us a customer reference and the last four digits of the card used.',
  ),
  h3('Device and technical information'),
  ...bullets(
    [
      'A push notification token and your device platform (Android or iOS), so we can deliver notifications. It is removed when you sign out.',
    ],
    [
      'Crash and error reports: the device model, operating system, app version and technical details of the error. We configure these reports to exclude phone numbers.',
    ],
    ['Server logs: IP address, time of request and the action requested, used for security and troubleshooting.'],
  ),
  h3('Website visitors'),
  ...bullets(
    [
      'If you fill in our contact or demo form: your name, email, phone number, church name, country and message.',
    ],
    [
      'Anonymous page-view statistics through Vercel Web Analytics, which does not use cookies and does not identify you.',
    ],
    ['Your IP address, briefly and in memory only, to stop the forms being abused.'],
  ),

  h2('3. What we do not collect'),
  ...bullets(
    ['We do not access your location, contacts, camera, microphone, call logs or SMS inbox.'],
    ['We do not collect your advertising ID, show ads, or use advertising or cross-app tracking SDKs.'],
    ['We do not receive your M-Pesa PIN or your full card details.'],
    ['We never receive your fingerprint or face data (see section 4).'],
  ),

  h2('4. Mobile app permissions'),
  ...bullets(
    [{ b: 'Internet and network state: ' }, 'to connect to your church’s Shiriki account.'],
    [
      { b: 'Notifications: ' },
      'to deliver receipts, announcements and event reminders. On Android 13 and later we ask first, and you can turn notifications off at any time in your device settings.',
    ],
    [
      { b: 'Biometrics (optional): ' },
      'if you turn on fingerprint or face unlock, your device checks your biometric and only tells the app whether it matched. Your biometric data never leaves your device and is never sent to us.',
    ],
    [
      { b: 'Photos: ' },
      'when you add a profile photo, the system photo picker gives the app only the one image you choose. The app does not request access to your photo library or storage.',
    ],
    [{ b: 'Vibration and background work: ' }, 'to alert you to notifications and finish tasks reliably.'],
  ),

  h2('5. How we use information'),
  ...bullets(
    ['To sign you in and keep your account secure.'],
    [
      'To process gifts, match them to the right member, issue receipts and send payment confirmations.',
    ],
    [
      'To run your church’s member register, departments, groups, events, prayer requests and staff records, on the church’s instructions.',
    ],
    ['To send SMS, email and push messages that your church, or you, have asked us to send.'],
    [
      'To produce financial statements and reports for your church’s own accounting, governance and audit.',
    ],
    ['To bill churches for their subscription.'],
    ['To detect, investigate and prevent fraud, abuse and security incidents.'],
    ['To fix bugs and understand how the service is performing.'],
    ['To reply to enquiries sent through our website.'],
  ),
  p(
    'Under Kenya’s Data Protection Act, 2019 (and, where it applies, the GDPR), we rely on these legal bases: performing our contract with your church or with you; our legitimate interests in running a secure and reliable service; your consent, for optional things like a profile photo, prayer requests and notifications, which you can withdraw at any time; and legal obligations such as financial record-keeping.',
  ),
  p('We do not use your information for automated decisions that have legal or similarly significant effects on you.'),

  h2('6. Who we share information with'),
  p('We do not sell or rent personal information. We share it only as follows.'),
  ...bullets(
    [
      { b: 'Your church. ' },
      'Church officials see member and giving information according to the role the church gives them. For example, an official who records cash gifts cannot see givers’ M-Pesa phone numbers.',
    ],
    [
      { b: 'Service providers ' },
      'who process data on our behalf, only as needed to provide the service and under contractual confidentiality and security obligations:',
    ],
  ),
  ...bullets(
    ['Safaricom (M-Pesa Daraja) and Airtel Money — mobile-money payments;'],
    ['Paystack — card payments and church subscription billing;'],
    ['KCB Bank — payouts a church makes to suppliers and staff;'],
    ['SMS Leopard and our USSD gateway provider — SMS messages and USSD giving;'],
    ['SendGrid (Twilio) — email, including sign-in codes;'],
    ['Google Firebase Cloud Messaging — push notifications;'],
    ['Sentry — crash and error reporting;'],
    ['Cloudinary — storage of profile photos and uploaded files;'],
    ['Heroku (Salesforce) and Vercel — application hosting and databases;'],
    ['Sanity and Resend — our website’s content and its contact-form emails.'],
  ),
  ...bullets(
    [
      { b: 'Legal and safety. ' },
      'When required by law, court order or a lawful request from a public authority, or to protect the rights, property or safety of our users, churches or the public.',
    ],
    [
      { b: 'Business transfers. ' },
      `If ${DEVELOPER_NAME} is involved in a merger, acquisition or sale of assets, subject to this policy continuing to protect your information.`,
    ],
  ),

  h2('7. International transfers'),
  p(
    'Some of our service providers store or process data outside Kenya, including in the European Union and the United States. When we transfer personal data outside Kenya we do so in line with Part VI of the Data Protection Act, 2019, relying on contractual safeguards with those providers and on their security measures.',
  ),

  h2('8. How we protect information'),
  ...bullets(
    ['All traffic to Shiriki is encrypted with HTTPS (TLS), and browsers are told to use only secure connections.'],
    [
      'Sign-in uses one-time codes with limited attempts. Sessions use short-lived access tokens (30 minutes) and refresh tokens that are rotated and revoked when you sign out.',
    ],
    ['On Android, your sign-in tokens are kept in encrypted storage protected by the Android Keystore.'],
    [
      'Each church’s data is kept separate from every other church’s, and within a church, access is limited by role.',
    ],
    ['Sensitive financial and administrative actions are written to an audit log.'],
    [`Access to production systems is limited to authorised ${DEVELOPER_NAME} staff who need it.`],
  ),
  p(
    'No system is perfectly secure. If a personal data breach puts your rights at risk, we will notify the Office of the Data Protection Commissioner and, where required, the people affected, as the law requires.',
  ),

  h2('9. How long we keep information'),
  ...bullets(
    [
      { b: 'Member profiles ' },
      'are kept while you are a member of a church that uses Shiriki, until you or your church delete them.',
    ],
    [
      { b: 'Giving records and receipts ' },
      'are part of the church’s financial books. They are kept for as long as the church’s account exists and for as long as financial record-keeping laws require.',
    ],
    [{ b: 'Sign-in codes ' }, 'stop working after 10 minutes.'],
    [
      { b: 'Church accounts: ' },
      'when a church deletes its account, it has 30 days to change its mind. After that, the church and everything recorded under it are permanently deleted.',
    ],
    [
      { b: 'Website enquiries ' },
      'are kept for as long as we need to respond and follow up, and deleted sooner if you ask.',
    ],
    [
      { b: 'Backups: ' },
      'copies of deleted data can remain in encrypted backups until those backups expire on their normal rotation.',
    ],
  ),

  h2('Deleting your account and data'),
  p(
    'You can ask for your Shiriki account and personal data to be deleted at any time, whether or not you still have the app installed. Uninstalling the app does not delete your account.',
  ),
  ...steps(
    [
      'Email ',
      { text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}?subject=Delete%20my%20Shiriki%20account` },
      ' with the subject “Delete my Shiriki account”. Include the phone number you sign in with and the name of your church. You can also ask your church administrator to make the request for you.',
    ],
    ['We will confirm the request is yours by sending a code to that phone number.'],
    ['We will delete your account within 30 days and tell you when it is done.'],
  ),
  p({ b: 'What we delete: ' }, 'your sign-in account, your profile and photo, your push notification tokens, your prayer requests and event registrations, and the profiles of any dependants you added.'),
  p(
    { b: 'What we keep: ' },
    'the record of gifts you made (amount, date, fund and receipt number) is part of your church’s financial books, which the church is required to keep. We keep these records, with access restricted to the church’s finance officials, for as long as the law requires, and then delete them. We also keep audit-log entries needed to show that the church’s books have not been tampered with.',
  ),
  p(
    'Church administrators can delete an entire church account from the church’s settings. The deletion takes effect after the 30-day window described above.',
  ),

  h2('10. Your rights'),
  p('Under Kenya’s Data Protection Act, 2019, and, where it applies, the GDPR, you have the right to:'),
  ...bullets(
    ['be told how your personal data is used (this policy);'],
    ['access the personal data held about you;'],
    ['have inaccurate or incomplete data corrected;'],
    ['have your data deleted (see “Deleting your account and data”);'],
    ['object to, or ask us to restrict, processing;'],
    ['receive your data in a portable format;'],
    ['withdraw consent you have given, at any time.'],
  ),
  p(
    'You can view and correct much of your profile and download your receipts in the app. For anything else, contact your church administrator, or email us at ',
    email,
    '. Where your church is the controller, we will pass your request to it and help it respond. We respond within the time limits the law sets.',
  ),
  p(
    'If you are not satisfied with our response, you can complain to the Office of the Data Protection Commissioner (ODPC) in Kenya at ',
    { text: 'odpc.go.ke', href: 'https://www.odpc.go.ke' },
    ', or to the data protection authority where you live.',
  ),

  h2('11. Children'),
  p(
    'Shiriki is not directed at children, and you must be 18 or older to create a Shiriki account. Members under 18 are recorded only as dependants by a parent, guardian or church administrator, cannot sign in, and have no contact details of their own in Shiriki. A parent or guardian can view, correct or delete their child’s record at any time. If we learn that a child has created an account, we will delete it.',
  ),

  h2('12. Cookies and local storage'),
  ...bullets(
    [
      { b: 'Our website ' },
      'does not use advertising or tracking cookies. It remembers your light or dark theme in your browser’s local storage.',
    ],
    [
      { b: 'The web app ' },
      'stores your sign-in session in your browser (local storage and a session cookie) and keeps an offline copy of pages so the app works on poor connections. Signing out clears your session.',
    ],
    [
      { b: 'The mobile app ' },
      'stores your sign-in session in encrypted storage and keeps a local copy of your profile and giving history so you can view them offline.',
    ],
  ),

  h2('13. Links to other services'),
  p(
    'Shiriki links to services we do not control, such as M-Pesa, WhatsApp and YouTube. Their own privacy policies apply when you use them.',
  ),

  h2('14. Changes to this policy'),
  p(
    'We will update this policy when our practices change. The “Last updated” date at the top shows when it last changed. If a change materially affects how we use your personal data, we will tell you in the app or by email before it takes effect.',
  ),

  h2('15. Contact us'),
  p({ b: DEVELOPER_NAME }, ' (developer of Shiriki)'),
  ...bullets(
    ['Email: ', email],
    ['Phone and WhatsApp: ', { text: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, '')}` }],
    [`Address: ${address}`],
  ),
]
