import moduleName from '../helpers/moduleName.js';
import formattedDate from '../helpers/formattedDate.js';
import siteConfig from '../../content/_data/siteConfig.js';

const FULL_READABLE_DATE_FORMAT = siteConfig.dateFormats.fullReadable;

const body = (date) => formattedDate(date, FULL_READABLE_DATE_FORMAT);

export default {
  name: moduleName(import.meta.url),
  body,
};
