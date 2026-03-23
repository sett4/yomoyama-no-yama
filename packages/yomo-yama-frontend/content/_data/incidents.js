import dbPkg from '@sett4/yomo-yama-db';
import { INCIDENT_COLLECTION_TAG_NAME } from '../../_11ty/constants.js';

const { createDbClient, findPublishedPostsByCategory } = dbPkg;

export default async function main() {
  console.info('[incidents] loading incident collection');
  const { client, db } = createDbClient();
  const incidents = await findPublishedPostsByCategory(db, 'incident');
  console.info('[incidents] incident collection fetched', {
    count: incidents.length,
  });

  const transformed = incidents.map((i) => {
    const tags = i.tags.split(',').filter((tag) => !tag.startsWith('__'));
    tags.push(INCIDENT_COLLECTION_TAG_NAME);
    return {
      templateContent: i.content,
      url: '/incident/' + i.slug,
      ...i,
      tags: tags,
      date: i.publishedAt,
    };
  });


  // transformed.forEach((i) => {
  //   console.log(i.publishedDate, '-');
  // });
  console.log('loaded', incidents.length, 'incidents');
  client.close();
  return transformed;
}
