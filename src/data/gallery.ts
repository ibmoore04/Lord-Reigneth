import type { GalleryItem, GalleryCategory } from '../types';

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  { id: 'food',             label: 'Food' },
  { id: 'restaurant',       label: 'Restaurant' },
  { id: 'catering',         label: 'Catering' },
  { id: 'events',           label: 'Events' },
  { id: 'behind-the-scenes',label: 'Behind the Scenes' },
];

const F = (name: string) => `/assets/food/${name}`;

export const GALLERY_ITEMS: GalleryItem[] = [
  // ── Food ──────────────────────────────────────────────
  { id: 'g-jollof',     src: F('jollof-rice.jpg'),      alt: 'Smoky Jollof Rice at Lord Reigneth Foods',             categoryId: 'food',    aspectRatio: 'landscape', caption: 'Our signature smoky Jollof Rice' },
  { id: 'g-fried-rice', src: F('fried-rice.jpg'),        alt: 'Nigerian Fried Rice at Lord Reigneth Foods',           categoryId: 'food',    aspectRatio: 'square',    caption: 'Colourful Fried Rice' },
  { id: 'g-pounded',    src: F('pounded-yam.jpg'),       alt: 'Pounded Yam at Lord Reigneth Foods',                   categoryId: 'food',    aspectRatio: 'square',    caption: 'Pounded Yam' },
  { id: 'g-egusi',      src: F('egusi-soup.jpg'),        alt: 'Egusi Soup at Lord Reigneth Foods',                    categoryId: 'food',    aspectRatio: 'square',    caption: 'Rich Egusi Soup' },
  { id: 'g-pepchicken', src: F('peppered-chicken.jpg'),  alt: 'Peppered Chicken at Lord Reigneth Foods',              categoryId: 'food',    aspectRatio: 'landscape', caption: 'Peppered Chicken — a crowd favourite' },
  { id: 'g-pepsnail',   src: F('peppered-snail.jpg'),    alt: 'Peppered Snail at Lord Reigneth Foods',                categoryId: 'food',    aspectRatio: 'square',    caption: 'Peppered Snail' },
  { id: 'g-moimoi',     src: F('moi-moi.jpg'),           alt: 'Moin-Moin at Lord Reigneth Foods',                     categoryId: 'food',    aspectRatio: 'portrait',  caption: 'Fresh Moin-Moin' },
  { id: 'g-amala',      src: F('amala.jpg'),             alt: 'Amala at Lord Reigneth Foods',                         categoryId: 'food',    aspectRatio: 'square',    caption: 'Amala' },
  { id: 'g-efo',        src: F('efo-riro.jpg'),          alt: 'Efo Riro at Lord Reigneth Foods',                      categoryId: 'food',    aspectRatio: 'landscape', caption: 'Efo Riro' },
  { id: 'g-okra',       src: F('okra-soup.jpg'),         alt: 'Okra Soup at Lord Reigneth Foods',                     categoryId: 'food',    aspectRatio: 'square',    caption: 'Okra Soup' },
  { id: 'g-bitterleaf', src: F('bitterleaf-soup.jpg'),   alt: 'Bitterleaf Soup at Lord Reigneth Foods',               categoryId: 'food',    aspectRatio: 'square',    caption: 'Bitterleaf Soup' },
  { id: 'g-coleslaw',   src: F('coalslaw.jpg'),          alt: 'Coleslaw at Lord Reigneth Foods',                      categoryId: 'food',    aspectRatio: 'square',    caption: 'Fresh Coleslaw' },
  { id: 'g-plantain',   src: F('fried-plantain.jpg'),    alt: 'Fried Plantain (Dodo) at Lord Reigneth Foods',         categoryId: 'food',    aspectRatio: 'landscape', caption: 'Fried Plantain (Dodo)' },
  { id: 'g-puffpuff',   src: F('puff-puff.jpg'),         alt: 'Puff Puff at Lord Reigneth Foods',                     categoryId: 'food',    aspectRatio: 'square',    caption: 'Puff Puff' },
  { id: 'g-meatpie',    src: F('meat-pie.jpg'),          alt: 'Meat Pie at Lord Reigneth Foods',                      categoryId: 'food',    aspectRatio: 'square',    caption: 'Meat Pie' },
  { id: 'g-chinchin',   src: F('chin-chin.jpg'),         alt: 'Chin Chin at Lord Reigneth Foods',                     categoryId: 'food',    aspectRatio: 'square',    caption: 'Chin Chin' },
  { id: 'g-buns',       src: F('nigeria-buns.jpg'),      alt: 'Nigerian Buns at Lord Reigneth Foods',                 categoryId: 'food',    aspectRatio: 'square',    caption: 'Nigerian Buns' },
  { id: 'g-zobo',       src: F('zobo.jpg'),              alt: 'Zobo Drink at Lord Reigneth Foods',                    categoryId: 'food',    aspectRatio: 'portrait',  caption: 'Zobo (Hibiscus Drink)' },
  { id: 'g-kunu',       src: F('kunu-drink.jpg'),        alt: 'Kunu Drink at Lord Reigneth Foods',                    categoryId: 'food',    aspectRatio: 'portrait',  caption: 'Kunu' },
  { id: 'g-softdrinks', src: F('soft-drinks.jpg'),       alt: 'Soft Drinks at Lord Reigneth Foods',                   categoryId: 'food',    aspectRatio: 'landscape', caption: 'Refreshing Drinks' },
  { id: 'g-offada',     src: F('ofada.jpg'),             alt: 'Ofada Rice & Sauce at Lord Reigneth Foods',            categoryId: 'food',    aspectRatio: 'square',    caption: 'Ofada Rice & Sauce' },
  { id: 'g-eba',        src: F('eba-soup.jpg'),          alt: 'Eba at Lord Reigneth Foods',                           categoryId: 'food',    aspectRatio: 'square',    caption: 'Eba (Garri)' },
  { id: 'g-semovita',   src: F('semovita.jpg'),          alt: 'Semovita at Lord Reigneth Foods',                      categoryId: 'food',    aspectRatio: 'square',    caption: 'Semovita' },
  { id: 'g-whiterice',  src: F('white-rice.jpg'),        alt: 'White Rice at Lord Reigneth Foods',                    categoryId: 'food',    aspectRatio: 'square',    caption: 'Steamed White Rice' },
  { id: 'g-friedfish',  src: F('fried-fish.jpg'),        alt: 'Fried Fish at Lord Reigneth Foods',                    categoryId: 'food',    aspectRatio: 'landscape', caption: 'Fried Fish' },
  { id: 'g-assorted',   src: F('assorted-meat.jpg'),     alt: 'Assorted Meat at Lord Reigneth Foods',                 categoryId: 'food',    aspectRatio: 'square',    caption: 'Assorted Meat' },
  { id: 'g-water',      src: F('bottle-water.jpg'),      alt: 'Bottled Water at Lord Reigneth Foods',                 categoryId: 'food',    aspectRatio: 'portrait',  caption: 'Bottled Water' },
];
