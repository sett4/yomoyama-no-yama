import siteConfig from '../content/_data/siteConfig.js';

export const ASSETS_FOLDER = 'assets';
export const EXCLUDED_TAGS = [
  'all',
  'post',
  'page',
  'publishedItems',
  'publishedPages',
  'publishedPosts',
  'publishedPages',
  'tagList',
  'categoryIncident',
];
export const SCRIPTS_FOLDER = 'src/scripts';
export const CONTENT_FOLDER = 'content';
export const BUILD_FOLDER = '_site';
export const POST_COLLECTION_TAG_NAME = 'post';
export const PAGE_COLLECTION_TAG_NAME = 'page';
export const INCIDENT_COLLECTION_TAG_NAME = 'incident';
export const POSTS_PER_TAG_PAGE = siteConfig.tags.postsPerPage;
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const SLUGIFY_CONFIG = {
  replacement: '-',
  lower: true,
  strict: true,
};

const constants = {
  ASSETS_FOLDER,
  EXCLUDED_TAGS,
  SCRIPTS_FOLDER,
  CONTENT_FOLDER,
  BUILD_FOLDER,
  POST_COLLECTION_TAG_NAME,
  PAGE_COLLECTION_TAG_NAME,
  INCIDENT_COLLECTION_TAG_NAME,
  POSTS_PER_TAG_PAGE,
  IS_PRODUCTION,
  SLUGIFY_CONFIG,
};

export default constants;
