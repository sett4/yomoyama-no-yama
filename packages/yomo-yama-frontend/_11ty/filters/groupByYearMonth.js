const { DateTime } = require('luxon');
const moduleName = require('../helpers/moduleName');

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

module.exports = {
  name: moduleName(__filename),
  body,
};
