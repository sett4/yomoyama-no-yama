import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/utils';

export const GET: APIRoute = () =>
  new Response(`User-agent: *
Disallow:

Sitemap: ${absoluteUrl('/sitemap.xml')}
`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  });
