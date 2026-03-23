import { fileURLToPath } from 'url';
import moduleName from '../helpers/moduleName.js';

const __filename = fileURLToPath(import.meta.url);

export default {
  name: moduleName(__filename),
  body: (collectionApi) =>
    collectionApi.getAll().filter((item) => item.data.published),
};
