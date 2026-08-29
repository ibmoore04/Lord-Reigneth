// ============================================================
// Central site configuration for Lord Reigneth Foods
// All brand-level constants live here — update one file,
// and changes propagate to the entire application.
// ============================================================

export const SITE_CONFIG = {
  name: 'Lord Reigneth Foods',
  tagline: 'Simply Delicious!',
  description:
    'Lord Reigneth Foods — Over 25 years of serving Ijebu Ode with authentic Nigerian meals, snacks, drinks and outdoor catering.',
  url: 'https://lordreignethfoods.com',
  founder: 'Deaconess Comfort Agoro',
  yearsOfService: 25,

  contact: {
    phone: '+234 705 335 7203',
    phoneRaw: '+2347053357203',   // For tel: links — no spaces
    whatsapp: '2347053357203',    // For wa.me links — no + prefix
    whatsappMessage: 'Hello Lord Reigneth Foods, I would like to place an order.',
  },

  address: {
    main: '13, Old Ondo Benin Road, Ijebu Ode, Ogun State',
    city: 'Ijebu Ode',
    state: 'Ogun State',
    country: 'Nigeria',
  },

  hours: {
    weekdays: 'Monday – Saturday: 7:00 AM – 9:00 PM',
    weekend: 'Sunday: Closed',
    openDays: 'Mon – Sat',
    openTime: '7:00 AM',
    closeTime: '9:00 PM',
  },

  social: {
    instagram: 'https://www.instagram.com/lordreignethfoods',
    tiktok:    'https://www.tiktok.com/@lordreignethfoods',
    whatsapp:  'https://wa.me/2347053357203',
  },

  seo: {
    titleTemplate:      '%s | Lord Reigneth Foods',
    defaultTitle:       'Lord Reigneth Foods | Simply Delicious! | Ijebu Ode',
    defaultDescription: 'Lord Reigneth Foods — a trusted Nigerian restaurant in Ijebu Ode with 25+ years of serving authentic local meals, snacks, drinks, and outdoor catering for events.',
    keywords:           'Lord Reigneth Foods, Nigerian restaurant, Ijebu Ode restaurant, catering Ijebu Ode, jollof rice, Nigerian food, outdoor catering Ogun State',
    ogImage:            '/og-image.jpg',
  },

  schema: {
    type:         'Restaurant',
    priceRange:   undefined, // Not provided — do not fabricate
    servesCuisine:'Nigerian',
    hasMap:       'https://maps.google.com/?q=Ijebu+Ode,+Ogun+State,+Nigeria',
  },
} as const;

/** Build a WhatsApp deep-link with optional pre-filled message. */
export function getWhatsAppLink(message?: string): string {
  const msg = encodeURIComponent(message ?? SITE_CONFIG.contact.whatsappMessage);
  return `https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${msg}`;
}

/** Build a tel: link for the main contact phone. */
export function getTelLink(): string {
  return `tel:${SITE_CONFIG.contact.phoneRaw}`;
}
