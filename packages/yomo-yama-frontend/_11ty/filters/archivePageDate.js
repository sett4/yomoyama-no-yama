import moduleName from '../helpers/moduleName.js';
import { DateTime } from 'luxon';

const body = (dateObj) => {
  return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat('yyyy-MM-dd');
};

export default {
  name: moduleName(import.meta.url),
  body,
};
