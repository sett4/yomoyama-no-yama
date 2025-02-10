import moduleName from '../helpers/moduleName.js';
import { DateTime } from 'luxon';

const body = () => DateTime.local().toFormat('yyyy');

export default {
  name: moduleName(import.meta.url),
  body,
};
