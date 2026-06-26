-- Assign staff users to a single Glam Room shop for scoped booking access.
-- Super admins (role = admin) see all locations; staff see assigned_location_id only.

alter table public.profiles
  add column if not exists assigned_location_id text;

create index if not exists profiles_assigned_location_idx
  on public.profiles (assigned_location_id)
  where assigned_location_id is not null;

comment on column public.profiles.assigned_location_id is
  'For role=staff: glam-room-adenta | glam-room-sowutuom | glam-room-madina. Null for admin/client.';
