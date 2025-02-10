import { DateTime } from 'luxon';
import moduleName from '../helpers/moduleName.js';

const body = (postList) => {
  const yearMonthPosts = {};
  let ret = [];

  postList.forEach((post) => {
    const yearMonth = DateTime.fromJSDate(post.date, { zone: 'utc' }).toFormat(
      'yyyy-MM'
    );
    yearMonthPosts[yearMonth] = yearMonthPosts[yearMonth] || [];
    yearMonthPosts[yearMonth].push(post);
  });

  const sortedYears = Object.keys(yearMonthPosts).sort().reverse();

  sortedYears.forEach((yearMonth) => {
    ret.push({
      yearMonth,
      posts: yearMonthPosts[yearMonth],
    });
  });

  return ret;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
