import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import PersonalBlog from "../containers/home"
import SEO from "../components/seo"

const PersonalBlogPage = (props: any): JSX.Element => {
  const { data } = props

  return (
    <Layout>
      <SEO
        title="よもやまの山"
        description={data.site.siteMetadata.description}
      />
      <PersonalBlog />
    </Layout>
  )
}
//#47a50d
export default PersonalBlogPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`
