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
    date: (data) => data.post.publishedDate,
  },
};
