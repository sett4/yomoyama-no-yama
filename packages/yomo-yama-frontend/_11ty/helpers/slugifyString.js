import slugify from 'slugify';
import { SLUGIFY_CONFIG } from '../constants.js';
/**
 * Transforms a string into a slug
 * @param {String} str string to slugify
 * @returns slugified string
 */
const slugifyString = (str) => slugify(str, SLUGIFY_CONFIG);

export default slugifyString;
