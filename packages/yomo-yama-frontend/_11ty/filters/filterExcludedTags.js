import moduleName from '../helpers/moduleName.js';
import { EXCLUDED_TAGS } from '../constants.js';

const body = (tagArray) =>
  tagArray.filter((tag) => !EXCLUDED_TAGS.includes(tag));

export default {
  name: moduleName(import.meta.url),
  body,
};
