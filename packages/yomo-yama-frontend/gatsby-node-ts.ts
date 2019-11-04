import * as _ from "lodash"
import path from "path"
import slash from "slash"
import moment from "moment"
import { Link, graphql } from "gatsby"
import createNodeHelpers from "gatsby-node-helpers"

export async function createPages({
  graphql,
  actions,
  createNodeId,
  createContentDigest,
}) {
  const { createPage, createRedirect } = actions
  // The “graphql” function allows us to run arbitrary
  // queries against the local Contentful graphql schema. Think of
  // it like the site has a built-in database constructed
  // from the fetched data that you can run queries against.

  createRedirect({
    fromPath: "https://yomoyama-no-yama.netlify.com/*",
    toPath: "https://yama.4dir.com/:splat",
    isPermanent: true,
    force: true,
  })

  const incidentDetailPages = await graphql(
    `
      {
        allIncident(filter: { tags: { in: "山岳事故" } }) {
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
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    // Create Product pages
    const incidentTemplate = path.resolve(`./src/templates/incident.tsx`)
    const incidentMonthlyTemplate = path.resolve(
      `./src/templates/incident-monthly-index.tsx`
    )

    // We want to create a detailed page for each
    // product node. We'll just use the Contentful id for the slug.
    _.each(result.data.allIncident.edges, async edge => {
      // Gatsby uses Redux to manage its internal state.
      // Plugins and sites can use functions like "createPage"
      // to interact with Gatsby.

      await createPage({
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
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    // Create Product pages
    const incidentMonthlyTemplate = path.resolve(
      `./src/templates/incident-monthly-index.tsx`
    )

    result.data.allIncidentMonthly.nodes.forEach(async e => {
      const nodeContent = JSON.stringify(e)

      console.log(`create monthly incident index ${e.month}`)
      await createPage({
        path: `/incident/${e.month}/`,
        component: slash(incidentMonthlyTemplate),
        context: e,
      })
    })
  })
}

export async function sourceNodes({
  actions,
  createNodeId,
  createContentDigest,
  getNodesByType,
}) {
  const { createNode } = actions

  type MonthPageData = {
    month: string
    started: string
    ended: string
    count: number
    children: Node[]
  }
  const monthDataMap: Map<string, MonthPageData> = new Map()

  // 全記事から月別のノードを作る
  const allIncidentNodes = getNodesByType(`Incident`).filter(
    n => n.tags && n.tags.includes("山岳事故")
  )
  _.each(allIncidentNodes, async node => {
    // Gatsby uses Redux to manage its internal state.
    // Plugins and sites can use functions like "createPage"
    // to interact with Gatsby.
    const month: string = moment(node.date).format(`YYYY-MM`)
    if (!monthDataMap.has(month)) {
      monthDataMap.set(month, {
        month: month,
        started: moment(node.date)
          .startOf("month")
          .format(),
        ended: moment(node.date)
          .endOf("month")
          .format(),
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
  monthDataMap.forEach(async e => {
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
