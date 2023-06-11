// Using custom slug filter to ensure configurability
// and backwards compatibility with existing permalinks

const slugify = require('slugify');
const moduleName = require('../helpers/moduleName');
const { SLUGIFY_CONFIG } = require('../constants');

const body = (input) => {
  if (typeof input !== 'string' || input instanceof String) {
    console.log(input);
  }
  const slug = slugify(input, SLUGIFY_CONFIG);

  return slug;
};

module.exports = {
  name: moduleName(__filename),
  body,
};
