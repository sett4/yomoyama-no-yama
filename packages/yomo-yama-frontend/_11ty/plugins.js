/* eslint-disable indent */
import { IS_PRODUCTION } from './constants.js';
import { feedPlugin } from '@11ty/eleventy-plugin-rss';
import { EleventyHtmlBasePlugin } from '@11ty/eleventy';
import pluginEmoji from 'eleventy-plugin-emoji';
import eleventyNavigationPlugin from '@11ty/eleventy-navigation';
import srcSet from './plugins/srcset.js';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';
import siteConfig from '../content/_data/siteConfig.js';

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
      outputPath: siteConfig.feed.incidents.path,
      collection: {
        name: 'incidents', // iterate over `collections.posts`
        limit: siteConfig.feed.incidents.limit, // 0 means no limit
      },
      metadata: {
        language: 'ja',
        title: 'よもやまの山 山岳事故',
        subtitle: '',
        base: 'https://yama.4dir.com/incident/',
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
