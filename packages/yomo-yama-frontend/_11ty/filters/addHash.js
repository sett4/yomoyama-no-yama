import { DateTime } from 'luxon';
import moduleName from '../helpers/moduleName.js';

const body = (url) => {
  const [urlPart, paramPart] = url.split('?');
  const params = new URLSearchParams(paramPart || '');
  params.set('v', DateTime.local().toFormat('X'));
  return `${urlPart}?${params}`;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
