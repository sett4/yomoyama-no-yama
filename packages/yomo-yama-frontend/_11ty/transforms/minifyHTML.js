import moduleName from '../helpers/moduleName.js';
import { minify as TerserHTML } from 'html-minifier-terser';
import { IS_PRODUCTION } from '../constants.js';

const HTML_MINIFIER_OPTIONS = {
  useShortDoctype: false,
  removeComments: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true,
  removeEmptyAttributes: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
};

const body = (content, outputPath) => {
  if (IS_PRODUCTION && outputPath && outputPath.endsWith('.html')) {
    return TerserHTML(content, HTML_MINIFIER_OPTIONS);
  }
  return content;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
