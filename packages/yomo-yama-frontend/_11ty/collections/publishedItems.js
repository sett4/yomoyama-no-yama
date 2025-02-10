import { fileURLToPath } from 'url';
import { dirname } from 'path';
import moduleName from '../helpers/moduleName.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  name: moduleName(__filename),
  body: (collectionApi) =>
    collectionApi.getAll().filter((item) => item.data.published),
};
