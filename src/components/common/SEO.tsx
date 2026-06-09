import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://career.sahabatagro.co.id';
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/sag/hero/sawit-plantation.webp`;
const SITE_NAME = 'PT Sahabat Agro Group Career';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
}

export default function SEO({
  title = 'Career | PT Sahabat Agro Group',
  description = 'Explore career opportunities at PT Sahabat Agro Group. Find job vacancies in plantation, mill, and head office support across Indonesia.',
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title.includes('PT Sahabat Agro Group') ? title : `${title} | PT Sahabat Agro Group`;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  const scripts = jsonLd
    ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {scripts}
    </Helmet>
  );
}
