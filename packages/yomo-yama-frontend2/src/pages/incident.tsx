import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import {
  BlogPostsWrapper,
  RelatedPostWrapper,
  RelatedPostTitle,
  RelatedPostItems,
  RelatedPostItem,
} from "../templates/templates.style"
import { PostTitle } from "../components/post-card/post-card.style"
import PostCard from "../components/post-card/post-card"

const IncidentPage = (props: any): JSX.Element => {
  const { data } = props
  const Posts = data.incident.edges
  const Months = data.month.edges

  return (
    <Layout>
      <SEO title={`山岳事故 `} />
      <BlogPostsWrapper>
        <PostTitle className="post_title">{`山岳事故`}</PostTitle>
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

export default IncidentPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    sitePage {
      path
    }
    incident: allIncident(
      limit: 50
      filter: { tags: { in: "山岳事故" } }
      sort: { fields: [date, publishedDate], order: DESC }
    ) {
      edges {
        node {
          id
          title
          url
          date(formatString: "YYYY-MM-DD")
          publishedDate
          tags
          content
          source
          sourceName
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
