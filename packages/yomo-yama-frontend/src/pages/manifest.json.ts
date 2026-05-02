import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/utils';
import { siteConfig } from '../lib/site';

export const GET: APIRoute = () => {
  const manifest = {
    name: siteConfig.site.title,
    lang: siteConfig.manifestJson.language,
    short_name: siteConfig.site.title,
    description: siteConfig.site.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: siteConfig.manifestJson.themeColor,
    background_color: siteConfig.manifestJson.backgroundColor,
    orientation: 'any',
    icons: [
      {
        src: absoluteUrl('/icon-192.png'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: absoluteUrl('/icon-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: absoluteUrl('/favicon.svg'),
        sizes: '48x48 72x72 96x96 128x128 150x150 256x256 512x512 1024x1024',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
};

