import { parse } from 'node-html-parser';
import moduleName from '../helpers/moduleName.js';
import siteConfig from '../../content/_data/siteConfig.js';

const body = (content) => {
  const root = parse(content);
  const links = root.querySelectorAll('a');

  if (links) {
    links.forEach((link) => {
      const href = link.getAttribute('href');

      if (href && href.startsWith('/')) {
        const newHref = new URL(href, siteConfig.site.url);
        link.setAttribute('href', newHref);
      }
    });

    return root.toString();
  }
  return content;
};

export default {
  name: moduleName(import.meta.url),
  body,
};
