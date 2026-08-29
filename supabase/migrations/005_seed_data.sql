-- ============================================================
-- Migration 005: Development Seed Data
-- SAFE for development only.  Do NOT run in production unless
-- you intend these records to be real business data.
-- ============================================================

-- ── Site Settings ─────────────────────────────────────────
insert into site_settings (key, value, description) values
  ('restaurant_name',   'Lord Reigneth Foods',             'Brand name'),
  ('tagline',           'Simply Delicious!',               'Brand tagline'),
  ('phone',             '+234 805 024 0544',               'Primary contact phone'),
  ('whatsapp',          '+2347053357203',                  'WhatsApp number (no spaces)'),
  ('email',             '',                                'Contact email (to be set)'),
  ('address',           '13, Old Ondo Benin Road, Ijebu Ode, Ogun State', 'Main address'),
  ('instagram',         'https://www.instagram.com/lordreignethfoods', 'Instagram URL'),
  ('tiktok',            'https://www.tiktok.com/@lordreignethfoods',   'TikTok URL'),
  ('currency',          'NGN',                             'Default currency'),
  ('delivery_fee',      '0',                               'Default delivery fee in NGN'),
  ('min_order_amount',  '0',                               'Minimum order amount in NGN')
on conflict (key) do nothing;

-- ── Locations ─────────────────────────────────────────────
insert into locations (id, name, slug, address, description, phone, display_order, is_open)
values
  (
    'a1000000-0000-0000-0000-000000000001',
    'Main Outlet',
    'main-outlet',
    '13, Old Ondo Benin Road, Ijebu Ode, Ogun State',
    'Our flagship restaurant — the heart of Lord Reigneth Foods.',
    '+234 805 024 0544',
    1,
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Lagos Garage',
    'lagos-garage',
    'Lagos Garage, Ijebu Ode, Ogun State',
    'A popular quick-service location serving travellers and residents on the go.',
    '+234 805 024 0544',
    2,
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Ilese Outlet',
    'ilese',
    'Ilese, Ijebu Area, Ogun State',
    'Serving the Ilese community — students, residents and visitors alike.',
    '+234 805 024 0544',
    3,
    true
  )
on conflict (slug) do nothing;

-- ── Business Hours (Mon–Sat 07:00–21:00, Sunday closed) ──
-- day_of_week: 0=Sunday, 1=Monday … 6=Saturday
do $$ declare loc_id uuid; begin
  foreach loc_id in array array[
    'a1000000-0000-0000-0000-000000000001'::uuid,
    'a1000000-0000-0000-0000-000000000002'::uuid,
    'a1000000-0000-0000-0000-000000000003'::uuid
  ] loop
    insert into business_hours (location_id, day_of_week, opening_time, closing_time, is_closed)
    values
      (loc_id, 0, null, null, true),   -- Sunday
      (loc_id, 1, '07:00', '21:00', false),
      (loc_id, 2, '07:00', '21:00', false),
      (loc_id, 3, '07:00', '21:00', false),
      (loc_id, 4, '07:00', '21:00', false),
      (loc_id, 5, '07:00', '21:00', false),
      (loc_id, 6, '07:00', '21:00', false)
    on conflict (location_id, day_of_week) do nothing;
  end loop;
end $$;

-- ── Menu Categories ───────────────────────────────────────
insert into menu_categories (id, name, slug, description, display_order) values
  ('b1000000-0000-0000-0000-000000000001', 'Rice',     'rice',     'Our signature rice dishes, freshly prepared every day.',            1),
  ('b1000000-0000-0000-0000-000000000002', 'Swallow',  'swallow',  'Traditional Nigerian swallow foods — perfectly pounded.',           2),
  ('b1000000-0000-0000-0000-000000000003', 'Soups',    'soups',    'Rich, flavourful soups made from authentic Nigerian recipes.',      3),
  ('b1000000-0000-0000-0000-000000000004', 'Proteins', 'proteins', 'Grilled, peppered and seasoned proteins to complement any meal.',  4),
  ('b1000000-0000-0000-0000-000000000005', 'Sides',    'sides',    'Delicious accompaniments to round out your meal.',                  5),
  ('b1000000-0000-0000-0000-000000000006', 'Snacks',   'snacks',   'Quick bites and Nigerian street food favourites.',                  6),
  ('b1000000-0000-0000-0000-000000000007', 'Drinks',   'drinks',   'Refreshing drinks to quench your thirst.',                         7)
on conflict (slug) do nothing;

