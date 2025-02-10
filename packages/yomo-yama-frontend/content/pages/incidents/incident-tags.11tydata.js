export default {
  eleventyComputed: {
    incidentTags: (data) => {
      // console.log(data);
      return [data.post.tag];
    },
  },
};
