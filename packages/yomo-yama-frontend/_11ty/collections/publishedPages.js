import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moduleName from '../helpers/moduleName.js';
import { PAGE_COLLECTION_TAG_NAME } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  name: moduleName(__filename),
  body: (collectionApi) =>
    collectionApi
      .getFilteredByTag(PAGE_COLLECTION_TAG_NAME)
      .filter((item) => item.data.published),
};
