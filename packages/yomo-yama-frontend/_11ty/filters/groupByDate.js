import { DateTime } from 'luxon';
import moduleName from '../helpers/moduleName.js';

const body = (postList) => {
  const yearMonthPosts = {};
  let ret = [];

  postList.forEach((post) => {
    const date = DateTime.fromJSDate(post.date || post.data.date, {
      zone: 'utc',
    }).toFormat('yyyy-MM-dd');
    yearMonthPosts[date] = yearMonthPosts[date] || [];
    yearMonthPosts[date].push(post);
  });

  const sortedYears = Object.keys(yearMonthPosts).sort().reverse();

  sortedYears.forEach((date) => {
    ret.push({
      date,
      posts: yearMonthPosts[date],
    });
  });

  return ret;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
