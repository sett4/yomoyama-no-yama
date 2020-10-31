import React from "react"
import { graphql } from "gatsby"
import _ from "lodash"
import urljoin from "url-join"
import Layout from "../components/layout"
import SEO from "../components/seo"
import PostDetails from "../components/post-details/post-details"
import PostCard from "../components/post-card/post-card"

import { FacebookShareButton, TwitterShareButton } from "react-share"
// eslint-disable-next-line node/no-missing-import
import { IoLogoFacebook, IoLogoTwitter } from "react-icons/io"
import {
  BlogPostDetailsWrapper,
  RelatedPostWrapper,
  RelatedPostItems,
  RelatedPostTitle,
  RelatedPostItem,
  BlogPostFooter,
  PostShare,
  PostTags,
  BlogPostComment,
} from "./templates.style"

const IncidentPostTemplate = (props: any): JSX.Element => {
  const post = props.data.incident
  // const { edges } = props.data.allMarkdownRemark
  const title = post.title
  const slug = `incident/${post.id}`
  const siteUrl = props.data.site.siteMetadata.siteUrl
  const shareUrl = urljoin(siteUrl, slug)

  // const disqusConfig = {
  //   shortname: process.env.DISQUS_NAME,
  //   config: { identifier: slug, title },
  // }

  const Months = props.data.month.edges

  return (
    <Layout>
      <SEO title={post.title} description={post.content || post.excerpt} />
      <BlogPostDetailsWrapper>
        <PostDetails
          title={post.title}
          date={post.date}
          preview={post.cover == null ? null : post.cover.childImageSharp.fluid}
          description={
            post.content.length > 120 &&
            post.tags != null &&
            post.tags.includes("__private-use")
              ? post.content.substring(0, Math.min(120, post.content.length)) +
                "..."
              : post.content
          }
          url={post.url}
          sourceName={post.sourceName}
          tags={post.tags}
        />

        <BlogPostFooter>
          {post.tags == null ? null : (
            <PostTags className="post_tags">
              {post.tags
                .filter((tag: string) => !tag.startsWith("__"))
                .map((tag: string, index: number) => (
                  <span key={index}>{`#${tag}`}</span>
                ))}
            </PostTags>
          )}
          <PostShare>
            <span>Share This:</span>
            <FacebookShareButton url={shareUrl} quote={post.excerpt}>
              <IoLogoFacebook />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} title={title}>
              <IoLogoTwitter />
            </TwitterShareButton>
          </PostShare>
        </BlogPostFooter>
        <BlogPostComment>
          {/* <DiscussionEmbed {...disqusConfig} /> */}
        </BlogPostComment>
      </BlogPostDetailsWrapper>

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

export default IncidentPostTemplate

export const pageQuery = graphql`
  query IncidentPostById($id: String!) {
    site {
      siteMetadata {
        siteUrl
      }
    }
    incident(id: { eq: $id }) {
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
