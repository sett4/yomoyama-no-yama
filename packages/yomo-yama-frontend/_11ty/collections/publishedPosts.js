import { fileURLToPath } from 'url';
import moduleName from '../helpers/moduleName.js';
import { POST_COLLECTION_TAG_NAME } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);

export default {
  name: moduleName(__filename),
  body: (collectionApi) =>
    collectionApi
      .getFilteredByTag(POST_COLLECTION_TAG_NAME)
      .reverse()
      .filter((item) => item.data.published),
};
