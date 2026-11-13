import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Page from '../models/Page.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getRobotsTxt = (req, res) => {
  const host = req.get('host') || 'buildmart.in';
  const protocol = req.protocol || 'https';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /checkout
Disallow: /account

Sitemap: ${protocol}://${host}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  return res.status(200).send(robots);
};

export const getSitemapXml = asyncHandler(async (req, res) => {
  const host = req.get('host') || 'buildmart.in';
  const protocol = req.protocol || 'https';
  const baseUrl = `${protocol}://${host}`;

  const [products, categories, pages] = await Promise.all([
    Product.find({ isActive: true, deletedAt: null }).select('slug updatedAt').lean(),
    Category.find({ isActive: true }).select('name slug updatedAt').lean(),
    Page.find({ isPublished: true }).select('slug updatedAt').lean()
  ]);

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/products`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/bulk-enquiry`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/labour-booking`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/track-order`, priority: '0.7', changefreq: 'daily' },
    { loc: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/faq`, priority: '0.7', changefreq: 'weekly' },
    { loc: `${baseUrl}/about`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/privacy-policy`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/terms-and-conditions`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/refund-and-return-policy`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/shipping-and-delivery-policy`, priority: '0.5', changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  staticUrls.forEach(u => {
    xml += `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>\n`;
  });

  categories.forEach(c => {
    const slug = c.slug || encodeURIComponent(c.name);
    xml += `  <url>
    <loc>${baseUrl}/products?category=${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  });

  products.forEach(p => {
    const pSlug = p.slug || p._id;
    const lastmod = p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : '';
    xml += `  <url>
    <loc>${baseUrl}/p/${pSlug}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  });

  pages.forEach(pg => {
    xml += `  <url>
    <loc>${baseUrl}/${pg.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>\n`;
  });

  xml += `</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(xml);
});

export default {
  getRobotsTxt,
  getSitemapXml
};

