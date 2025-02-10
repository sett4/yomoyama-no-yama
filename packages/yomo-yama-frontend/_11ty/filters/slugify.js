// Using custom slug filter to ensure configurability
// and backwards compatibility with existing permalinks

import slugify from 'slugify';
import moduleName from '../helpers/moduleName.js';
import { SLUGIFY_CONFIG } from '../constants.js';

const body = (input) => {
  if (typeof input !== 'string' || input instanceof String) {
    console.log(input);
  }
  const slug = slugify(input, SLUGIFY_CONFIG);

  return slug;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
