-- Correct Asantewaa Instagram handle to @_asantewaaaa_
update public.staff
set instagram_url = 'https://www.instagram.com/_asantewaaaa_'
where instagram_url in (
  'https://www.instagram.com/asantewaaaa',
  'https://instagram.com/asantewaaaa',
  'https://www.instagram.com/asantewaaaa/'
)
   or (
     name ilike 'asantewaa'
     and (instagram_url is null or instagram_url not ilike '%_asantewaaaa_%')
   );
