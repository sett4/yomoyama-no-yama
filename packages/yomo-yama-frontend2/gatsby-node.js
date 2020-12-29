const path = require(`path`)
const _ = require("lodash")
const { createFilePath } = require(`gatsby-source-filesystem`)
// const moment = require(`moment`)
const slash = require(`slash`)
const dfns = require("date-fns")

exports.createPages = async ({ graphql, actions }) => {
  const { createPage, createRedirect } = actions

  createRedirect({
    fromPath: "https://yomoyama-no-yama.netlify.com/*",
    toPath: "https://yama.4dir.com/:splat",
    isPermanent: true,
    force: true,
  })

  const blogPost = path.resolve(`./src/templates/blog-post.tsx`)
  const blogList = path.resolve(`./src/templates/blog-list.tsx`)
  const tagTemplate = path.resolve(`./src/templates/tags.tsx`)
  const incidentPost = path.resolve(`./src/templates/incident-post.tsx`)

  const incidentList = await graphql(
    `
      {
        allIncident(filter: { tags: { in: "山岳事故", ne: "hidden" } }) {
          edges {
            node {
              id
              date
            }
          }
        }
        allIncidentMonthly(sort: { fields: month, order: ASC }) {
          nodes {
            ended
            started
            month
          }
        }
      }
    `
  ).then((result) => {
    if (result.errors) {
      throw result.errors
    }

    // We want to create a detailed page for each
    // product node. We'll just use the Contentful id for the slug.
    _.each(result.data.allIncident.edges, async (edge) => {
      // Gatsby uses Redux to manage its internal state.
      // Plugins and sites can use functions like "createPage"
      // to interact with Gatsby.

      await createPage({
        // Each page is required to have a `path` as well
        // as a template component. The `context` is
        // optional but is often necessary so the template
        // can query data specific to each page.
        path: `/incident/${edge.node.id}/`,
        component: slash(incidentPost),
        context: {
          id: edge.node.id,
          source: edge.node.source,
          author: edge.node.author,
          title: edge.node.subject,
          content: edge.node.content,
          publishedDate: edge.node.publishedDate,
          date: edge.node.date,
          tags: edge.node.tags,
        },
      })
    })
  })

  const incidentMonthlyPages = await graphql(
    `
      {
        allIncidentMonthly(sort: { fields: month, order: ASC }) {
          nodes {
            ended
            started
            month
          }
        }
      }
    `
  ).then((result) => {
    if (result.errors) {
      throw result.errors
    }

    // Create Product pages
    const incidentMonthlyTemplate = path.resolve(
      `./src/templates/incident-monthly-list.tsx`
    )

    result.data.allIncidentMonthly.nodes.forEach(async (e) => {
      const nodeContent = JSON.stringify(e)

      console.log(`create monthly incident index ${e.month}`)
      await createPage({
        path: `/incident/${e.month}/`,
        component: slash(incidentMonthlyTemplate),
        context: e,
      })
    })
  })

  return graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                tags
              }
            }
          }
        }
      }
    `
  ).then((result) => {
    if (result.errors) {
      throw result.errors
    }

    // Create blog posts pages.
    const posts = result.data.allMarkdownRemark.edges

    posts.forEach((post, index) => {
      const previous = index === posts.length - 1 ? null : posts[index + 1].node
      const next = index === 0 ? null : posts[index - 1].node

      createPage({
        path: post.node.fields.slug,
        component: blogPost,
        context: {
          slug: post.node.fields.slug,
          previous,
          next,
          tag: post.node.frontmatter.tags,
        },
      })
    })

    // Create blog post list pages
    const postsPerPage = 4
    const numPages = Math.ceil(posts.length / postsPerPage)

    Array.from({ length: numPages }).forEach((_, i) => {
      createPage({
        path: i === 0 ? `/page/1` : `/page/${i + 1}`,
        component: blogList,
        context: {
          limit: postsPerPage,
          skip: i * postsPerPage,
          numPages,
          currentPage: i + 1,
        },
      })
    })

    // Tag pages:
    let tags = []
    // Iterate through each post, putting all found tags into `tags`
    _.each(posts, (edge) => {
      if (_.get(edge, "node.frontmatter.tags")) {
        tags = tags.concat(edge.node.frontmatter.tags)
      }
    })
    // Eliminate duplicate tags
    tags = _.uniq(tags)

    // Make tag pages
    tags.forEach((tag) => {
      createPage({
        path: `/tags/${_.kebabCase(tag)}/`,
        component: tagTemplate,
        context: {
          tag,
        },
      })
    })

    return null
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    if (typeof node.frontmatter.slug !== "undefined") {
      createNodeField({
        node,
        name: "slug",
        value: node.frontmatter.slug,
      })
    } else {
      const value = createFilePath({ node, getNode })
      createNodeField({
        node,
        name: "slug",
        value,
      })
    }
  }
}

exports.sourceNodes = ({
  actions,
  createNodeId,
  createContentDigest,
  getNodesByType,
}) => {
  const { createNode } = actions

  const monthDataMap = new Map()

  // 全記事から月別のノードを作る
  const allIncidentNodes = getNodesByType(`Incident`).filter(
    (n) => n.tags && n.tags.includes("山岳事故") && !n.tags.includes("hidden")
  )
  _.each(allIncidentNodes, async (node) => {
    // Gatsby uses Redux to manage its internal state.
    // Plugins and sites can use functions like "createPage"
    // to interact with Gatsby.
    const month = dfns.format(dfns.parseISO(node.date), `yyyy-MM`)
    if (!monthDataMap.has(month)) {
      monthDataMap.set(month, {
        month: month,
        started: dfns.formatISO(dfns.startOfMonth(dfns.parseISO(node.date))),
        ended: dfns.formatISO(dfns.endOfMonth(dfns.parseISO(node.date))),
        count: 1,
        children: [],
      })
    } else {
      const m = Object.assign({}, monthDataMap.get(month))
      m.count++
      m.children.push(node.id)
      monthDataMap.set(month, m)
    }
  })

  // ここで月別のデータを入れる
  monthDataMap.forEach(async (e) => {
    const nodeContent = JSON.stringify(e)

    const nodeMeta = {
      id: createNodeId(`incidentMonthly-${e.month}`),
      parent: null,
      children: e.children,
      internal: {
        type: `incidentMonthly`,
        content: nodeContent,
        contentDigest: createContentDigest(e),
      },
    }
    const node = Object.assign({}, e, nodeMeta)
    await createNode(node)
    console.log(`create node ${e.month}`)
  })
}

// for React-Hot-Loader: react-🔥-dom patch is not detected
exports.onCreateWebpackConfig = ({ getConfig, stage }) => {
  const config = getConfig()
  if (stage.startsWith("develop") && config.resolve) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-dom": "@hot-loader/react-dom",
    }
  }
}
