import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title,
  description = 'Direct site procurement and express delivery of certified cement, TMT steel rebars, tiles, plumbing, and construction materials.',
  canonical,
  image = '/placeholder-material.svg',
  type = 'website',
  jsonLd = null
}) {
  const siteTitle = 'BuildMart | Direct Site Procurement & Express Construction Materials';
  const fullTitle = title ? `${title} | BuildMart` : siteTitle;
  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : 'https://buildmart.in');
  const fullImageUrl = image.startsWith('http') ? image : `https://buildmart.in${image}`;

  return (
    <Helmet>
      {/* Primary HTML Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="BuildMart" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Structured JSON-LD Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

