import normalizeDate from '../../../_11ty/helpers/normalizeDate.js';

export default {
  eleventyComputed: {
    incidentTags: (data) => {
      return [data.post.tag];
    },
    date: (data) => normalizeDate(data.post.latestDate),
  },
};
