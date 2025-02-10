import moduleName from '../helpers/moduleName.js';
import { minify as minifyXML } from 'minify-xml';
import { IS_PRODUCTION } from '../constants.js';

const XML_MINIFIER_OPTIONS = {
  trimWhitespaceFromTexts: true,
  collapseWhitespaceInTexts: true,
};

const body = (content, outputPath) => {
  if (IS_PRODUCTION && outputPath && outputPath.endsWith('.xml')) {
    return minifyXML(content, XML_MINIFIER_OPTIONS);
  }
  return content;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
