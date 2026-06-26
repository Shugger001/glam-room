-- The Glam Room — seed salon content (idempotent)

alter table public.services
  add column if not exists featured boolean not null default false;

-- Remove legacy Kabuki demo services
delete from public.services
where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

insert into public.services (
  id, name, description, duration_minutes, base_price, currency, active, sort_order,
  category, slug, image_url, featured
) values
  (
    'a1000001-0001-4000-8000-000000000001',
    'Signature Blowout & Styling',
    'Precision cut consultation, luxury wash, and a flawless blowout tailored to your hair texture and occasion.',
    90, 350, 'GHS', true, 1,
    'hair-styling', 'signature-blowout',
    'https://images.unsplash.com/photo-1560066984-138d9834a973?w=800&q=80', true
  ),
  (
    'a1000001-0001-4000-8000-000000000002',
    'Lace Front Wig Installation',
    'Seamless lace melt, custom tinting, and secure installation for a natural, undetectable hairline.',
    180, 1200, 'GHS', true, 2,
    'wig-installation', 'lace-front-installation',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', true
  ),
  (
    'a1000001-0001-4000-8000-000000000003',
    'Wig Revamp & Restoration',
    'Deep cleanse, re-styling, lace repair, and colour refresh to restore your unit to salon-fresh condition.',
    120, 450, 'GHS', true, 3,
    'wig-revamp', 'wig-revamp-restoration',
    'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80', false
  ),
  (
    'a1000001-0001-4000-8000-000000000004',
    'Custom Hair Colouring',
    'From subtle balayage to bold transformations — premium colour formulas with scalp-safe application.',
    150, 800, 'GHS', true, 4,
    'hair-coloring', 'custom-hair-colouring',
    'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&q=80', true
  ),
  (
    'a1000001-0001-4000-8000-000000000005',
    'Luxury Hair Treatment',
    'Intensive keratin, protein, or moisture therapy to repair damage and restore luminous shine.',
    60, 280, 'GHS', true, 5,
    'hair-treatment', 'luxury-hair-treatment',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80', false
  ),
  (
    'a1000001-0001-4000-8000-000000000006',
    'Designer Braids',
    'Knotless, feed-in, and protective styles crafted with precision for lasting beauty and comfort.',
    240, 600, 'GHS', true, 6,
    'braids', 'designer-braids',
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80', true
  ),
  (
    'a1000001-0001-4000-8000-000000000007',
    'Glam Makeup Application',
    'Flawless complexion, sculpted features, and long-wear artistry for events, photoshoots, and evenings out.',
    75, 400, 'GHS', true, 7,
    'makeup', 'glam-makeup-application',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80', false
  ),
  (
    'a1000001-0001-4000-8000-000000000008',
    'Luxury Lash Extensions',
    'Classic, hybrid, or volume sets applied with meticulous technique for captivating, natural-looking lashes.',
    120, 350, 'GHS', true, 8,
    'lashes', 'luxury-lash-extensions',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80', false
  ),
  (
    'a1000001-0001-4000-8000-000000000009',
    'Bridal Beauty Package',
    'Complete bridal hair and makeup with trial session, touch-up kit, and dedicated day-of coordination.',
    180, 2500, 'GHS', true, 9,
    'bridal', 'bridal-beauty-package',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', true
  )
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

insert into public.staff (
  id, name, role, bio, experience, specialty, image_url, instagram_url, active, sort_order
) values
  (
    'b1000001-0001-4000-8000-000000000001',
    'Amara Osei', 'Founder & Lead Stylist',
    'With over 12 years shaping Accra''s luxury beauty scene, Amara founded The Glam Room to deliver an uncompromising standard of hair artistry.',
    '12+ years', array['Hair Styling', 'Bridal', 'Wig Installation'],
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80',
    'https://instagram.com', true, 1
  ),
  (
    'b1000001-0001-4000-8000-000000000002',
    'Efua Mensah', 'Senior Colorist',
    'Efua specialises in transformative colour work — from sun-kissed balayage to bold editorial hues — with a focus on hair health.',
    '8+ years', array['Hair Coloring', 'Hair Treatment', 'Wig Revamp'],
    'https://images.unsplash.com/photo-1560066984-138d9834a973?w=600&q=80',
    'https://instagram.com', true, 2
  ),
  (
    'b1000001-0001-4000-8000-000000000003',
    'Nana Adjei', 'Braids & Protective Styles Specialist',
    'Known for intricate knotless braids and feed-in styles, Nana combines speed with precision for styles that last weeks.',
    '6+ years', array['Braids', 'Wig Installation'],
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    'https://instagram.com', true, 3
  ),
  (
    'b1000001-0001-4000-8000-000000000004',
    'Akosua Boateng', 'Makeup & Lash Artist',
    'Akosua brings runway-level makeup artistry and lash expertise to every client — from bridal glow to red-carpet drama.',
    '7+ years', array['Makeup', 'Lashes', 'Bridal'],
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
    'https://instagram.com', true, 4
  )
