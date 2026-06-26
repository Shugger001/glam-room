-- The Glam Room — sync content from theasantewaa.com (idempotent)

-- Deactivate legacy placeholder services
update public.services set active = false
where id in (
  'a1000001-0001-4000-8000-000000000001',
  'a1000001-0001-4000-8000-000000000002',
  'a1000001-0001-4000-8000-000000000003',
  'a1000001-0001-4000-8000-000000000004',
  'a1000001-0001-4000-8000-000000000005',
  'a1000001-0001-4000-8000-000000000006',
  'a1000001-0001-4000-8000-000000000007',
  'a1000001-0001-4000-8000-000000000008',
  'a1000001-0001-4000-8000-000000000009'
) and slug in (
  'signature-blowout', 'lace-front-installation', 'wig-revamp-restoration',
  'custom-hair-colouring', 'luxury-hair-treatment', 'designer-braids',
  'glam-makeup-application', 'luxury-lash-extensions', 'bridal-beauty-package'
);

insert into public.services (
  id, name, description, duration_minutes, base_price, currency, active, sort_order,
  category, slug, image_url, featured
) values
  ('a1000001-0001-4000-8000-000000000001', 'Hair Wash', 'Cleanse and refresh your hair.', 30, 35, 'GHS', true, 1, 'hair-reset', 'hair-wash', '/images/glam-adenta-portrait.png', true),
  ('a1000001-0001-4000-8000-000000000002', 'Hair Wash + Cornrows', 'Wash plus cornrow styling.', 90, 55, 'GHS', true, 2, 'hair-reset', 'hair-wash-cornrows', '/images/glam-braids-studio.png', false),
  ('a1000001-0001-4000-8000-000000000003', 'Unbraiding & Hair Wash', 'Take down braids and wash your hair.', 90, 50, 'GHS', true, 3, 'hair-reset', 'unbraid-hair-wash', '/images/glam-braids-portrait.png', false),
  ('a1000001-0001-4000-8000-000000000004', 'Touch Up with Salon''s Relaxer', 'New growth touch-up using Glam Room relaxer.', 90, 70, 'GHS', true, 4, 'hair-reset', 'touch-up-salon-relaxer', '/images/glam-gallery-waves-front.png', false),
  ('a1000001-0001-4000-8000-000000000005', 'Touch Up with Client''s Relaxer', 'New growth touch-up using your own relaxer.', 90, 50, 'GHS', true, 5, 'hair-reset', 'touch-up-client-relaxer', '/images/glam-gallery-waves-profile.png', false),
  ('a1000001-0001-4000-8000-000000000006', 'Normal Ponytail', 'Sleek, styled ponytail finish.', 60, 80, 'GHS', true, 6, 'hair-reset', 'normal-ponytail', '/images/glam-red-outdoor.png', false),
  ('a1000001-0001-4000-8000-000000000007', 'Closure Hair Install', 'Closure unit installed and styled.', 90, 50, 'GHS', true, 7, 'hair-installation', 'closure-install', '/images/glam-red-studio.png', true),
  ('a1000001-0001-4000-8000-000000000008', 'Frontal Hair Install', 'Frontal unit installed with a natural hairline.', 105, 100, 'GHS', true, 8, 'hair-installation', 'frontal-install', '/images/glam-red-indoor.png', false),
  ('a1000001-0001-4000-8000-000000000009', 'Frontal Ponytail', 'Frontal install finished in a sleek ponytail style.', 105, 150, 'GHS', true, 9, 'hair-installation', 'frontal-ponytail', '/images/glam-frontal-ponytail.png', false),
  ('a1000001-0001-4000-8000-000000000010', 'Shoulder Length Braids', 'Braiding service to shoulder length. Hair not included.', 210, 150, 'GHS', true, 10, 'braids', 'shoulder-length-braids', '/images/glam-braids-studio.png', true),
  ('a1000001-0001-4000-8000-000000000011', 'Bra Length Braids', 'Braiding service to bra strap length. Hair not included.', 270, 200, 'GHS', true, 11, 'braids', 'bra-length-braids', '/images/glam-bra-length.png', false),
  ('a1000001-0001-4000-8000-000000000012', 'Waist Length Braids', 'Braiding service to waist length. Hair not included.', 270, 220, 'GHS', true, 12, 'braids', 'waist-length-braids', '/images/glam-braids-studio.png', false),
  ('a1000001-0001-4000-8000-000000000013', 'Hip Length Braids', 'Braiding service to hip length. Hair not included.', 330, 250, 'GHS', true, 13, 'braids', 'hip-length-braids', '/images/glam-braids-studio.png', false),
  ('a1000001-0001-4000-8000-000000000014', 'Butt Length Braids', 'Braiding service to butt length. Hair not included.', 390, 300, 'GHS', true, 14, 'braids', 'butt-length-braids', '/images/glam-braids-portrait.png', false),
  ('a1000001-0001-4000-8000-000000000015', 'Under Butt Braids', 'Braiding service past butt length. Hair not included.', 450, 400, 'GHS', true, 15, 'braids', 'under-butt-braids', '/images/glam-braids-portrait.png', false)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  base_price = excluded.base_price,
  category = excluded.category,
  slug = excluded.slug,
  image_url = excluded.image_url,
  featured = excluded.featured,
  active = excluded.active,
  sort_order = excluded.sort_order;

