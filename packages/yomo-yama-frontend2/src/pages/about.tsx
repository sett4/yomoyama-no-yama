import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import About from "../containers/about"

type AboutPageProps = {}

const AboutPage: React.FunctionComponent<AboutPageProps> = () => {
  return (
    <Layout>
      <SEO
        title="About Us"
        description="山にまつわることをちょっとづつ集めています"
      />

      <About />
    </Layout>
  )
}

export default AboutPage
