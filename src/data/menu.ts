import type { MenuItem, MenuCategory } from '../types';

// Image base path — all files live in /public/assets/food/
const F = (name: string) => `/assets/food/${name}`;

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'rice',     label: 'Rice',     description: 'Our signature rice dishes, freshly prepared every day.',              icon: 'Wheat' },
  { id: 'swallow',  label: 'Swallow',  description: 'Traditional Nigerian swallow foods — perfectly pounded.',             icon: 'Circle' },
  { id: 'soups',    label: 'Soups',    description: 'Rich, flavourful soups made from authentic Nigerian recipes.',        icon: 'Soup' },
  { id: 'proteins', label: 'Proteins', description: 'Grilled, peppered and seasoned proteins to complement any meal.',    icon: 'Flame' },
  { id: 'sides',    label: 'Sides',    description: 'Delicious accompaniments to round out your meal.',                    icon: 'UtensilsCrossed' },
  { id: 'snacks',   label: 'Snacks',   description: 'Quick bites and Nigerian street food favourites.',                   icon: 'Cookie' },
  { id: 'drinks',   label: 'Drinks',   description: 'Refreshing drinks to quench your thirst.',                           icon: 'GlassWater' },
];

export const MENU_ITEMS: MenuItem[] = [
  // ── Rice ──────────────────────────────────────────────
  {
    id: 'smoky-jollof-rice',
    name: 'Smoky Jollof Rice',
    description: 'Our signature party-style jollof rice, slow-cooked over firewood for that irresistible smoky flavour. Served with fried plantain.',
    categoryId: 'rice',
    image: F('jollof-rice.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'fried-rice',
    name: 'Fried Rice',
    description: 'Fragrant fried rice with colourful mixed vegetables — a classic favourite for all occasions.',
    categoryId: 'rice',
    image: F('fried-rice.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'white-rice',
    name: 'White Rice',
    description: 'Plain steamed white rice, the perfect base for any sauce or stew.',
    categoryId: 'rice',
    image: F('white-rice.jpg'),
    available: true,
  },
  {
    id: 'ofada-rice',
    name: 'Ofada Rice & Sauce',
    description: 'Local brown rice served with the bold, spicy Ofada pepper sauce — a true Ijebu staple.',
    categoryId: 'rice',
    image: F('ofada.jpg'),
    available: true,
  },

  // ── Swallow ───────────────────────────────────────────
  {
    id: 'pounded-yam',
    name: 'Pounded Yam',
    description: 'Smooth, elastic pounded yam — prepared the traditional way for the perfect stretch and texture.',
    categoryId: 'swallow',
    image: F('pounded-yam.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'eba',
    name: 'Eba (Garri)',
    description: 'Garri swallow — a Nigerian household classic, best enjoyed with a rich soup.',
    categoryId: 'swallow',
    image: F('eba-soup.jpg'),
    available: true,
  },
  {
    id: 'amala',
    name: 'Amala',
    description: 'Dark, smooth yam flour swallow — a Yoruba favourite often paired with gbegiri or ewedu soup.',
    categoryId: 'swallow',
    image: F('amala.jpg'),
    available: true,
  },
  {
    id: 'semo',
    name: 'Semovita',
    description: 'Smooth semolina swallow — light and easy to enjoy with any Nigerian soup.',
    categoryId: 'swallow',
    image: F('semovita.jpg'),
    available: true,
  },

  // ── Soups ─────────────────────────────────────────────
  {
    id: 'egusi-soup',
    name: 'Egusi Soup',
    description: 'Rich, hearty melon seed soup with assorted meats and leafy vegetables — a Nigerian staple.',
    categoryId: 'soups',
    image: F('egusi-soup.jpg'),
    available: true,
  },
  {
    id: 'bitterleaf-soup',
    name: 'Bitterleaf Soup',
    description: 'A bold, flavourful soup with cocoyam thickener, goat meat and fresh fish.',
    categoryId: 'soups',
    image: F('bitterleaf-soup.jpg'),
    available: true,
  },
  {
    id: 'eforiro',
    name: 'Efo Riro',
    description: 'Yoruba-style stewed leafy greens cooked in a rich pepper base with assorted proteins.',
    categoryId: 'soups',
    image: F('efo-riro.jpg'),
    available: true,
  },
  {
    id: 'okra-soup',
    name: 'Okra Soup',
    description: 'Silky, draw okra soup with assorted proteins — pairs beautifully with any swallow.',
    categoryId: 'soups',
    image: F('okra-soup.jpg'),
    available: true,
  },

  // ── Proteins ──────────────────────────────────────────
  {
    id: 'peppered-chicken',
    name: 'Peppered Chicken',
    description: 'Grilled chicken pieces tossed in a bold, spicy Nigerian pepper sauce. Finger-licking good.',
    categoryId: 'proteins',
    image: F('peppered-chicken.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'peppered-snail',
    name: 'Peppered Snail',
    description: 'Tender garden snails prepared in a rich, aromatic pepper sauce — a delicacy and crowd favourite.',
    categoryId: 'proteins',
    image: F('peppered-snail.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'fried-fish',
    name: 'Fried Fish',
    description: 'Crispy, well-seasoned fried fish — golden on the outside and tender on the inside.',
    categoryId: 'proteins',
    image: F('fried-fish.jpg'),
    available: true,
  },
  {
    id: 'assorted-meat',
    name: 'Assorted Meat',
    description: 'A selection of cooked and seasoned assorted meats — perfect as an accompaniment or on its own.',
    categoryId: 'proteins',
    image: F('assorted-meat.jpg'),
    available: true,
  },

  // ── Sides ─────────────────────────────────────────────
  {
    id: 'moin-moin',
    name: 'Moin-Moin',
    description: 'Steamed bean pudding with egg and fish filling — rich, savoury and deeply satisfying.',
    categoryId: 'sides',
    image: F('moi-moi.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'coleslaw',
    name: 'Coleslaw',
    description: 'Fresh, creamy coleslaw — a refreshing side that pairs well with rice dishes.',
    categoryId: 'sides',
    image: F('coalslaw.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'fried-plantain',
    name: 'Fried Plantain (Dodo)',
    description: 'Sweet, caramelised fried plantain slices — an all-time Nigerian favourite side dish.',
    categoryId: 'sides',
    image: F('fried-plantain.jpg'),
    available: true,
  },

  // ── Snacks ────────────────────────────────────────────
  {
    id: 'puff-puff',
    name: 'Puff Puff',
    description: 'Light, fluffy deep-fried dough balls — a beloved Nigerian snack for any time of day.',
    categoryId: 'snacks',
    image: F('puff-puff.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'meat-pie',
    name: 'Meat Pie',
    description: 'Golden pastry filled with well-seasoned minced beef and vegetables — a classic Nigerian snack.',
    categoryId: 'snacks',
    image: F('meat-pie.jpg'),
    available: true,
  },
  {
    id: 'chin-chin',
    name: 'Chin Chin',
    description: 'Crunchy, lightly sweetened fried dough snack — made fresh and available in store.',
    categoryId: 'snacks',
    image: F('chin-chin.jpg'),
    available: true,
  },
  {
    id: 'buns',
    name: 'Nigerian Buns',
    description: 'Dense, golden-fried dough balls with a satisfying crunch — great as a quick bite.',
    categoryId: 'snacks',
    image: F('nigeria-buns.jpg'),
    available: true,
  },

  // ── Drinks ────────────────────────────────────────────
  {
    id: 'zobo',
    name: 'Zobo (Hibiscus Drink)',
    description: 'Refreshing chilled hibiscus flower drink, lightly spiced and naturally sweetened.',
    categoryId: 'drinks',
    image: F('zobo.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'kunu',
    name: 'Kunu',
    description: 'A cool, creamy grain-based drink made with millet — a northern Nigerian favourite.',
    categoryId: 'drinks',
    image: F('kunu-drink.jpg'),
    available: true,
  },
  {
    id: 'bottled-water',
    name: 'Bottled Water',
    description: 'Chilled bottled water — always available.',
    categoryId: 'drinks',
    image: F('bottle-water.jpg'),
    available: true,
  },
  {
    id: 'soft-drinks',
    name: 'Soft Drinks',
    description: 'A selection of chilled carbonated soft drinks.',
    categoryId: 'drinks',
    image: F('soft-drinks.jpg'),
    available: true,
  },
];

export const FEATURED_ITEMS = MENU_ITEMS.filter((item) => item.featured);
