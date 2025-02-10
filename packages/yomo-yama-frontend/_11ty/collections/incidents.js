import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moduleName from '../helpers/moduleName.js';
import { INCIDENT_COLLECTION_TAG_NAME } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  name: moduleName(__filename),
  body: (collectionApi) => {
    const collection = collectionApi
      .getFilteredByTag(INCIDENT_COLLECTION_TAG_NAME)
      .filter((item) => item.data.published)
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

    return collection;
  },
};
