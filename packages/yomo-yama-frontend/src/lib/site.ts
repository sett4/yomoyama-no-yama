export const siteConfig = {
  site: {
    title: 'よもやまの山',
    description: 'やまのことを集めています',
    url: process.env.URL || 'https://yama.4dir.com/',
    logo: '/images/logo.png',
    language: 'ja',
    startYear: 2019,
    generator: {
      name: 'Astro',
      url: 'https://astro.build',
    },
    dir: 'auto',
    template: {
      name: 'Bliss',
      url: 'https://github.com/lwojcik/eleventy-template-bliss',
      credit: {
        name: 'Offbeat Bits',
        url: 'https://offbeatbits.com',
      },
    },
  },
  author: {
    name: 'sett4',
    url: 'https://twitter.com/sett4/',
    fediverse: [],
  },
  metaPages: [],
  opengraph: {
    type: 'website',
    image: '/images/share-400x400.jpg',
  },
  twitter: {
    card: 'summary',
    image: '/images/share-400x400.jpg',
  },
  tags: {
    displayOnPostPage: true,
    postsPerPage: 10,
  },
  manifestJson: {
    language: 'ja-JP',
    themeColor: '#2f5d46',
    backgroundColor: '#f7f3ea',
  },
  shareButtons: ['twitter', 'clipboard'],
  feed: {
    incidents: {
      title: 'ATOM feed (full articles)',
      path: '/incident/feed-mountain-incident.xml',
      limit: 20,
    },
  },
};

export const phrases = {
  main_page: 'Main page',
  skip_to_main_content: 'Skip to main content',
  disclaimer: 'Disclaimer',
  originally_published: 'Originally published on',
  by: 'by',
  page: 'Page',
  go_to_page: 'Go to page',
  tags: 'Tags',
  go: 'Go!',
  newer: 'Newer',
  older: 'Older',
  articles: 'articles',
  newer_article: 'Newer article',
  older_article: 'Older article',
  tagged_as: 'Tagged as',
  right_arrow_symbol: '→',
  left_arrow_symbol: '←',
  feed: 'Feed',
  of: 'of',
  share_on: 'Share on',
  share_this_article: 'Share this article',
  opens_new_tab: 'opens a new tab',
  copy_to_clipboard: 'Copy article URL to clipboard',
  image_credit: 'Image credit',
  powered_by: 'Powered by',
  template: 'Template',
  source_from: 'Source from',
  sources: {
    'yj-news': 'Yahoo!ニュース',
    np24: '長野県警ニュース24時',
  } as Record<string, string>,
};

export const navigationItems = [
  { href: '/about.html', label: 'About' },
  { href: '/incident/', label: '山岳事故' },
  { href: '/subscribe/', label: 'Subscribe' },
];
