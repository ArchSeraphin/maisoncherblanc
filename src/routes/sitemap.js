const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const BASE_URL = 'https://maisoncherblanc.fr';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/a-propos', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services', priority: '0.9', changefreq: 'monthly' },
  { loc: '/actualites', priority: '0.8', changefreq: 'weekly' },
  { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
  { loc: '/mentions-legales', priority: '0.3', changefreq: 'yearly' },
];

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [articles] = await pool.execute(
      `SELECT slug, updated_at, published_at
       FROM articles WHERE published = 1
       ORDER BY published_at DESC`
    );

    const now = new Date().toISOString().split('T')[0];

    const staticUrls = STATIC_PAGES.map(p => `
  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

    const articleUrls = articles.map(a => {
      const date = (a.updated_at || a.published_at || new Date()).toISOString().split('T')[0];
      return `
  <url>
    <loc>${BASE_URL}/actualites/${a.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articleUrls}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Erreur sitemap');
  }
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

Sitemap: ${BASE_URL}/sitemap.xml
`);
});

module.exports = router;
