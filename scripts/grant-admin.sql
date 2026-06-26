-- Grant admin access after signing up via /auth
-- Replace YOUR_EMAIL with your account email, then run in Supabase SQL Editor.

update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'YOUR_EMAIL@example.com' limit 1
);
