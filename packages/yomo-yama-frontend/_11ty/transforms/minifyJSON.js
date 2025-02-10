import jsonminify from 'jsonminify';
import { IS_PRODUCTION } from '../constants.js';
import moduleName from '../helpers/moduleName.js';

const body = (content, outputPath) => {
  if (IS_PRODUCTION && outputPath && outputPath.endsWith('.json')) {
    return jsonminify(content);
  }
  return content;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
