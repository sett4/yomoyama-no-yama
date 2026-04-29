import { createRequire } from 'node:module';
import type { DbPost } from '@sett4/yomo-yama-db';
import { filterDisplayTags, normalizeDate } from './utils';

const require = createRequire(import.meta.url);
const dbPkg = require('@sett4/yomo-yama-db') as typeof import('@sett4/yomo-yama-db');
const { createDbClient, findPublishedPostsByCategory } = dbPkg;

export type Incident = Omit<DbPost, 'publishedAt' | 'tags'> & {
  publishedAt: Date;
  date: Date;
  tags: string[];
  incidentTags: string[];
  templateContent: string;
  url: string;
};

export type IncidentMonth = {
  yearMonth: string;
  title: string;
  posts: Incident[];
  latestDate: Date;
  date: Date;
};

export type IncidentTag = {
  tag: string;
  posts: Incident[];
  latestDate: Date;
};

let incidentsPromise: Promise<Incident[]> | null = null;

export async function loadIncidents(): Promise<Incident[]> {
  if (!incidentsPromise) {
    incidentsPromise = loadIncidentsFromDb();
  }
  return incidentsPromise;
}

async function loadIncidentsFromDb(): Promise<Incident[]> {
  console.info('[frontend2:incidents] loading incident collection');
  const { client, db } = createDbClient();

  try {
    const records = await findPublishedPostsByCategory(db, 'incident');
    console.info('[frontend2:incidents] incident collection fetched', {
      count: records.length,
    });

    let invalidCount = 0;
    const incidents = records
      .map((record) => transformIncident(record, () => {
        invalidCount += 1;
      }))
      .filter((record): record is Incident => Boolean(record))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    if (invalidCount > 0) {
      console.warn('[frontend2:incidents] skipped incidents with invalid publishedAt', {
        invalidCount,
      });
    }

    console.info('[frontend2:incidents] loaded', incidents.length, 'incidents');
    return incidents;
  } finally {
    client.close();
  }
}

function transformIncident(record: DbPost, onInvalidDate: () => void): Incident | null {
  const date = normalizeDate(record.publishedAt);
  if (!date) {
    onInvalidDate();
    return null;
  }

  const tags = record.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => !tag.startsWith('__'));

  return {
    ...record,
    publishedAt: date,
    date,
    tags: [...tags, 'incident'],
    incidentTags: filterDisplayTags(tags),
    templateContent: record.content || '',
    url: `/incident/${record.slug}.html`,
  };
}

export async function getIncidentMonths(): Promise<IncidentMonth[]> {
  const incidents = await loadIncidents();
  const months = new Map<string, Incident[]>();

  for (const incident of incidents) {
    const yearMonth = incident.date.toISOString().slice(0, 7);
    months.set(yearMonth, [...(months.get(yearMonth) || []), incident]);
  }

  return Array.from(months.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([yearMonth, posts]) => {
      const [year, month] = yearMonth.split('-').map(Number);
      return {
        yearMonth,
        title: yearMonth,
        posts,
        latestDate: posts[0].date,
        date: new Date(Date.UTC(year, month, 0)),
      };
    });
}

export async function getIncidentTags(): Promise<IncidentTag[]> {
  const incidents = await loadIncidents();
  const tags = new Map<string, Incident[]>();

  for (const incident of incidents) {
    for (const tag of incident.incidentTags) {
      tags.set(tag, [...(tags.get(tag) || []), incident]);
    }
  }

  return Array.from(tags.entries())
    .map(([tag, posts]) => ({
      tag,
      posts,
      latestDate: posts[0].date,
    }))
    .filter((tag) => tag.posts.length > 0 && tag.latestDate)
    .sort((a, b) => a.tag.localeCompare(b.tag, 'ja'));
}

export async function getIncidentBySlug(slug: string): Promise<Incident | undefined> {
  const incidents = await loadIncidents();
  return incidents.find((incident) => incident.slug === slug);
}
