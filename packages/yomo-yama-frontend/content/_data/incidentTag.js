import incidents from './incidents.js';

export default async function main() {
  // ... you will write your Prisma Client queries here
  const transformed = await incidents();

  const tagMap = transformed.reduce((acc, cur) => {
    cur.tags.map((tag) => {
      acc[tag] = acc[tag] || [];
      acc[tag].push(cur);
    });
    return acc;
  }, {});

  const tags = Object.keys(tagMap).map((tag) => {
    return {
      tag,
      posts: tagMap[tag],
    };
  });
  console.log('loaded', tags.length, 'tags.');
  return tags;
}
