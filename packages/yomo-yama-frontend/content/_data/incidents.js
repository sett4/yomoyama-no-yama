const { PrismaClient } = require('@prisma/client');
// const { createContext } = require('@sett4/yomo-yama-prisma-client');

const prisma = new PrismaClient();

function truncateString(str, num) {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + '...';
}

module.exports = async function main() {
  // ... you will write your Prisma Client queries here
  const incidents = await prisma.post.findMany({
    where: { published: true, category: { name: 'incident' } },
    orderBy: { publishedAt: 'desc' },
    // take: 100,
  });

  const transformed = incidents.map((i) => {
    return {
      templateContent: i.content,
      url: '/incident/' + i.slug,
      data: {
        date: i.publishedAt,
        title: i.title,
        slug: i.slug,
      },
      ...i,
      tags: i.tags.split(','),
    };
  });

  console.log('loaded', incidents.length, 'incidents');
  prisma.$disconnect();
  return transformed;
};
