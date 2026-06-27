-- Editable site content + post-visit review tokens

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
  for all using (public.is_admin())
  with check (public.is_admin());

alter table public.bookings
  add column if not exists review_token text,
  add column if not exists review_submitted_at timestamptz;

create unique index if not exists bookings_review_token_key
  on public.bookings (review_token)
  where review_token is not null;

alter table public.testimonials
  add column if not exists booking_id uuid references public.bookings (id) on delete set null,
  add column if not exists source text not null default 'admin';

create index if not exists testimonials_booking_id_idx on public.testimonials (booking_id)
  where booking_id is not null;

create index if not exists testimonials_published_source_idx on public.testimonials (published, source);
