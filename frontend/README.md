
# Smart Prospect Frontend

React/Vite frontend for the Smart Prospect MVP. It talks to Supabase for auth/data and to Supabase Edge Functions for Stripe-powered credit purchases.

## Voraussetzungen

- Node.js 18+
- Supabase Project (Auth, Database, Storage)
- Stripe Account (Standard Checkout, Webhooks)
- n8n Workflows für Generierung/Dispatch (optional lokal)

## Environment Variablen

Lege im Projektroot eine `.env.local` an (nicht commiten). Beispiel:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key-here
APP_URL=https://smartprospect.onrender.com
SUPABASE_DB_PASSWORD=postgres-password

N8N_WEBHOOK_URL_GENERATE=https://n8n.example.com/webhook/generate
N8N_WEBHOOK_URL_DISPATCH=https://n8n.example.com/webhook/dispatch

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_CREDITS_50=price_xxx
STRIPE_PRICE_ID_CREDITS_100=price_xxx
STRIPE_PRICE_ID_CREDITS_200=price_xxx

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_APP_URL=https://smartprospect.onrender.com
VITE_DEMO_OWNER_ID=00000000-0000-0000-0000-000000000000
```

> `SUPABASE_*`, `APP_URL`, `N8N_*` und `STRIPE_*` werden für Edge Functions benötigt. `VITE_*` Variablen sind fürs Frontend und dürfen keine Secrets enthalten.

> `SUPABASE_DB_PASSWORD` ist optional, aber praktisch: das Deploy-Skript kann damit `supabase link` ohne Rückfrage ausführen.

## Setup Schritte

1. **Dependencies**  
   ```bash
   cd frontend
   npm install
   ```

2. **Supabase Schema**  
   ```
   supabase db push --file supabase/schema/001_init.sql
   ```
   (vorher Backup machen, da das Skript Tabellen droppt.)

3. **Edge Functions deployen**
   ```bash
   # aus dem Repository-Root
   supabase login                  # einmalig in der CLI einloggen (öffnet Browser)
   ./deploy-functions.sh          # ruft supabase functions deploy für alle benötigten Functions auf
   ```

4. **Secrets in Supabase setzen**  
   Dashboard → Project Settings → Edge Functions → Secrets: alle Werte aus `.env.local` hinterlegen (`APP_URL`, `N8N_*`, `STRIPE_*`, `SUPABASE_SERVICE_ROLE_KEY`, Price-IDs).

5. **Stripe Webhook**  
   In Stripe Dashboard einen Endpoint auf `https://<project>.functions.supabase.co/stripe-webhook` mit dem Secret aus `.env.local` registrieren (`checkout.session.completed` aktivieren).

6. **n8n Webhooks**  
   Sicherstellen, dass die URLs aus `.env.local` erreichbar sind oder Platzhalter verwenden.

7. **Lokale Entwicklung**  
   ```bash
   npm run dev
   ```
   Frontend läuft auf `http://localhost:5173`.

## QA / Smoke-Test

- Magic-Link-Login → Dashboard Credits prüfen (50 Startcredits).
- Kampagne anlegen → Credits müssen um `49 + Prospects` sinken.
- `Credits kaufen` → Stripe Checkout durchlaufen → Rückkehr zur App → Credits steigen laut Bundle.
- Heygen-/Gamma-Embeds in Kampagnen-Preview kontrollieren.

## Deployment Hinweise

- PROD `.env` Werte im Render/Supabase Projekt hinterlegen (keine Secrets commiten).
- Nach Env-Änderungen Edge Functions neu deployen.
- Stripe Price-IDs können erweitert werden; Mapping sitzt in `supabase/functions/create-checkout-session/index.ts`.

  
