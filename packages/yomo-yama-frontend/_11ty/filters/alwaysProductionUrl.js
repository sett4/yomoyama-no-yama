import moduleName from '../helpers/moduleName.js';
import siteConfig from '../../content/_data/siteConfig.js';

const body = (path) => new URL(path, siteConfig.site.url);

export default {
  name: moduleName(import.meta.url),
  body,
};