update public.staff set active = false
where id in (
  'b1000001-0001-4000-8000-000000000002',
  'b1000001-0001-4000-8000-000000000003',
  'b1000001-0001-4000-8000-000000000004'
);

insert into public.staff (
  id, name, role, bio, experience, specialty, image_url, instagram_url, active, sort_order
) values (
  'b1000001-0001-4000-8000-000000000001',
  'Asantewaa', 'Founder & Lead Stylist',
  'Glam Room is her love letter to Accra: warm vibes, expert hands, and zero tolerance for bad hair days.',
  '4M+ followers', array['Hair Reset', 'Braids', 'Wig Installation', 'Silk Press'],
  '/images/asantewaa-gown-smile.png', 'https://www.instagram.com/asantewaaaa', true, 1
) on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  bio = excluded.bio,
  experience = excluded.experience,
  specialty = excluded.specialty,
  image_url = excluded.image_url,
  instagram_url = excluded.instagram_url,
  active = excluded.active,
  sort_order = excluded.sort_order;

insert into public.gallery (id, src, alt, category, width, height, sort_order, published) values
  ('c1000001-0001-4000-8000-000000000001', '/images/glam-braids-studio.png', 'Butterfly Braids', 'braids', 800, 1000, 1, true),
  ('c1000001-0001-4000-8000-000000000002', '/images/glam-braids-portrait.png', 'Full Glam Portrait', 'glam', 800, 1000, 2, true),
  ('c1000001-0001-4000-8000-000000000003', '/images/glam-red-outdoor.png', 'Red Carpet Outdoor', 'glam', 800, 1000, 3, true),
  ('c1000001-0001-4000-8000-000000000004', '/images/glam-red-indoor.png', 'Signature Glam', 'glam', 800, 1000, 4, true),
  ('c1000001-0001-4000-8000-000000000005', '/images/glam-red-studio.png', 'Studio Slay', 'glam', 800, 1000, 5, true),
  ('c1000001-0001-4000-8000-000000000006', '/images/glam-red-celebration.png', 'Celebration Glam', 'glam', 800, 1000, 6, true),
  ('c1000001-0001-4000-8000-000000000007', '/images/glam-gallery-waves-profile.png', 'Silk Waves Profile', 'hair', 800, 1000, 7, true),
  ('c1000001-0001-4000-8000-000000000008', '/images/glam-gallery-braids-bw.png', 'Butterfly Braids B&W', 'braids', 800, 1000, 8, true),
  ('c1000001-0001-4000-8000-000000000009', '/images/glam-gallery-waves-front.png', 'Hollywood Waves', 'hair', 800, 1000, 9, true)
on conflict (id) do update set
  src = excluded.src,
  alt = excluded.alt,
  category = excluded.category,
  width = excluded.width,
  height = excluded.height,
  sort_order = excluded.sort_order,
  published = excluded.published;

update public.gallery set published = false
where id in (
  'c1000001-0001-4000-8000-000000000010',
  'c1000001-0001-4000-8000-000000000011',
  'c1000001-0001-4000-8000-000000000012'
);

insert into public.testimonials (id, name, service, rating, quote, published, sort_order) values
  ('d1000001-0001-4000-8000-000000000001', 'Ama K.', 'Regular Client', 5, 'Baby girl, when you leave my chair, Accra is NOT ready! Best silk press I''ve ever had. I felt like a whole new person.', true, 1),
  ('d1000001-0001-4000-8000-000000000002', 'Efua M.', 'First-Timer', 5, 'Asantewaa did my braids and I got stopped on the street THREE times. The energy in that salon? Unmatched!', true, 2),
  ('d1000001-0001-4000-8000-000000000003', 'Akua T.', 'Glam Room Client', 5, 'I came in stressed, I left feeling like a celebrity. The vibes, the music, the hair. 10/10 would recommend to every sis.', true, 3),
  ('d1000001-0001-4000-8000-000000000004', 'Dela S.', 'Wig Install Client', 5, 'My wig install was so seamless my own mother thought it was my hair. Glam Room is THE spot in Accra, period.', true, 4)
on conflict (id) do update set
  name = excluded.name,
  service = excluded.service,
  rating = excluded.rating,
  quote = excluded.quote,
  published = excluded.published,
  sort_order = excluded.sort_order;

update public.testimonials set published = false
where id in (
  'd1000001-0001-4000-8000-000000000005',
  'd1000001-0001-4000-8000-000000000006'
);

insert into public.settings (key, value) values
  ('salon', jsonb_build_object(
    'name', 'Glam Room by Asantewaa',
    'tagline', 'Your Crown. Your Glow.',
    'whatsapp', '+233243646400',
    'deposit_percent', 0
  ))
on conflict (key) do update set value = excluded.value, updated_at = now();
