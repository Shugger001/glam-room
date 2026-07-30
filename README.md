# The Glam Room

Premium luxury hair and beauty salon website — Next.js 16, Supabase, Vercel.

## Local development

```bash
npm install
cp .env.example .env.local   # add Supabase keys
npm run dev
```

Open **http://127.0.0.1:3100**

## Database setup

Apply migrations in order via Supabase SQL Editor or CLI:

1. `supabase/migrations/00001_initial_schema.sql` through `00005_*`
2. `supabase/migrations/00006_glam_room_salon_schema.sql`
3. `supabase/migrations/00007_glam_room_seed_data.sql`

Grant admin access after signing up:

```sql
-- scripts/grant-admin.sql — replace with your email
```

**Front desk / shop staff logins:** In **CRM** (`/admin/customers`), use **Create staff login** — email, temporary password, and shop (Adenta / Sowutuom / Madina). Staff sign in at `/auth` and only see that shop’s board. Prefer this over promoting client accounts when possible.

Verify seed: **http://127.0.0.1:3100/api/deploy-proof** should show `"seeded": true`.

## Deploy on Vercel

1. Import [github.com/Shugger001/glam-room](https://github.com/Shugger001/glam-room)
2. Add environment variables from `.env.example`
3. Set `NEXT_PUBLIC_APP_URL` to your production domain
4. Set `CRON_SECRET` for appointment reminders
5. Deploy

Cron runs **once daily** (08:00 UTC) on Vercel Hobby. Upgrade to Pro for hourly reminders.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server + opens browser |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright critical-path smoke (book + admin) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run deploy:vercel` | Deploy to Vercel production |

### E2E notes

- Public tests (home + book) run against the local app (`127.0.0.1:3100`) and mock Paystack initialize so no real charge happens.
- Admin login / attendance tests **skip** unless you set `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` (staff or super-admin account). Prefer a dedicated test login.
- Point at a running server with `PLAYWRIGHT_BASE_URL=https://…` if you do not want Playwright to start `npm run dev:server`.
