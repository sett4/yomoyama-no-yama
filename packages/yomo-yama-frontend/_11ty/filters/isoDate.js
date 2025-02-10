import { DateTime } from 'luxon';
import moduleName from '../helpers/moduleName.js';

const body = (date) => DateTime.fromJSDate(date, { zone: 'utc' }).toISO();

export default {
  name: moduleName(import.meta.url),
  body,
};
