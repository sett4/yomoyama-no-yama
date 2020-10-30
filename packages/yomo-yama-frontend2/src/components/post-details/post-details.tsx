import * as React from "react"
import Img from "gatsby-image"
import { Link } from "gatsby"
import _ from "lodash"
import {
  PostDetailsWrapper,
  PostTitle,
  PostDate,
  PostPreview,
  PostDescriptionWrapper,
  PostDescription,
  PostTags,
} from "./post-details.style"
import { PostSource } from "../../templates/templates.style"

type PostDetailsProps = {
  title: string
  date?: string
  preview?: any
  description: any
  tags?: []
  className?: string
  imagePosition?: "left" | "top"
  url?: string
  sourceName?: string
}

const PostDetails: React.FunctionComponent<PostDetailsProps> = ({
  title,
  date,
  preview,
  description,
  tags,
  className,
  imagePosition,
  url,
  sourceName,
  ...props
}) => {
  const addClass: string[] = ["post_details"]

  if (imagePosition == "left") {
    addClass.push("image_left")
  }

  if (className) {
    addClass.push(className)
  }

  return (
    <PostDetailsWrapper {...props} className={addClass.join(" ")}>
      {imagePosition == "left" ? (
        <>
          {preview == null ? null : (
            <PostPreview className="post_preview">
              <Img fluid={preview} alt={title} />
            </PostPreview>
          )}
        </>
      ) : (
        ""
      )}

      {imagePosition == "top" ? (
        <>
          <PostTitle>{title}</PostTitle>
          <PostDate>{date}</PostDate>
        </>
      ) : (
        ""
      )}

      {imagePosition == "top" ? (
        <>
          {preview == null ? null : (
            <PostPreview className="post_preview">
              <Img fluid={preview} alt={title} />
            </PostPreview>
          )}
        </>
      ) : (
        ""
      )}
      <PostDescriptionWrapper className="post_des_wrapper">
        {imagePosition == "left" ? (
          <>
            <PostTitle>{title}</PostTitle>
            <PostDate>{date}</PostDate>
          </>
        ) : (
          ""
        )}
        <PostDescription className="post_des">
          <p>{description}</p>
        </PostDescription>
        {tags == null ? null : (
          <PostTags>
            {tags
              .filter((tag: string) => !tag.startsWith("__"))
              .map((tag, index) => (
                <Link key={index} to={`/tags/${_.kebabCase(tag)}/`}>
                  {`#${tag}`}
                </Link>
              ))}
          </PostTags>
        )}
        <PostSource>
          source: <a href={url}>{sourceName}</a>
        </PostSource>
      </PostDescriptionWrapper>
    </PostDetailsWrapper>
  )
}

PostDetails.defaultProps = {
  imagePosition: "top",
}

export default PostDetails
