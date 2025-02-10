/* eslint-disable indent */
import { IS_PRODUCTION } from './constants.js';
import pluginRss from '@11ty/eleventy-plugin-rss';
import { EleventyHtmlBasePlugin } from '@11ty/eleventy';
import pluginEmoji from 'eleventy-plugin-emoji';
import eleventyNavigationPlugin from '@11ty/eleventy-navigation';
import srcSet from './plugins/srcset.js';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

const productionPlugins = IS_PRODUCTION
  ? [
      {
        body: srcSet,
      },
    ]
  : [];

const plugins = [
  {
    body: EleventyHtmlBasePlugin,
  },
  {
    body: pluginRss,
  },
  {
    body: pluginEmoji,
  },
  {
    body: eleventyNavigationPlugin,
  },
  {
    body: syntaxHighlight,
  },
];

export default [...plugins, ...productionPlugins];
