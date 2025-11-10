## SmartProspect – Next.js Frontend

Marketing landing page + in-app dashboard for SmartProspect. Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**, then deployed to Render alongside the existing n8n + Stripe + Supabase services.

### Tech stack
- Next.js 14 (App Router) + React 18
- Supabase (Auth + Postgres + Storage) via RLS-secured schema (`supabase/schema.sql`)
- Credit- und Kampagnen-Storage über Buckets + `credit_transactions` Tabelle
- TailwindCSS 3.4 mit shadcn-style UI unter `src/components/ui`
- Radix UI primitives für Dialoge, Tabs, Select, etc.

### Local development
```bash
cd smartprospect-next
npm install
npm run dev
```
Visit `http://localhost:3000` for the marketing site and `http://localhost:3000/dashboard` for the in-app experience.

### Quality checks
```bash
npm run lint   # ESLint (Next.js config)
```
Add additional tests or Playwright flows under `npm run test` when we introduce them.

### Environment variables
Add these to Render (and `.env.local` for local dev):

```
NEXT_PUBLIC_SITE_URL=https://smartprospect.onrender.com
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NBM_WEBHOOK_URL_GENERATE=https://n8n.example.com/webhook/start
NBM_WEBHOOK_URL_DISPATCH=https://n8n.example.com/webhook/dispatch
N8N_CALLBACK_SECRET=shared-secret-string

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_CREDITS_50=price_xxx
STRIPE_PRICE_ID_CREDITS_100=price_xxx
STRIPE_PRICE_ID_CREDITS_200=price_xxx
```

> For local testing define `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and expose the Stripe webhook via `stripe listen`.

### Supabase schema & storage

Run `supabase/schema.sql` in your Supabase project (SQL Editor). It creates:

- `profiles`, `campaigns`, `prospects`, `credit_transactions` (inkl. RLS)
- helper functions (`spend_credits`, `add_credits_to_user`, `deduct_credits_from_user`)
- storage buckets:
  - `campaign-uploads/{user_id}/{campaign_id}/source.*`
  - `generated-assets/{user_id}/{campaign_id}/prospect_id/*`

Users upload Excel/PDFs directly into `campaign-uploads`. n8n writes finished assets into `generated-assets`. RLS ensures each user nur den eigenen Prefix liest/schreibt. `credit_transactions` speichert jede Stripe-Aufladung und jeden Kampagnenverbrauch → UI zeigt das in `/account` an.

- `supabase/schema.sql` – full database/storage setup inkl. credit transactions
- `src/app/page.tsx` – Marketing-Landingpage mit Pricing, FAQ, Magic Link
- `src/app/dashboard/page.tsx` – authenticated dashboard surface + Stripe Feedback
- `src/app/account/page.tsx` – Profilverwaltung, Credits-Historie, Account löschen
- `src/app/api/*` – Kampagnen CRUD, Export, Stripe Checkout/Webhooks, n8n callbacks, Account delete
- `src/components/dashboard/*` – Kampagnen, Credits, Timeline, CSV Export
- `src/components/ui/*` – shadcn-inspired reusable primitives

### Stripe checkout & webhook

`POST /api/billing/checkout` creates a Checkout Session for 50/100/200 credits. The webhook (`/api/webhooks/stripe`) credits the user via `add_credits_to_user` **and** schreibt einen Eintrag in `credit_transactions`. Configure the webhook endpoint in Stripe to point to `https://smartprospect.onrender.com/api/webhooks/stripe`.

### n8n workflow contract

**Generation webhook** (`NBM_WEBHOOK_URL_GENERATE`) receives:
```json
{
  "campaign_id": "uuid",
  "user_id": "uuid",
  "campaign_name": "Q1 Tech",
  "files": {
    "excel_signed_url": "https://...",
    "pdf_signed_url": "https://..."
  },
  "callback": {
    "url": "https://smartprospect.onrender.com/api/webhooks/n8n",
    "secret": "N8N_CALLBACK_SECRET"
  }
}
```

n8n downloads the files, generates assets, uploads them into `generated-assets/{user_id}/{campaign_id}/...`, and then calls the callback with:

```json
{
  "campaign_id": "uuid",
  "status": "review",
  "prospect_count": 47,
  "prospects": [
    {
      "id": "uuid",
      "company_name": "Tech GmbH",
      "contact": {"name": "Max Mustermann", "email": "max@example.com"},
      "landing_page_url": "https://...",
      "video_url": "https://...",
      "audio_url": "https://...",
      "presentation_url": "https://...",
      "flyer_url": "https://..."
    }
  ],
  "additional_credit_charge": 47
}
```

`additional_credit_charge` is optional; if present, the API deducts those credits via `deduct_credits_from_user` **und** schreibt einen `credit_transactions`-Eintrag.

When the customer clicks “Versand starten”, `/api/campaigns/:id/dispatch` invokes `NBM_WEBHOOK_URL_DISPATCH` with `{ campaign_id, user_id, name }`.

### Deployment
Render service `smartprospect` (manual deploy) builds this package with `npm install && npm run build`. Ensure env vars (above) are set in the Render dashboard before triggering a deploy.
