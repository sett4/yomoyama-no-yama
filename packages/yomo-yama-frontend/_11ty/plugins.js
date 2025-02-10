/* eslint-disable indent */
import { IS_PRODUCTION } from './constants.js';
import { feedPlugin } from '@11ty/eleventy-plugin-rss';
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
    body: feedPlugin,
    options: {
      type: 'atom', // or "rss", "json"
      outputPath: '/feed.xml',
      collection: {
        name: 'incidents', // iterate over `collections.posts`
        limit: 10, // 0 means no limit
      },
      metadata: {
        language: 'ja',
        title: 'よもやまの山',
        subtitle: '',
        base: 'https://yama.4dir.com/',
        author: {
          name: 'sett4',
          email: '', // Optional
        },
      },
    },
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
