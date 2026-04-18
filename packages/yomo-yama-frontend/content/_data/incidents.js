import dbPkg from '@sett4/yomo-yama-db';
import { INCIDENT_COLLECTION_TAG_NAME } from '../../_11ty/constants.js';
import normalizeDate from '../../_11ty/helpers/normalizeDate.js';

const { createDbClient, findPublishedPostsByCategory } = dbPkg;

export default async function main() {
  console.info('[incidents] loading incident collection');
  const { client, db } = createDbClient();
  const incidents = await findPublishedPostsByCategory(db, 'incident');
  console.info('[incidents] incident collection fetched', {
    count: incidents.length,
  });

  let invalidCount = 0;
  const transformed = incidents
    .map((i) => {
      const date = normalizeDate(i.publishedAt);
      if (!date) {
        invalidCount += 1;
        return null;
      }

      const tags = i.tags.split(',').filter((tag) => !tag.startsWith('__'));
      tags.push(INCIDENT_COLLECTION_TAG_NAME);
      return {
        templateContent: i.content,
        url: '/incident/' + i.slug,
        ...i,
        publishedAt: date,
        tags,
        date,
      };
    })
    .filter(Boolean);

  if (invalidCount > 0) {
    console.warn('[incidents] skipped incidents with invalid publishedAt', {
      invalidCount,
    });
  }

  console.log('loaded', incidents.length, 'incidents');
  client.close();
  return transformed;
}
