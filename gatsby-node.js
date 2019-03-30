/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
const _ = require(`lodash`)
const path = require(`path`)
const slash = require(`slash`)

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions
  // The “graphql” function allows us to run arbitrary
  // queries against the local Contentful graphql schema. Think of
  // it like the site has a built-in database constructed
  // from the fetched data that you can run queries against.
  return graphql(
    `
      {
        allIncident(limit: 1000, filter: { tags: { in: "山岳事故"}}) {
          edges {
            node {
              id
            }
          }
        }
      }
    `
  )
    .then(result => {
      if (result.errors) {
        throw result.errors
      }

      // Create Product pages
      const incidentTemplate = path.resolve(`./src/templates/incident.tsx`)
      // We want to create a detailed page for each
      // product node. We'll just use the Contentful id for the slug.
      _.each(result.data.allIncident.edges, edge => {
        // Gatsby uses Redux to manage its internal state.
        // Plugins and sites can use functions like "createPage"
        // to interact with Gatsby.
        createPage({
          // Each page is required to have a `path` as well
          // as a template component. The `context` is
          // optional but is often necessary so the template
          // can query data specific to each page.
          path: `/incident/${edge.node.id}/`,
          component: slash(incidentTemplate),
          context: {
            id: edge.node.id,
            source: edge.node.source,
            author: edge.node.author,
            title: edge.node.subject,
            content: edge.node.content,
            publishedDate: edge.node.publishedDate,
            tags: edge.node.tags
          },
        })
      })
    })
}