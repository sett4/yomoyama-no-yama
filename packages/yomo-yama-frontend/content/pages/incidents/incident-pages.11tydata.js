import normalizeDate from '../../../_11ty/helpers/normalizeDate.js';

export default {
  eleventyComputed: {
    title: (data) => {
      return data.post.title;
    },
    incidentTags: (data) => {
      if (data.post.tags) {
        return [...new Set(data.post.tags)];
      }
      return [];
    },
    date: (data) => normalizeDate(data.post.publishedAt),
  },
};
