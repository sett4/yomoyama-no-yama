module.exports = {
  eleventyComputed: {
    title: (data) => {
      return data.post.data.title;
    },
    incidentTags: (data) => {
      if (data.post.tags) {
        return [...new Set(data.post.tags)];
      }
      return [];
    },
    date: (data) => {
      return data.post.data.date;
    },
  },
};
