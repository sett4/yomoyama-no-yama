import incidents from './incidents.js';
import { DateTime } from 'luxon';

export default async function main() {
  // ... you will write your Prisma Client queries here
  const transformed = await incidents();

  const monthMap = transformed.reduce((acc, cur) => {
    const date = new Date(cur.publishedAt);
    const yearMonth = date.toISOString().slice(0, 7);
    acc[yearMonth] = acc[yearMonth] || [];
    acc[yearMonth].push(cur);
    return acc;
  }, {});

  const postsByYearMonth = Object.keys(monthMap).map((yearMonth) => {
    return {
      yearMonth,
      posts: monthMap[yearMonth],
      date: DateTime.fromISO(yearMonth + '-01')
        .endOf('month')
        .toJSDate(),
    };
  });

  // console.log(monthList);
  console.log('loaded', postsByYearMonth.length, 'monthList');
  // console.log(postsByYearMonth[0].posts);
  return postsByYearMonth;
}
