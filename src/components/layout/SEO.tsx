import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../../config/site';

// ── Per-page SEO props ────────────────────────────────────
interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
  /** Extra keywords merged with global keywords */
  keywords?: string;
}

export function SEO({
  title,
  description = SITE_CONFIG.seo.defaultDescription,
  canonical,
  ogImage = SITE_CONFIG.seo.ogImage,
  ogType = 'website',
  noIndex = false,
  keywords,
}: SEOProps) {
  const pageTitle    = title
    ? `${title} | Lord Reigneth Foods`
    : SITE_CONFIG.seo.defaultTitle;

  const canonicalUrl = canonical
    ? `${SITE_CONFIG.url}${canonical}`
    : SITE_CONFIG.url;

  const allKeywords = keywords
    ? `${SITE_CONFIG.seo.keywords}, ${keywords}`
    : SITE_CONFIG.seo.keywords;

  const ogImageUrl = ogImage.startsWith('http')
    ? ogImage
    : `${SITE_CONFIG.url}${ogImage}`;

  return (
    <Helmet>
      {/* ── Language & encoding ── */}
      <html lang="en-NG" />
      <meta charSet="UTF-8" />

      {/* ── Primary meta ── */}
      <title>{pageTitle}</title>
      <meta name="description"  content={description} />
      <meta name="keywords"     content={allKeywords} />
      <meta name="author"       content={SITE_CONFIG.name} />
      <meta name="robots"       content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="theme-color"  content="#1a4a2e" />

      {/* ── Canonical ── */}
      <link rel="canonical" href={canonicalUrl} />

      {/* ── Sitemap hint (helps crawlers discover it) ── */}
      <link rel="sitemap" type="application/xml" title="Sitemap"
            href={`${SITE_CONFIG.url}/sitemap.xml`} />

      {/* ── Open Graph ── */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:title"       content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={ogImageUrl} />
      <meta property="og:image:alt"   content={`${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`} />
      <meta property="og:site_name"   content={SITE_CONFIG.name} />
      <meta property="og:locale"      content="en_NG" />

      {/* ── Twitter / X ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImageUrl} />
      <meta name="twitter:image:alt"   content={`${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`} />

      {/* ── Geo targeting (helps local SEO in Nigeria) ── */}
      <meta name="geo.region"      content="NG-OG" />
      <meta name="geo.placename"   content="Ijebu Ode, Ogun State, Nigeria" />
      <meta name="ICBM"            content="6.8181, 3.9189" />
    </Helmet>
  );
}

// ── Restaurant JSON-LD (homepage) ─────────────────────────
export function RestaurantSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_CONFIG.url}/#restaurant`,
    name: SITE_CONFIG.name,
    alternateName: 'Lord Reigneth',
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/lord-reigneth-logo.jpg`,
    image: `${SITE_CONFIG.url}/lord-reigneth-logo.jpg`,
    telephone: SITE_CONFIG.contact.phone,
    email: '',
    foundingDate: '2001',
    founder: {
      '@type': 'Person',
      name: SITE_CONFIG.founder,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '13, Old Ondo Benin Road',
      addressLocality: 'Ijebu Ode',
      addressRegion: 'Ogun State',
      postalCode: '',
      addressCountry: 'NG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 6.8181,
      longitude: 3.9189,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday',
          'Thursday', 'Friday', 'Saturday',
        ],
        opens: '07:00',
        closes: '21:00',
      },
    ],
    servesCuisine: ['Nigerian', 'African', 'West African'],
    hasMenu: `${SITE_CONFIG.url}/menu`,
    menu: `${SITE_CONFIG.url}/menu`,
    acceptsReservations: false,
    hasMap: `https://maps.google.com/?q=13+Old+Ondo+Benin+Road+Ijebu+Ode`,
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.tiktok,
    ],
    potentialAction: {
      '@type': 'OrderAction',
      target: `${SITE_CONFIG.url}/order`,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema, null, 2)}</script>
    </Helmet>
  );
}

// ── Breadcrumb JSON-LD (inner pages) ─────────────────────
interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_CONFIG.url,
      },
      ...items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 2,
        name: item.name,
        item: `${SITE_CONFIG.url}${item.href}`,
      })),
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ── Local Business JSON-LD for Locations page ─────────────
export function LocationsSchema() {
  const locations = [
    {
      name: 'Lord Reigneth Foods — Main Outlet',
      address: '13, Old Ondo Benin Road, Ijebu Ode, Ogun State',
      url: `${SITE_CONFIG.url}/locations`,
    },
    {
      name: 'Lord Reigneth Foods — Lagos Garage',
      address: 'Lagos Garage, Ijebu Ode, Ogun State',
      url: `${SITE_CONFIG.url}/locations`,
    },
    {
      name: 'Lord Reigneth Foods — Ilese Outlet',
      address: 'Ilese, Ijebu Area, Ogun State',
      url: `${SITE_CONFIG.url}/locations`,
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Lord Reigneth Foods Locations',
    itemListElement: locations.map((loc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Restaurant',
        name: loc.name,
        telephone: SITE_CONFIG.contact.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: loc.address,
          addressLocality: 'Ijebu Ode',
          addressRegion: 'Ogun State',
          addressCountry: 'NG',
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '07:00',
            closes: '21:00',
          },
        ],
        url: loc.url,
        servesCuisine: 'Nigerian',
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ── FAQ JSON-LD for Catering page ─────────────────────────
export function CateringFAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does Lord Reigneth Foods provide outdoor catering?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Lord Reigneth Foods provides outdoor catering for weddings, birthdays, corporate events, and all celebrations in the Ijebu Ode area and beyond.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I book catering with Lord Reigneth Foods?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Submit a catering enquiry at ${SITE_CONFIG.url}/catering or WhatsApp us directly at ${SITE_CONFIG.contact.phone}.`,
        },
      },
      {
        '@type': 'Question',
        name: 'What type of food does Lord Reigneth Foods serve?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We serve authentic Nigerian meals including Jollof Rice, Pounded Yam, Egusi Soup, Peppered Chicken, Moin-Moin, and many more. All food is freshly prepared daily.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is Lord Reigneth Foods located?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We have three locations: Main Outlet at 13, Old Ondo Benin Road, Ijebu Ode; Lagos Garage, Ijebu Ode; and Ilese Outlet. Open Monday–Saturday, 7:00 AM–9:00 PM.',
        },
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
