import normalizeDate from '../../../_11ty/helpers/normalizeDate.js';

export default {
  eleventyComputed: {
    title: (data) => {
      return '山岳事故 ' + data.post.yearMonth;
    },
    incidentTags: (data) => {
      if (data.post.tags) {
        return [...new Set(data.post.tags)];
      }
      return [];
    },
    date: (data) => normalizeDate(data.post.latestDate || data.post.date),
  },
};
