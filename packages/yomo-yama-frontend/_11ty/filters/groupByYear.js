import { DateTime } from 'luxon';
import moduleName from '../helpers/moduleName.js';

const body = (postList) => {
  const yearPosts = {};
  let ret = [];

  postList.forEach((post) => {
    const year = DateTime.fromJSDate(post.date).year;
    yearPosts[year] = yearPosts[year] || [];
    yearPosts[year].push(post);
  });

  const sortedYears = Object.keys(yearPosts).sort().reverse();

  sortedYears.forEach((year) => {
    ret.push({
      year,
      posts: yearPosts[year],
    });
  });

  return ret;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
