# Shiriki — Deployment Runbook

## 1. Environment variables

Copy `.env.example` → `.env.local` for development, and set the same keys in
the Vercel project settings for Preview and Production.

| Variable | Scope | Required | Notes |
|---|---|:---:|---|
| `NEXT_PUBLIC_SITE_URL` | public | yes | Absolute production origin, no trailing slash. Drives canonical URLs, OG image URLs, sitemap, robots. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | public | no | Leave empty to run entirely on fallback content. |
| `NEXT_PUBLIC_SANITY_DATASET` | public | no | Defaults to `production`. |
| `NEXT_PUBLIC_SANITY_API_VERSION` | public | no | Pinned date string, e.g. `2026-08-01`. |
| `SANITY_API_WRITE_TOKEN` | **secret** | no | Editor token. Needed only for inquiry writes and the seed script. |
| `SANITY_REVALIDATE_SECRET` | **secret** | no | Shared secret for the Sanity webhook signature. |
| `RESEND_API_KEY` | **secret** | no | Missing key ⇒ email is skipped with a server-side warning; the lead is still stored. |
| `CONTACT_FROM_EMAIL` | secret | no | Must be on a Resend-verified domain. |
| `CONTACT_TO_EMAIL` | secret | no | Sales inbox. Defaults to `SALES_EMAIL` in `src/lib/site.ts`. |

> The app is designed to build and render with **none** of the optional
> variables set. Every data path has a typed fallback.

## 2. Sanity project setup

```bash
pnpm dlx sanity@latest login
pnpm dlx sanity@latest projects create "Shiriki"
# copy the project id into NEXT_PUBLIC_SANITY_PROJECT_ID
pnpm dlx sanity@latest dataset create production
```

Create an **Editor** token (Manage → API → Tokens) for `SANITY_API_WRITE_TOKEN`.

Add the deployed origins to Manage → API → CORS Origins (with credentials):
`http://localhost:3000`, the Vercel preview domain, and the production domain.

Then generate types and seed:

```bash
pnpm typegen   # regenerates src/sanity/types.ts from the real schema
pnpm seed      # idempotent — safe to re-run
```

## 3. Revalidation webhook

Sanity Manage → API → Webhooks → Create webhook:

- **URL:** `https://<your-domain>/api/revalidate`
- **Dataset:** `production`
- **Trigger on:** Create, Update, Delete
- **Filter:** `_type in ["siteSettings","homePage","aboutPage","pricingPage","legalPage","givingChannel","feature","testimonial","faq","post","author","category"]`
- **Projection:** `{_type, "slug": slug.current}`
- **HTTP method:** POST
- **API version:** match `NEXT_PUBLIC_SANITY_API_VERSION`
- **Secret:** the same value as `SANITY_REVALIDATE_SECRET`

## 4. Resend

1. Add and verify the sending domain (SPF + DKIM DNS records).
2. Create an API key with **Sending access** → `RESEND_API_KEY`.
3. Set `CONTACT_FROM_EMAIL` to an address on the verified domain.

## 5. DNS

| Record | Host | Value |
|---|---|---|
| A | `@` | `76.76.21.21` (Vercel apex) |
| CNAME | `www` | `cname.vercel-dns.com` |
| TXT | `@` | Resend SPF |
| CNAME | `resend._domainkey` | Resend DKIM |

## 6. Pre-launch checklist

- [ ] `pnpm lint && pnpm typecheck && pnpm build` all clean
- [ ] `NEXT_PUBLIC_SITE_URL` set to the real origin (canonical/OG depend on it)
- [ ] `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/llms.txt` all return 200
- [ ] Social preview verified (X card validator, LinkedIn post inspector)
- [ ] Contact and demo forms deliver to the sales inbox and create an `inquiry`
- [ ] `/studio` reachable and CORS-approved for the production origin
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 90
- [ ] Google Search Console + Bing Webmaster: property verified, sitemap submitted
