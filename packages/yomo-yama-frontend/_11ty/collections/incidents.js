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
      .sort((a, b) => {
        // RSS プラグインが | reverse するので昇順でソート（古い順）
        return (
          new Date(a.data.post.publishedAt) - new Date(b.data.post.publishedAt)
        );
      })
      .map((item) => {
        // RSS プラグイン用に date フィールドを設定
        item.date = new Date(item.data.post.publishedAt);
        return item;
      });


    return collection;
  },
};
