-- Shop home assignment + front desk seats (ops, not public Experts)
alter table public.staff
  add column if not exists home_location_id text,
  add column if not exists is_front_desk boolean not null default false;

comment on column public.staff.home_location_id is
  'Primary shop: glam-room-adenta | glam-room-sowutuom | glam-room-madina. Null = float across shops.';

comment on column public.staff.is_front_desk is
  'Front desk / ops seat — shown in clock-in, hidden from public Experts and booking stylist lists.';

create index if not exists staff_home_location_idx
  on public.staff (home_location_id)
  where home_location_id is not null;

create index if not exists staff_front_desk_idx
  on public.staff (is_front_desk)
  where is_front_desk = true;

-- Public site only sees bookable stylists, not front desk
drop policy if exists "staff_public_read" on public.staff;
create policy "staff_public_read" on public.staff
  for select using (active = true and is_front_desk = false);

-- Staff / admin can read full roster (including front desk) for ops
drop policy if exists "staff_ops_read" on public.staff;
create policy "staff_ops_read" on public.staff
  for select using (public.is_staff_or_admin());

-- Seed one front desk seat per shop
insert into public.staff (
  id,
  name,
  role,
  bio,
  specialty,
  home_location_id,
  is_front_desk,
  active,
  sort_order
) values
  (
    'b1000001-0001-4000-8000-0000000000fd',
    'Front Desk · Adenta',
    'Front Desk',
    'Shop front desk for Glam Room Adenta.',
    '{}',
    'glam-room-adenta',
    true,
    true,
    900
  ),
  (
    'b1000001-0001-4000-8000-0000000000fe',
    'Front Desk · Sowutuom',
    'Front Desk',
    'Shop front desk for Glam Room Sowutuom.',
    '{}',
    'glam-room-sowutuom',
    true,
    true,
    901
  ),
  (
    'b1000001-0001-4000-8000-0000000000ff',
    'Front Desk · Madina',
    'Front Desk',
    'Shop front desk for Glam Room Madina.',
    '{}',
    'glam-room-madina',
    true,
    true,
    902
  )
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  bio = excluded.bio,
  home_location_id = excluded.home_location_id,
  is_front_desk = true,
  active = true,
  updated_at = now();
