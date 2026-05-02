import { siteConfig } from './site';

const excludedTags = new Set([
  'all',
  'post',
  'page',
  'publishedItems',
  'publishedPages',
  'publishedPosts',
  'tagList',
  'categoryIncident',
  'incident',
]);

export function normalizeDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const timestamp = value > 9999999999 ? value : value * 1000;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.site.url).toString();
}

export function filterDisplayTags(tags: string[]): string[] {
  return tags.filter((tag) => !excludedTags.has(tag) && !tag.startsWith('__'));
}

export function excerpt(content: string | null | undefined): string {
  const source = content || '';
  const firstLine = source.slice(0, source.indexOf('\n') >= 0 ? source.indexOf('\n') : source.length);
  const text = firstLine.replace(/(<([^>]+)>)/gi, '').trim();
  const max = text.length > 140 ? 140 : text.length;
  return `${text.substring(0, max)}…`;
}

export function groupByDate<T extends { date: Date }>(items: T[]) {
  const grouped = new Map<string, T[]>();
  for (const item of items) {
    const key = formatDate(item.date);
    grouped.set(key, [...(grouped.get(key) || []), item]);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, posts]) => ({ date, posts }));
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function htmlToText(value: string | null | undefined): string {
  return (value || '').replace(/<[^>]*>/g, '').trim();
}

export function makeDescription(value: string | null | undefined, fallback = siteConfig.site.description): string {
  const text = htmlToText(value);
  if (!text) return fallback;
  return text.length > 140 ? text.slice(0, 140) : text;
}

