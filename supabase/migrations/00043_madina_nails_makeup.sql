-- Per-shop service availability + Madina nails & makeup catalog
alter table public.services
  add column if not exists location_ids text[];

comment on column public.services.location_ids is
  'Null or empty = all shops. Otherwise only these location ids (e.g. glam-room-madina).';

create index if not exists services_location_ids_gin
  on public.services using gin (location_ids);

-- Madina-only: nails
insert into public.services (
  id, name, description, duration_minutes, base_price, currency,
  category, slug, image_url, featured, active, sort_order, location_ids
) values
  (
    'a1000001-0001-4000-8000-000000000020',
    'Classic manicure',
    'Nail shaping, cuticle care, and polish. Madina shop.',
    45, 80, 'GHS', 'nails', 'classic-manicure',
    '/images/glam-red-celebration.png', false, true, 20,
    array['glam-room-madina']
  ),
  (
    'a1000001-0001-4000-8000-000000000021',
    'Gel manicure',
    'Long-wear gel polish manicure. Madina shop.',
    60, 150, 'GHS', 'nails', 'gel-manicure',
    '/images/glam-red-celebration.png', true, true, 21,
    array['glam-room-madina']
  ),
  (
    'a1000001-0001-4000-8000-000000000022',
    'Classic pedicure',
    'Foot soak, care, and polish. Madina shop.',
    60, 100, 'GHS', 'nails', 'classic-pedicure',
    '/images/glam-red-celebration.png', false, true, 22,
    array['glam-room-madina']
  ),
  (
    'a1000001-0001-4000-8000-000000000023',
    'Gel pedicure',
    'Gel polish pedicure. Madina shop.',
    75, 180, 'GHS', 'nails', 'gel-pedicure',
    '/images/glam-red-celebration.png', false, true, 23,
    array['glam-room-madina']
  ),
  (
    'a1000001-0001-4000-8000-000000000024',
    'Acrylic full set',
    'Full set acrylic extensions. Madina shop.',
    120, 250, 'GHS', 'nails', 'acrylic-full-set',
    '/images/glam-red-celebration.png', true, true, 24,
    array['glam-room-madina']
  ),
  (
    'a1000001-0001-4000-8000-000000000025',
    'Acrylic refill',
    'Acrylic fill / refill. Madina shop.',
    90, 150, 'GHS', 'nails', 'acrylic-refill',
    '/images/glam-red-celebration.png', false, true, 25,
    array['glam-room-madina']
  ),
  -- Madina-only: makeup
  (
    'a1000001-0001-4000-8000-000000000030',
    'Soft glam makeup',
    'Natural soft glam look. Madina shop.',
    60, 200, 'GHS', 'makeup', 'soft-glam-makeup',
    '/images/glam-red-indoor.png', true, true, 30,
    array['glam-room-madina']
  ),
  (
    'a1000001-0001-4000-8000-000000000031',
    'Full glam makeup',
    'Bold full glam makeup. Madina shop.',
    90, 300, 'GHS', 'makeup', 'full-glam-makeup',
    '/images/glam-red-indoor.png', true, true, 31,
    array['glam-room-madina']
  ),
  (
    'a1000001-0001-4000-8000-000000000032',
    'Bridal makeup',
    'Bridal makeup session. Madina shop — trial available on request.',
    120, 500, 'GHS', 'makeup', 'bridal-makeup',
    '/images/glam-red-indoor.png', true, true, 32,
    array['glam-room-madina']
  ),
  (
    'a1000001-0001-4000-8000-000000000033',
    'Makeup + lashes',
    'Glam makeup with lash application. Madina shop.',
    90, 350, 'GHS', 'makeup', 'makeup-lashes',
    '/images/glam-red-indoor.png', false, true, 33,
    array['glam-room-madina']
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  base_price = excluded.base_price,
  currency = 'GHS',
  category = excluded.category,
  slug = excluded.slug,
  image_url = excluded.image_url,
  featured = excluded.featured,
  active = true,
  sort_order = excluded.sort_order,
  location_ids = excluded.location_ids;
