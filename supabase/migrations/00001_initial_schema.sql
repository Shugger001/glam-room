-- Kabuki The MakeUp Girl — core schema, RLS, realtime
-- Run with Supabase CLI or SQL editor

create extension if not exists "uuid-ossp";

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role text not null default 'client' check (role in ('client', 'staff', 'admin')),
  crm_tags text[] default '{}',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes int not null default 60,
  base_price numeric(12,2) not null,
  currency text not null default 'NGN',
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id),
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'awaiting_approval'
    check (status in ('pending', 'awaiting_approval', 'confirmed', 'rejected', 'cancelled', 'completed')),
  location_type text not null default 'studio' check (location_type in ('studio', 'home')),
  address text,
  add_ons jsonb default '{}',
  client_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_user_id_idx on public.bookings (user_id);
create index bookings_start_at_idx on public.bookings (start_at);
create index bookings_status_idx on public.bookings (status);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  category text,
  inventory int not null default 0,
  images jsonb default '[]',
  variants jsonb default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_idx on public.products (category);
create index products_active_idx on public.products (active);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'failed')),
  paystack_reference text unique,
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'NGN',
  shipping_address jsonb,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity int not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  cover_image text,
  published boolean not null default false,
  published_at timestamptz,
  author_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  type text not null default 'system',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id);

create table public.settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
create trigger blog_posts_touch before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- RLS helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'staff') from public.profiles where id = auth.uid()),
    false
  );
$$;

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.blog_posts enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;

-- profiles
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_staff_or_admin());
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins update any profile" on public.profiles
  for update using (public.is_admin());
create policy "Admins insert profiles" on public.profiles
  for insert with check (public.is_admin());

-- services (public read active; staff manage)
create policy "Anyone reads active services" on public.services
  for select using (active = true or public.is_staff_or_admin());
create policy "Staff manages services" on public.services
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

-- bookings
create policy "Clients manage own bookings" on public.bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Staff sees all bookings" on public.bookings
  for select using (public.is_staff_or_admin());
create policy "Staff updates bookings" on public.bookings
  for update using (public.is_staff_or_admin());

-- products
create policy "Anyone reads active products" on public.products
  for select using (active = true or public.is_staff_or_admin());
create policy "Staff manages products" on public.products
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

-- orders
create policy "Users read own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_staff_or_admin());
create policy "Users insert own orders" on public.orders
  for insert with check (auth.uid() = user_id or user_id is null);
create policy "Staff updates orders" on public.orders
  for update using (public.is_staff_or_admin());

-- order_items
create policy "Order items via order access" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_staff_or_admin())
    )
  );
create policy "Staff all order_items" on public.order_items
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());
create policy "Users insert order_items for own order" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- reviews
create policy "Public read reviews for active products" on public.reviews
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.active = true)
    or auth.uid() = user_id
    or public.is_staff_or_admin()
  );
create policy "Users insert own review" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "Users update own review" on public.reviews
  for update using (auth.uid() = user_id);

-- blog
create policy "Published posts public" on public.blog_posts
  for select using (published = true or public.is_staff_or_admin());
create policy "Staff manages blog" on public.blog_posts
  for all using (public.is_staff_or_admin()) with check (public.is_staff_or_admin());

-- notifications
create policy "Users own notifications" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Staff insert notifications" on public.notifications
  for insert with check (public.is_staff_or_admin());

-- settings
create policy "Staff reads settings" on public.settings
  for select using (public.is_staff_or_admin());
create policy "Admin writes settings" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Realtime: bookings (availability / admin board)
alter publication supabase_realtime add table public.bookings;

-- Storage bucket (run in dashboard or separate migration)
-- insert into storage.buckets (id, name, public) values ('media', 'media', true);
