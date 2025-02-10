import moduleName from '../helpers/moduleName.js';

const body = (array, limit) => array.slice(-limit);

export default {
  name: moduleName(import.meta.url),
  body,
};
