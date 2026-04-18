import { fileURLToPath } from 'url';
import normalizeDate from '../helpers/normalizeDate.js';
import moduleName from '../helpers/moduleName.js';
import { PAGE_COLLECTION_TAG_NAME } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);

export default {
  name: moduleName(__filename),
  body: (collectionApi) => {
    return collectionApi
      .getAll()
      .filter((item) => {
        const tags = Array.isArray(item.data.tags) ? item.data.tags : [];
        return tags.includes(PAGE_COLLECTION_TAG_NAME) && item.data.published;
      })
      .map((item) => {
        const date = normalizeDate(item.date || item.data.date);
        if (!date) {
          return null;
        }

        item.date = date;
        return item;
      })
      .filter(Boolean)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  },
};
