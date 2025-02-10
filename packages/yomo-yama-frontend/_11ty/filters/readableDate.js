import moduleName from '../helpers/moduleName.js';
import formattedDate from '../helpers/formattedDate.js';
import siteConfig from '../../content/_data/siteConfig.js';

const DATE_FORMAT = siteConfig.dateFormats.readable;

const body = (date) => formattedDate(date, DATE_FORMAT);

export default {
  name: moduleName(import.meta.url),
  body,
};
