-- Guest booking fields + Find My Booking lookup support

alter table public.bookings
  add column if not exists client_name text,
  add column if not exists client_phone text,
  add column if not exists location_id text;

create index if not exists bookings_client_phone_idx on public.bookings (client_phone);

-- Allow anonymous guest bookings (user_id null)
drop policy if exists "Guest can create bookings" on public.bookings;
create policy "Guest can create bookings" on public.bookings
  for insert
  with check (user_id is null);

-- Gallery: allow glam category used by Asantewaa content
alter table public.gallery drop constraint if exists gallery_category_check;
alter table public.gallery add constraint gallery_category_check
  check (category in ('hair', 'wigs', 'bridal', 'transformation', 'braids', 'glam'));
