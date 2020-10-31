import * as React from "react"
import PersonalBlogWrapper from "./style"
import Intro from "./intro"
// import Posts from "./posts"
import { formatISO } from "date-fns"
import PostCard from "../../components/post-card/post-card"
import BlogPostsWrapper from "./posts/style"

type PersonalBlogProps = {}

const PersonalBlog: React.FunctionComponent<PersonalBlogProps> = (props) => {
  return (
    <PersonalBlogWrapper {...props}>
      <Intro />
      {/* <Posts /> */}
      <BlogPostsWrapper>
        <PostCard
          key="incident"
          title="山岳事故"
          image={null}
          url="/incident"
          description="山岳事故のニュースを集めています"
          date={""}
          tags={[]}
        />
      </BlogPostsWrapper>
    </PersonalBlogWrapper>
  )
}

export default PersonalBlog
