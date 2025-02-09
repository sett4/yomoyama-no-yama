const moduleName = require('../helpers/moduleName');
const { INCIDENT_COLLECTION_TAG_NAME } = require('../constants');

module.exports = {
  name: moduleName(__filename),
  body: (collectionApi) => {
    const collection = collectionApi
      .getFilteredByTag(INCIDENT_COLLECTION_TAG_NAME)
      .filter((item) => item.data.published)
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

    return collection;
  },
};