-- ── Menu Items (prices TBD — NULL until real prices provided) ────
insert into menu_items (name, slug, category_id, description, is_featured, display_order) values
  -- Rice
  ('Smoky Jollof Rice',    'smoky-jollof-rice',   'b1000000-0000-0000-0000-000000000001',
   'Our signature party-style jollof rice, slow-cooked over firewood for that irresistible smoky flavour.',
   true, 1),
  ('Fried Rice',           'fried-rice',          'b1000000-0000-0000-0000-000000000001',
   'Fragrant fried rice with colourful mixed vegetables — a classic favourite.',
   true, 2),
  ('White Rice',           'white-rice',          'b1000000-0000-0000-0000-000000000001',
   'Plain steamed white rice, the perfect base for any sauce or stew.',
   false, 3),
  ('Ofada Rice & Sauce',   'ofada-rice',          'b1000000-0000-0000-0000-000000000001',
   'Local brown rice served with the bold, spicy Ofada pepper sauce — a true Ijebu staple.',
   false, 4),
  -- Swallow
  ('Pounded Yam',          'pounded-yam',         'b1000000-0000-0000-0000-000000000002',
   'Smooth, elastic pounded yam — prepared the traditional way.',
   true, 1),
  ('Eba (Garri)',           'eba',                 'b1000000-0000-0000-0000-000000000002',
   'Garri swallow — a Nigerian household classic.',
   false, 2),
  ('Amala',                'amala',               'b1000000-0000-0000-0000-000000000002',
   'Dark, smooth yam flour swallow — a Yoruba favourite.',
   false, 3),
  ('Semovita',             'semovita',            'b1000000-0000-0000-0000-000000000002',
   'Smooth semolina swallow — light and easy to enjoy with any Nigerian soup.',
   false, 4),
  -- Soups
  ('Egusi Soup',           'egusi-soup',          'b1000000-0000-0000-0000-000000000003',
   'Rich, hearty melon seed soup with assorted meats and leafy vegetables.',
   false, 1),
  ('Bitterleaf Soup',      'bitterleaf-soup',     'b1000000-0000-0000-0000-000000000003',
   'A bold, flavourful soup with cocoyam thickener and fresh fish.',
   false, 2),
  ('Efo Riro',             'efo-riro',            'b1000000-0000-0000-0000-000000000003',
   'Yoruba-style stewed leafy greens in a rich pepper base.',
   false, 3),
  ('Okra Soup',            'okra-soup',           'b1000000-0000-0000-0000-000000000003',
   'Silky, draw okra soup with assorted proteins.',
   false, 4),
  -- Proteins
  ('Peppered Chicken',     'peppered-chicken',    'b1000000-0000-0000-0000-000000000004',
   'Grilled chicken tossed in a bold, spicy Nigerian pepper sauce.',
   true, 1),
  ('Peppered Snail',       'peppered-snail',      'b1000000-0000-0000-0000-000000000004',
   'Tender garden snails in a rich, aromatic pepper sauce.',
   true, 2),
  ('Fried Fish',           'fried-fish',          'b1000000-0000-0000-0000-000000000004',
   'Crispy, well-seasoned fried fish — golden on the outside and tender on the inside.',
   false, 3),
  ('Assorted Meat',        'assorted-meat',       'b1000000-0000-0000-0000-000000000004',
   'A selection of cooked and seasoned assorted meats.',
   false, 4),
  -- Sides
  ('Moin-Moin',            'moin-moin',           'b1000000-0000-0000-0000-000000000005',
   'Steamed bean pudding with egg and fish filling.',
   true, 1),
  ('Coleslaw',             'coleslaw',            'b1000000-0000-0000-0000-000000000005',
   'Fresh, creamy coleslaw — a refreshing side that pairs well with rice dishes.',
   true, 2),
  ('Fried Plantain (Dodo)','fried-plantain',      'b1000000-0000-0000-0000-000000000005',
   'Sweet, caramelised fried plantain slices.',
   false, 3),
  -- Snacks
  ('Puff Puff',            'puff-puff',           'b1000000-0000-0000-0000-000000000006',
   'Light, fluffy deep-fried dough balls — a beloved Nigerian snack.',
   true, 1),
  ('Meat Pie',             'meat-pie',            'b1000000-0000-0000-0000-000000000006',
   'Golden pastry filled with well-seasoned minced beef and vegetables.',
   false, 2),
  ('Chin Chin',            'chin-chin',           'b1000000-0000-0000-0000-000000000006',
   'Crunchy, lightly sweetened fried dough snack — made fresh.',
   false, 3),
  ('Nigerian Buns',        'nigerian-buns',       'b1000000-0000-0000-0000-000000000006',
   'Dense, golden-fried dough balls — great as a quick bite.',
   false, 4),
  -- Drinks
  ('Zobo (Hibiscus Drink)','zobo',                'b1000000-0000-0000-0000-000000000007',
   'Refreshing chilled hibiscus flower drink, lightly spiced.',
   true, 1),
  ('Kunu',                 'kunu',                'b1000000-0000-0000-0000-000000000007',
   'A cool, creamy grain-based drink made with millet.',
   false, 2),
  ('Bottled Water',        'bottled-water',       'b1000000-0000-0000-0000-000000000007',
   'Chilled bottled water — always available.',
   false, 3),
  ('Soft Drinks',          'soft-drinks',         'b1000000-0000-0000-0000-000000000007',
   'A selection of chilled carbonated soft drinks.',
   false, 4)
on conflict (slug) do nothing;
