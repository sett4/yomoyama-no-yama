import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moduleName from '../helpers/moduleName.js';
import { POSTS_PER_TAG_PAGE, POST_COLLECTION_TAG_NAME } from '../constants.js';
import { chunkCollectionByKey } from '../helpers/chunkCollectionByKey.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const collectionKey = 'tags';

export default {
  name: moduleName(__filename),
  body: (collectionApi) => {
    const taggedPosts = collectionApi.getFilteredByTag(
      POST_COLLECTION_TAG_NAME
    );

    return chunkCollectionByKey(taggedPosts, collectionKey, POSTS_PER_TAG_PAGE);
  },
};