on conflict (id) do update set
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
  ('c1000001-0001-4000-8000-000000000001', 'https://images.unsplash.com/photo-1560066984-138d9834a973?w=800&q=80', 'Luxury blowout and hair styling', 'hair', 800, 1000, 1, true),
  ('c1000001-0001-4000-8000-000000000002', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80', 'Flawless lace front wig installation', 'wigs', 800, 600, 2, true),
  ('c1000001-0001-4000-8000-000000000003', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 'Bridal hair and makeup', 'bridal', 800, 1200, 3, true),
  ('c1000001-0001-4000-8000-000000000004', 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&q=80', 'Hair colour transformation', 'transformation', 800, 900, 4, true),
  ('c1000001-0001-4000-8000-000000000005', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80', 'Designer knotless braids', 'braids', 800, 1000, 5, true),
  ('c1000001-0001-4000-8000-000000000006', 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80', 'Wig revamp and restoration', 'wigs', 800, 700, 6, true),
  ('c1000001-0001-4000-8000-000000000007', 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80', 'Luxury hair treatment results', 'hair', 800, 800, 7, true),
  ('c1000001-0001-4000-8000-000000000008', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80', 'Glam makeup application', 'bridal', 800, 600, 8, true),
  ('c1000001-0001-4000-8000-000000000009', 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80', 'Luxury lash extensions', 'transformation', 800, 900, 9, true),
  ('c1000001-0001-4000-8000-000000000010', 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80', 'Salon interior and styling session', 'hair', 800, 500, 10, true),
  ('c1000001-0001-4000-8000-000000000011', 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80', 'Bridal party glam', 'bridal', 800, 1100, 11, true),
  ('c1000001-0001-4000-8000-000000000012', 'https://images.unsplash.com/photo-1605497788041-5f32ae44313a?w=800&q=80', 'Feed-in braids style', 'braids', 800, 800, 12, true)
on conflict (id) do update set
  src = excluded.src,
  alt = excluded.alt,
  category = excluded.category,
  width = excluded.width,
  height = excluded.height,
  sort_order = excluded.sort_order,
  published = excluded.published;

insert into public.testimonials (id, name, service, rating, quote, published, sort_order) values
  (
    'd1000001-0001-4000-8000-000000000001',
    'Adwoa K.', 'Bridal Beauty Package', 5,
    'The Glam Room made me feel like royalty on my wedding day. Every detail was perfect — from the trial to the final look. I couldn''t have asked for more.',
    true, 1
  ),
  (
    'd1000001-0001-4000-8000-000000000002',
    'Maame S.', 'Lace Front Wig Installation', 5,
    'The most natural install I''ve ever had. The lace melt was flawless and the styling lasted two weeks. This is now my only salon.',
    true, 2
  ),
  (
    'd1000001-0001-4000-8000-000000000003',
    'Esi A.', 'Designer Braids', 5,
    'Nana''s knotless braids are incredible — neat, lightweight, and they lasted over a month. The salon atmosphere is so calming and luxurious.',
    true, 3
  ),
  (
    'd1000001-0001-4000-8000-000000000004',
    'Yaa B.', 'Custom Hair Colouring', 5,
    'Efua understood exactly what I wanted. My balayage is stunning and my hair feels healthier than before the colour. True artistry.',
    true, 4
  ),
  (
    'd1000001-0001-4000-8000-000000000005',
    'Abena M.', 'Glam Makeup Application', 5,
    'Akosua''s makeup lasted through an entire evening event without a single touch-up. I received compliments all night. Absolutely worth it.',
    true, 5
  ),
  (
    'd1000001-0001-4000-8000-000000000006',
    'Ruth O.', 'Signature Blowout & Styling', 5,
    'From the moment you walk in, you feel the luxury. The team is professional, warm, and incredibly skilled. My go-to salon in Accra.',
    true, 6
  )
on conflict (id) do update set
  name = excluded.name,
  service = excluded.service,
  rating = excluded.rating,
  quote = excluded.quote,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.settings (key, value) values
  ('salon', jsonb_build_object(
    'name', 'The Glam Room',
    'tagline', 'Luxury Hair & Beauty',
    'deposit_percent', 0.3
  ))
on conflict (key) do update set value = excluded.value, updated_at = now();
