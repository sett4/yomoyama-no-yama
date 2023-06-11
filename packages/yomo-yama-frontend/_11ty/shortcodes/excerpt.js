const { max } = require('lodash');
const moduleName = require('../helpers/moduleName');

const body = (article) => {
  if (!Object.prototype.hasOwnProperty.call(article, 'templateContent')) {
    console.warn(
      'Failed to extract excerpt: Document has no property "templateContent".'
    );
    return null;
  }

  let content = article.templateContent;
  const excerpt = content
    .slice(0, content.indexOf('\n'))
    .replace(/(<([^>]+)>)/gi, '');

  const max = excerpt.length > 140 ? 140 : excerpt.length;
  return excerpt.substring(0, max) + '…';
};

module.exports = {
  name: moduleName(__filename),
  body,
};
