import { Helmet } from 'react-helmet-async';
import { SITE_CONFIG } from '../../config/site';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
}

export function SEO({
  title,
  description = SITE_CONFIG.seo.defaultDescription,
  canonical,
  ogImage = SITE_CONFIG.seo.ogImage,
  ogType = 'website',
  noIndex = false,
}: SEOProps) {
  const pageTitle = title
    ? `${title} | Lord Reigneth Foods`
    : SITE_CONFIG.seo.defaultTitle;

  const canonicalUrl = canonical
    ? `${SITE_CONFIG.url}${canonical}`
    : SITE_CONFIG.url;

  return (
    <Helmet>
      {/* Primary */}
      <html lang="en" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={SITE_CONFIG.seo.keywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${SITE_CONFIG.url}${ogImage}`} />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_CONFIG.url}${ogImage}`} />
    </Helmet>
  );
}

// Structured Data component (Schema.org JSON-LD)
export function RestaurantSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    telephone: SITE_CONFIG.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '13, Old Ondo Benin Road',
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
    servesCuisine: SITE_CONFIG.schema.servesCuisine,
    hasMap: SITE_CONFIG.schema.hasMap,
    founder: {
      '@type': 'Person',
      name: SITE_CONFIG.founder,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
