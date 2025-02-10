import moduleName from '../helpers/moduleName.js';

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

export default {
  name: moduleName(import.meta.url),
  body,
};
