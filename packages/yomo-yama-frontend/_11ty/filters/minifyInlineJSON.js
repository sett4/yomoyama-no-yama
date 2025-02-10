import jsonminify from 'jsonminify';
import moduleName from '../helpers/moduleName.js';
import { IS_PRODUCTION } from '../constants.js';

const body = (content) => {
  if (!IS_PRODUCTION) {
    return content;
  }
  return jsonminify(content);
};

export default {
  name: moduleName(import.meta.url),
  body,
};
