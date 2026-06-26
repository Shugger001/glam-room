create table if not exists public.paystack_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  reference text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists paystack_webhook_reference_idx
  on public.paystack_webhook_events (reference, created_at desc);

alter table public.paystack_webhook_events enable row level security;

drop policy if exists "Admins manage paystack webhook events" on public.paystack_webhook_events;
create policy "Admins manage paystack webhook events" on public.paystack_webhook_events
  for all
  using (public.is_admin())
  with check (public.is_admin());
