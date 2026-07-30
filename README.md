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

Apply **all** SQL files in `supabase/migrations/` in filename order (Supabase CLI: `supabase db push`, or paste each file in the SQL Editor).

Current chain:

| File | Purpose |
|------|---------|
| `00001`–`00005` | Core schema, GHS, audit, Paystack ledger, loyalty |
| `00006`–`00007` | Salon schema + seed |
| `00008`–`00013` | Content sync, booking lookup, staff location, Paystack ref, media, reviews |
| `00040` | Arrived / no-show booking statuses |
| `00041` | Staff shift clock-in / clock-out |
| `00042` | Front desk seats + home shop |
| `00043` | Madina nails / makeup |
| `00044` | Instagram handle fix |

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
5. Confirm Paystack webhook → `https://your-domain/api/paystack/webhook`
6. Apply any new migrations that aren’t on the production Supabase project yet
7. (Recommended) Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` for durable API rate limits
8. (Optional) `SENTRY_DSN` for server exception capture
9. Deploy

Cron runs **once daily** (08:00 UTC) on Vercel Hobby. Upgrade to Pro for hourly reminders.

### Production checklist

- [ ] All migrations through latest `00044_*` applied
- [ ] Paystack live keys + webhook signature working (deposit → confirmed)
- [ ] `CRON_SECRET` matches Vercel cron header
- [ ] Upstash Redis set (or accept in-memory rate limits)
- [ ] Smoke: home, `/book`, `/auth`, admin appointments + attendance

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server + opens browser |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) — payment match / auto-confirm |
| `npm run test:e2e` | Playwright critical-path smoke (book + admin) |
| `npm run test:e2e:public` | Public-only E2E (home + book) — used in CI when enabled |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run deploy:vercel` | Deploy to Vercel production |

### E2E notes

- Public tests (home + book) run against the local app (`127.0.0.1:3100`) and mock Paystack initialize so no real charge happens.
- Admin login / attendance tests **skip** unless you set `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` (staff or super-admin account). Prefer a dedicated test login.
- Point at a running server with `PLAYWRIGHT_BASE_URL=https://…` if you do not want Playwright to start `npm run dev:server`.
- **CI:** unit tests always run. Public E2E runs when the GitHub Actions variable `ENABLE_E2E=true` and Supabase/Paystack secrets are configured on the repo.