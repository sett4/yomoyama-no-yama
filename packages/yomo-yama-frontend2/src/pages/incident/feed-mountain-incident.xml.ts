import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { loadIncidents } from '../../lib/incidents';
import { siteConfig } from '../../lib/site';
import { absoluteUrl, excerpt } from '../../lib/utils';

export const GET: APIRoute = async (context) => {
  const incidents = await loadIncidents();
  const feedConfig = siteConfig.feed.incidents;

  return rss({
    title: `${siteConfig.site.title} ${feedConfig.title}`,
    description: siteConfig.site.description,
    site: context.site || siteConfig.site.url,
    items: incidents.slice(0, feedConfig.limit).map((post) => ({
      title: post.title,
      pubDate: post.date,
      link: post.url,
      description: excerpt(post.templateContent),
      content: `<p>${post.content || ''}</p><p><a href="${absoluteUrl(post.url)}">Keep reading on ${siteConfig.site.title} →</a></p>`,
    })),
  });
};

