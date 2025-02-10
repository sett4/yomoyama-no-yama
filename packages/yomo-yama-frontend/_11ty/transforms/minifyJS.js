import moduleName from '../helpers/moduleName.js';
import { minify } from 'terser';
import { IS_PRODUCTION } from '../constants.js';

const JS_MINIFIER_OPTIONS = {
  mangle: true,
};

const body = async (content, outputPath) => {
  if (IS_PRODUCTION && outputPath && outputPath.endsWith('.js')) {
    const minified = await minify(content, JS_MINIFIER_OPTIONS);
    return minified.code;
  } else {
    return content;
  }
};

export default {
  name: moduleName(import.meta.url),
  body,
};
