import incidents from './incidents.js';
import { DateTime } from 'luxon';
import normalizeDate from '../../_11ty/helpers/normalizeDate.js';

export default async function main() {
  const transformed = await incidents();

  const monthMap = transformed.reduce((acc, cur) => {
    const date = normalizeDate(cur.date || cur.publishedAt);
    if (!date) {
      return acc;
    }

    const yearMonth = date.toISOString().slice(0, 7);
    acc[yearMonth] = acc[yearMonth] || [];
    acc[yearMonth].push(cur);
    return acc;
  }, {});

  const postsByYearMonth = Object.keys(monthMap).map((yearMonth) => {
    return {
      yearMonth,
      posts: monthMap[yearMonth],
      latestDate: monthMap[yearMonth][0]?.date || null,
      date: DateTime.fromISO(yearMonth + '-01')
        .endOf('month')
        .toJSDate(),
    };
  });

  console.log('loaded', postsByYearMonth.length, 'monthList');
  return postsByYearMonth;
}
