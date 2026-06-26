-- Grant super admin access after signing up via /auth
-- Replace YOUR_EMAIL with your account email, then run in Supabase SQL Editor.

update public.profiles
set role = 'admin',
    assigned_location_id = null
where id = (
  select id from auth.users where email = 'stewardmoore22@gmail.com' limit 1
);

-- Assign a staff user to one shop (Adenta, Sowutuom, or Madina):
-- update public.profiles
-- set role = 'staff',
--     assigned_location_id = 'glam-room-adenta'  -- or glam-room-sowutuom | glam-room-madina
-- where id = (
--   select id from auth.users where email = 'STAFF_EMAIL@example.com' limit 1
-- );
