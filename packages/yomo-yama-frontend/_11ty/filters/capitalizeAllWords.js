import moduleName from '../helpers/moduleName.js';

const body = (str) =>
  str
    .split(' ')
    .map((word) => word[0].toUpperCase() + word.substring(1))
    .join(' ');

export default {
  name: moduleName(import.meta.url),
  body,
};
