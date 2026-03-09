export async function GET() {
  const base = 'https://app.aureussocial.be';
  const pages = ['', '/vitrine', '/vitrine#independant', '/vitrine#employeur', '/vitrine#employeurs', '/vitrine#experts', '/vitrine#formations', '/vitrine#contact', '/login'];
  const langs = ['fr', 'nl', 'en', 'de'];
  const now = new Date().toISOString();

  const urls = pages.map(p => `
  <url>
    <loc>${base}${p}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p === '' || p === '/vitrine' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${p === '' || p === '/vitrine' ? '1.0' : '0.8'}</priority>
    ${langs.map(l => `<xhtml:link rel="alternate" hreflang="${l}-BE" href="${base}${p}?lang=${l}"/>`).join('\n    ')}
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=86400' } });
}
