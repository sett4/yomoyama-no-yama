import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moduleName from '../helpers/moduleName.js';
import { EXCLUDED_TAGS } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  name: moduleName(__filename),
  body: (collectionApi) => {
    const tagsSet = new Set();
    collectionApi.getAll().forEach((item) => {
      if (!item.data.tags) return;
      item.data.tags
        .filter((tag) => !EXCLUDED_TAGS.includes(tag))
        .forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  },
};
