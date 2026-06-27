-- Run once in Supabase SQL Editor (production setup)
-- Paystack references + site-media bucket + booking promo codes

alter table public.bookings
  add column if not exists paystack_reference text;

create unique index if not exists bookings_paystack_reference_key
  on public.bookings (paystack_reference)
  where paystack_reference is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "site_media_public_read" on storage.objects;
create policy "site_media_public_read" on storage.objects
  for select using (bucket_id = 'site-media');

drop policy if exists "site_media_admin_write" on storage.objects;
create policy "site_media_admin_write" on storage.objects
  for all using (bucket_id = 'site-media' and public.is_admin())
  with check (bucket_id = 'site-media' and public.is_admin());

alter table public.bookings
  add column if not exists promotion_code text;

create index if not exists bookings_promotion_code_idx on public.bookings (promotion_code)
  where promotion_code is not null;

-- Site content + review tokens (00013)
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
