import incidents from './incidents.js';
import normalizeDate from '../../_11ty/helpers/normalizeDate.js';

export default async function main() {
  const transformed = await incidents();

  const tagMap = transformed.reduce((acc, cur) => {
    cur.tags.map((tag) => {
      acc[tag] = acc[tag] || [];
      acc[tag].push(cur);
    });
    return acc;
  }, {});

  const tags = Object.keys(tagMap).map((tag) => {
    const posts = tagMap[tag].filter((post) => normalizeDate(post.date));
    const latestDate = posts.reduce((latest, post) => {
      const date = normalizeDate(post.date);
      if (!date) {
        return latest;
      }
      if (!latest || date.getTime() > latest.getTime()) {
        return date;
      }
      return latest;
    }, null);

    return {
      tag,
      posts,
      latestDate,
    };
  }).filter((tag) => tag.posts.length > 0 && tag.latestDate);
  console.log('loaded', tags.length, 'tags.');
  return tags;
}
