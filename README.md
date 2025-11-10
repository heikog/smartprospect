# Smart Prospect MVP

Next.js 16 + Supabase + Stripe Implementation des Smart Prospect Fachkonzepts. Funktionen:

- Supabase Magic-Link Auth (5 Credits Startguthaben via DB-Trigger)
- Kampagnen-Upload (Excel/CSV + Service-PDF) inkl. Credit-Abzug & Upload in Supabase Storage
- n8n-Orchestrierung mit getrennten Workflows für Generierung und Versand, inkl. Callback-Endpoints
- Stripe Checkout für Credits (5/50/500) + Webhook → `apply_checkout_credit`
- Öffentliche Prospect-Landingpage unter `/p/{campaignId}/{prospectId}?t={uuid}`

## Lokales Setup

```bash
npm install
npm run dev
```

Projekt läuft standardmäßig auf `http://localhost:3000`.

## Environment Variablen (`.env.local`)

| Variable | Beschreibung |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key (für Storage Uploads & Callbacks) |
| `SUPABASE_STORAGE_BUCKET_UPLOADS` | Bucket für Excel/PDF Uploads (Standard `uploads`) |
| `SUPABASE_STORAGE_BUCKET_STATIC` | Bucket für statische Files (Excel Vorlage) |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Keys |
| `STRIPE_WEBHOOK_SECRET` | Signing Secret für `/api/webhooks/stripe` |
| `STRIPE_PRICE_CREDITS_{5,50,500}` | Price IDs für Checkout |
| `APP_BASE_URL` | Öffentliche Basis-URL (Render) |
| `EXCEL_TEMPLATE_URL` | Öffentlicher Link zur Pflicht-Vorlage |
| `N8N_*` | Webhook URLs & Callback-Ziele für beide Workflows |
| `N8N_SHARED_SECRET` (optional) | Shared Secret Header zur Absicherung der Callbacks |
| `STRIPE_WEBHOOK_HANDLER_URL` | Vollständige URL des Stripe Webhooks (Info für Stripe Dashboard) |

Beispiel siehe `.env.local` (nicht eingecheckt).

## Supabase Schema

Alle Tabellen, Trigger und Funktionen sind in `schema.sql` enthalten. Nach Änderungen erneut im Supabase SQL Editor ausführen. Zuletzt ergänzt:

- `campaign_prospects.tracking_token` für öffentliche Landingpages
- `drop trigger if exists on_auth_user_created` vor Trigger-Neuanlage

## Stripe

`/api/billing/checkout` erstellt Sessions mit Metadaten (`user_id`, `price_id`, `credit_quantity`). Webhook `/api/webhooks/stripe` validiert Signatur, persistiert Events in `stripe_webhook_events` und ruft `apply_checkout_credit` auf.

## n8n Workflows

- Workflow #1 (Generierung) → POST `env.N8N_GENERATION_WEBHOOK_URL`
  - Payload (Beispiel): `{ campaignId, excelPath, servicePdfPath, callbackUrl }`
  - Callback `POST /api/callback/n8n/generation` muss `campaignId`, `status` und optional `prospects[]` liefern.
- Workflow #2 (Versand) → POST `env.N8N_SEND_WEBHOOK_URL`
  - Callback `POST /api/callback/n8n/send`

Beide Callbacks akzeptieren optionalen Shared-Secret-Header (`env.N8N_AUTH_HEADER`).

## Development Notes

- Geschützte Routen (`/dashboard`, `/campaigns/**`) laufen über Supabase Session Middleware.
- Upload & Parsing passiert serverseitig (`/api/campaigns`): CSV/XLSX werden geprüft, row_count steuert Credit-Abzug.
- Landingpage `/p/[campaignId]/[prospectId]` verwendet den `tracking_token` als `t` Query-Parameter.
- UI-Komponenten sind im Verzeichnis `src/components` gekapselt (Auth, Dashboard, Layout, UI).

## Scripts

| Command | Beschreibung |
| --- | --- |
| `npm run dev` | Next.js Dev Server |
| `npm run build` | Production Build |
| `npm run start` | Startet Build im Production-Modus |
| `npm run lint` | ESLint |

## Deployment

1. Supabase: `schema.sql` ausführen, Storage-Buckets (`uploads`, `static`) erstellen, RLS aktivieren.
2. Render: neues Web Service aus diesem Repo, `.env.local` Werte importieren.
3. Stripe: Webhook Endpoint auf `APP_BASE_URL/api/webhooks/stripe` setzen.
4. n8n: Workflows mit oben genannten URLs/Secrets konfigurieren.
