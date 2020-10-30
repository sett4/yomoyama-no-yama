import * as React from "react"
import { graphql } from "gatsby"
import PostCard from "../components/post-card/post-card"
import Layout from "../components/layout"
import SEO from "../components/seo"
import {
  BlogPostsWrapper,
  RelatedPostWrapper,
  RelatedPostTitle,
  RelatedPostItems,
  RelatedPostItem,
} from "./templates.style"
import { PostTitle } from "../components/post-card/post-card.style"

const IncidentMonthlyList = (props: any): JSX.Element => {
  const { data, pageContext } = props
  const Posts = data.incident.edges
  const Months = data.month.edges

  // const { currentPage, numPages } = props.pageContext
  // const isFirst = currentPage === 1
  // const isLast = currentPage === numPages
  // const prevPage =
  //   currentPage - 1 === 1 ? "/page/1" : `/page/${(currentPage - 1).toString()}`
  // const nextPage = `/page/${(currentPage + 1).toString()}`
  // const PrevLink = !isFirst && prevPage
  // const NextLink = !isLast && nextPage

  return (
    <Layout>
      <SEO title={`山岳事故 ${pageContext.month}`} />
      <BlogPostsWrapper>
        <PostTitle className="post_title">
          {`山岳事故 ${pageContext.month}`}
        </PostTitle>
        {Posts.map(({ node }: any) => {
          return (
            <PostCard
              key={node.id}
              title={node.title}
              image={null}
              url={"/incident/" + node.id}
              description={
                node.content.length > 120
                  ? node.content.substring(
                      0,
                      Math.min(120, node.content.length)
                    ) + "..."
                  : node.content
              }
              date={node.date}
              tags={node.tags}
            />
          )
        })}
      </BlogPostsWrapper>

      <RelatedPostWrapper>
        <RelatedPostTitle>Related Posts</RelatedPostTitle>
        <RelatedPostItems>
          {Months.map(({ node }: any) => (
            <RelatedPostItem key={node.id}>
              <PostCard
                title={node.month}
                url={"/incident/" + node.month}
                image={null}
                tags={[]}
              />
            </RelatedPostItem>
          ))}
        </RelatedPostItems>
      </RelatedPostWrapper>
    </Layout>
  )
}

export default IncidentMonthlyList

export const pageQuery = graphql`
  query($started: Date, $ended: Date) {
    site {
      siteMetadata {
        title
      }
    }
    sitePage {
      path
    }
    incident: allIncident(
      filter: { tags: { in: "山岳事故" }, date: { gte: $started, lte: $ended } }
      sort: { fields: [date, publishedDate] }
    ) {
      edges {
        node {
          id
          title
          url
          content
          source
          sourceName
          date(formatString: "YYYY-MM-DD")
          publishedDate
          tags
        }
      }
    }
    month: allIncidentMonthly(sort: { fields: [month], order: [DESC] }) {
      edges {
        node {
          id
          month
          started
          ended
        }
      }
    }
  }
`
