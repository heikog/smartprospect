## SmartProspect – Next.js Frontend

Marketing landing page + in-app dashboard for SmartProspect. Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**, then deployed to Render alongside the existing n8n + Stripe + Supabase services.

### Tech stack
- Next.js 14 (App Router) + React 18
- TailwindCSS 3.4 with shadcn-style UI primitives under `src/components/ui`
- Radix UI primitives for dialog, tabs, select, etc.

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
Render already stores the secrets below; mirror them in a local `.env.local` if you need to hit real services:

```
NBM_WEBHOOK_URL_DISPATCH=
NBM_WEBHOOK_URL_GENERATE=
STRIPE_PRICE_ID_CREDITS_100=
STRIPE_PRICE_ID_CREDITS_200=
STRIPE_PRICE_ID_CREDITS_50=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_URL=
```

### Project structure
- `src/app/page.tsx` – marketing landing page
- `src/app/dashboard/page.tsx` – authenticated dashboard surface
- `src/components/dashboard/*` – campaign creation, review dialog, assets preview, etc.
- `src/components/ui/*` – shadcn-inspired reusable primitives (Button, Card, Tabs, Dialog …)

### Deployment
Render service `smartprospect` (manual deploy) builds this package with `npm install && npm run build`. Ensure env vars (above) are set in the Render dashboard before triggering a deploy.
