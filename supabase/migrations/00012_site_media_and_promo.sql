-- Site media storage bucket + booking promo tracking

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
  for all using (
    bucket_id = 'site-media' and public.is_admin()
  )
  with check (
    bucket_id = 'site-media' and public.is_admin()
  );

alter table public.bookings
  add column if not exists promotion_code text;

create index if not exists bookings_promotion_code_idx on public.bookings (promotion_code)
  where promotion_code is not null;

comment on column public.bookings.promotion_code is
  'Promo code applied to the booking deposit at checkout.';
