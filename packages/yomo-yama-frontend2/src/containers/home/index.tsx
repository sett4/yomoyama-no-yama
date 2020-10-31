import * as React from "react"
import PersonalBlogWrapper from "./style"
import Intro from "./intro"
// import Posts from "./posts"
import PostCard from "../../components/post-card/post-card"
import BlogPostsWrapper from "./posts/style"
import { graphql, useStaticQuery } from "gatsby"

type PersonalBlogProps = {}

const PersonalBlog: React.FunctionComponent<PersonalBlogProps> = (props) => {
  const Data = useStaticQuery(graphql`
    query {
      incidentImage: file(absolutePath: { regex: "/incident.jpg/" }) {
        childImageSharp {
          fluid(maxWidth: 1770, quality: 90) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      nameImage: file(absolutePath: { regex: "/name.png/" }) {
        childImageSharp {
          fluid(maxWidth: 1770, quality: 90) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)
  return (
    <PersonalBlogWrapper {...props}>
      <Intro />
      {/* <Posts /> */}
      <BlogPostsWrapper>
        <PostCard
          key="incident"
          title="山岳事故"
          image={Data.incidentImage.childImageSharp.fluid}
          url="/incident"
          description="山岳事故のニュースを集めています"
          date={""}
          tags={[]}
        />
        <PostCard
          key="ime-dic"
          title="自然地名"
          image={Data.nameImage.childImageSharp.fluid}
          url="https://www.notion.so/IME-065f11006dc3468a9664154389c08b84"
          description="Microsoft IME, macOS 日本語入力, Google日本語入力用の自然地名の追加辞書です"
          date={""}
          tags={[]}
        />
      </BlogPostsWrapper>
    </PersonalBlogWrapper>
  )
}

export default PersonalBlog
