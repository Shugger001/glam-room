-- Staff shift attendance: clock in / clock out per shop
create table if not exists public.staff_shifts (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff (id) on delete cascade,
  location_id text not null,
  clock_in_at timestamptz not null default now(),
  clock_out_at timestamptz,
  clocked_in_by uuid references public.profiles (id) on delete set null,
  clocked_out_by uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  constraint staff_shifts_out_after_in check (
    clock_out_at is null or clock_out_at >= clock_in_at
  )
);

comment on table public.staff_shifts is
  'Shop floor attendance for catalog staff. One open shift (clock_out_at null) per staff at a time.';

create unique index if not exists staff_shifts_one_open_per_staff
  on public.staff_shifts (staff_id)
  where clock_out_at is null;

create index if not exists staff_shifts_location_open_idx
  on public.staff_shifts (location_id, clock_in_at desc)
  where clock_out_at is null;

create index if not exists staff_shifts_day_idx
  on public.staff_shifts (location_id, clock_in_at desc);

alter table public.staff_shifts enable row level security;

drop policy if exists "staff_shifts_staff_read" on public.staff_shifts;
create policy "staff_shifts_staff_read" on public.staff_shifts
  for select using (public.is_staff_or_admin());

drop policy if exists "staff_shifts_staff_insert" on public.staff_shifts;
create policy "staff_shifts_staff_insert" on public.staff_shifts
  for insert with check (public.is_staff_or_admin());

drop policy if exists "staff_shifts_staff_update" on public.staff_shifts;
create policy "staff_shifts_staff_update" on public.staff_shifts
  for update using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "staff_shifts_admin_delete" on public.staff_shifts;
create policy "staff_shifts_admin_delete" on public.staff_shifts
  for delete using (public.is_admin());
