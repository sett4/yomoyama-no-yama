import { fileURLToPath } from 'url';
import normalizeDate from '../helpers/normalizeDate.js';
import moduleName from '../helpers/moduleName.js';
import { INCIDENT_COLLECTION_TAG_NAME } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);

export default {
  name: moduleName(__filename),
  body: (collectionApi) => {
    const collection = collectionApi
      .getFilteredByTag(INCIDENT_COLLECTION_TAG_NAME)
      .filter((item) => item.data.published)
      .sort((a, b) => {
        // RSS プラグインが | reverse するので昇順でソート（古い順）
        const left = normalizeDate(a.data.post.publishedAt);
        const right = normalizeDate(b.data.post.publishedAt);
        return (left?.getTime() || 0) - (right?.getTime() || 0);
      })
      .map((item) => {
        // RSS プラグイン用に date フィールドを設定
        item.date = normalizeDate(item.data.post.publishedAt);
        return item;
      })
      .filter((item) => item.date);

    return collection;
  },
};
