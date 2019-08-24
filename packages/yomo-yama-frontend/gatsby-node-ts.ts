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
  const { createPage, createNode } = actions
  // The “graphql” function allows us to run arbitrary
  // queries against the local Contentful graphql schema. Think of
  // it like the site has a built-in database constructed
  // from the fetched data that you can run queries against.

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
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    type MonthPageData = {
      month: string
      started: string
      ended: string
      count: number
      children: Node[]
    }
    const monthDataMap: Map<string, MonthPageData> = new Map()

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
      const month: string = moment(edge.node.date).format(`YYYY-MM`)
      if (!monthDataMap.has(month)) {
        monthDataMap.set(month, {
          month: month,
          started: moment(edge.node.date)
            .startOf("month")
            .format(),
          ended: moment(edge.node.date)
            .endOf("month")
            .format(),
          count: 1,
          children: [],
        })
      } else {
        const m = Object.assign({}, monthDataMap.get(month))
        m.count++
        m.children.push(edge.node.id)
        monthDataMap.set(month, m)
      }

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

    // ここで月別のデータを入れる
    monthDataMap.forEach(async e => {
      const nodeContent = JSON.stringify(e)

      const nodeMeta = {
        id: createNodeId(`incidentMonthly-${e.month}`),
        parent: null,
        children: [],
        internal: {
          type: `incidentMonthly`,
          content: nodeContent,
          contentDigest: createContentDigest(e),
        },
      }
      const node = Object.assign({}, e, nodeMeta)
      await createNode(node)
      console.log(`create ${e.month}`)
      await createPage({
        path: `/incident/${e.month}/`,
        component: slash(incidentMonthlyTemplate),
        context: e,
      })
    })
  })

  return incidentDetailPages
}

export async function sourceNodes({
  actions,
  createNodeId,
  createContentDigest,
}) {
  const { createNode } = actions

  type MonthData = {
    month: string
    started: Date
    ended: Date
    count: number
  }
  const m = moment("2019-02-01")
  const l = []
  do {
    const md: MonthData = {
      month: m.format("YYYY-MM"),
      started: moment(m)
        .startOf("month")
        .toDate(),
      ended: moment(m)
        .endOf("month")
        .toDate(),
      count: 0,
    }
    const nodeContent = JSON.stringify(md)
    const nodeMeta = {
      id: createNodeId(`incidentMonthly-${md.month}`),
      parent: null,
      children: [],
      internal: {
        type: `incidentMonthly`,
        content: nodeContent,
        contentDigest: createContentDigest(md),
      },
    }

    const node = Object.assign({}, md, nodeMeta)
    await createNode(node)

    m.add(1, "month")
  } while (m.isAfter(moment()))
}
