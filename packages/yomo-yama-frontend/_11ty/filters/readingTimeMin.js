import moduleName from '../helpers/moduleName.js';

const ASSUMED_WORDS_PER_MINUTE = 200;

const body = (wordCount) => Math.ceil(wordCount / ASSUMED_WORDS_PER_MINUTE);

export default {
  name: moduleName(import.meta.url),
  body,
};
