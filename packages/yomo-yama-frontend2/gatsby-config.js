require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
const moment = require("moment")

module.exports = {
  siteMetadata: {
    title: `よもやまの山`,
    author: `@sett4`,
    about: `山に関する情報を集めています`,
    description: `山の名前や山岳事故など山に関する情報を集めています。`,
    siteUrl: `https://yama.4dir.com`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        minify: false, // Breaks styles if not set to false
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
              linkImagesToOriginal: true,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: `gatsby-remark-katex`,
            options: {
              // Add any KaTeX options from https://github.com/KaTeX/KaTeX/blob/master/docs/options.md here
              strict: `ignore`,
            },
          },
          {
            resolve: `gatsby-remark-mermaid`,
          },
          {
            resolve: `gatsby-remark-prismjs`,
          },
          {
            resolve: `gatsby-remark-prismjs`,
          },

          {
            resolve: `gatsby-remark-copy-linked-files`,
          },
          {
            resolve: `gatsby-remark-smartypants`,
          },
        ],
      },
    },
    {
      resolve: `gatsby-transformer-sharp`,
    },
    {
      resolve: `gatsby-plugin-sharp`,
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `${process.env.GOOGLE_ANALYTICS_TRACKING_ID}`,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `よもやまの山`,
        // eslint-disable-next-line @typescript-eslint/camelcase
        short_name: `よも山`,
        // eslint-disable-next-line @typescript-eslint/camelcase
        start_url: `/`,
        // eslint-disable-next-line @typescript-eslint/camelcase
        background_color: `#ffffff`,
        // eslint-disable-next-line @typescript-eslint/camelcase
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/favicon.png`,
      },
    },
    {
      resolve: `gatsby-plugin-offline`,
    },
    {
      resolve: `gatsby-plugin-react-helmet`,
    },
    {
      resolve: `gatsby-plugin-typescript`,
    },
    {
      resolve: `gatsby-plugin-lodash`,
    },
    // {
    //   resolve: "gatsby-plugin-mailchimp",
    //   options: {
    //     endpoint: "", // add your MC list endpoint here
    //   },
    // },
    {
      resolve: `gatsby-source-instagram`,
      //add your instagram username, access_token and id below
      options: {
        // username: ,
        // access_token: ,
        // instagram_id: ,
      },
    },
    {
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [
          {
            family: `Poppins`,
            variants: [`300`, `400`, `500`, `600`, `700`],
          },
          {
            family: `Fira Sans`,
            variants: [`100`, `300`, `400`, `500`, `600`, `700`],
          },
        ],
      },
    },
    {
      resolve: "gatsby-source-firestore",
      options: {
        credential: JSON.parse(process.env.FIRESTORE_CREDENTIAL_JSON),
        types: [
          {
            type: "Incident",
            collection: "incident",
            map: (doc) => ({
              title: doc.subject,
              source: doc.source,
              sourceName: doc.sourceName,
              content: doc.content,
              url: doc.url,
              date: doc.date,
              month: moment(doc.date).format("YYYY-MM"),
              publishedDate: doc.publishedDate,
              tags: doc.tags,
              author: doc.author,
              // author___NODE: doc.author.id,
            }),
          },
        ],
      },
    },
    {
      resolve: "gatsby-plugin-netlify",
    },
  ],
}
