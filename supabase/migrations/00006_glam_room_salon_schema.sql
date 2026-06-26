-- The Glam Room — salon extensions: staff, gallery, testimonials, promotions, contact_messages

-- Staff
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  role text not null,
  bio text,
  experience text,
  specialty text[] default '{}',
  image_url text,
  instagram_url text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists staff_active_idx on public.staff (active);
create index if not exists staff_sort_order_idx on public.staff (sort_order);

-- Gallery
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null,
  category text not null check (category in ('hair', 'wigs', 'bridal', 'transformation', 'braids')),
  width int not null default 800,
  height int not null default 800,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists gallery_category_idx on public.gallery (category);
create index if not exists gallery_published_idx on public.gallery (published);

-- Testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service text,
  rating int not null default 5 check (rating between 1 and 5),
  quote text not null,
  image_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists testimonials_published_idx on public.testimonials (published);

-- Promotions
create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  code text unique,
  discount_percent numeric(5,2),
  discount_amount numeric(12,2),
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists promotions_active_idx on public.promotions (active);

-- Contact messages
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- Extend services with category and image
alter table public.services
  add column if not exists category text,
  add column if not exists image_url text,
  add column if not exists slug text;

-- Extend bookings with staff and deposit
alter table public.bookings
  add column if not exists staff_id uuid references public.staff (id) on delete set null,
  add column if not exists deposit_amount numeric(12,2),
  add column if not exists deposit_paid boolean not null default false;

create index if not exists bookings_staff_id_idx on public.bookings (staff_id);

-- Allow guest bookings (customer details captured in client_notes)
alter table public.bookings alter column user_id drop not null;

-- Triggers
drop trigger if exists staff_touch on public.staff;
create trigger staff_touch before update on public.staff
  for each row execute function public.touch_updated_at();

drop trigger if exists promotions_touch on public.promotions;
create trigger promotions_touch before update on public.promotions
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.staff enable row level security;
alter table public.gallery enable row level security;
alter table public.testimonials enable row level security;
alter table public.promotions enable row level security;
alter table public.contact_messages enable row level security;

-- Staff: public read active, admin write
drop policy if exists "staff_public_read" on public.staff;
create policy "staff_public_read" on public.staff for select using (active = true);
drop policy if exists "staff_admin_all" on public.staff;
create policy "staff_admin_all" on public.staff for all using (public.is_admin());

-- Gallery: public read published, admin write
drop policy if exists "gallery_public_read" on public.gallery;
create policy "gallery_public_read" on public.gallery for select using (published = true);
drop policy if exists "gallery_admin_all" on public.gallery;
create policy "gallery_admin_all" on public.gallery for all using (public.is_admin());

-- Testimonials: public read published, admin write
drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials for select using (published = true);
drop policy if exists "testimonials_admin_all" on public.testimonials;
create policy "testimonials_admin_all" on public.testimonials for all using (public.is_admin());

-- Promotions: public read active, admin write
drop policy if exists "promotions_public_read" on public.promotions;
create policy "promotions_public_read" on public.promotions for select using (active = true);
drop policy if exists "promotions_admin_all" on public.promotions;
create policy "promotions_admin_all" on public.promotions for all using (public.is_admin());

-- Contact: anyone can insert, admin read
drop policy if exists "contact_insert" on public.contact_messages;
create policy "contact_insert" on public.contact_messages for insert with check (true);
drop policy if exists "contact_admin_read" on public.contact_messages;
create policy "contact_admin_read" on public.contact_messages for select using (public.is_admin());
drop policy if exists "contact_admin_update" on public.contact_messages;
create policy "contact_admin_update" on public.contact_messages for update using (public.is_admin());

-- Extend services table policies if needed (already has RLS from initial schema)
-- Seed default salon services categories
update public.services set category = 'makeup' where category is null and active = true;
