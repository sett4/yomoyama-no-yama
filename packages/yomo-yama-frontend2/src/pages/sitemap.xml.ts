import type { APIRoute } from 'astro';
import { getIncidentTags, getIncidentMonths, loadIncidents } from '../lib/incidents';
import { absoluteUrl, escapeHtml } from '../lib/utils';

export const GET: APIRoute = async () => {
  const [incidents, months, tags] = await Promise.all([
    loadIncidents(),
    getIncidentMonths(),
    getIncidentTags(),
  ]);

  const urls = [
    '/',
    '/about.html',
    '/archive/',
    '/incident/',
    '/subscribe/',
    ...incidents.map((post) => post.url),
    ...months.map((month) => `/incident/${month.yearMonth}.html`),
    ...tags.map((tag) => `/incident/tags/${tag.tag}.html`),
  ];

  const uniqueUrls = Array.from(new Set(urls));
  const body = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map((url) => `  <url>
    <loc>${escapeHtml(absoluteUrl(url))}</loc>
  </url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  });
};

