import * as React from "react"
import Img from "gatsby-image"
import _ from "lodash"
import {
  PostDetailsWrapper,
  PostTitle,
  PostPreview,
  PostDescriptionWrapper,
  PostDescription,
  PostSource,
} from "./post-details.style"
import { PostMetadata, PostDate } from "../post-card/post-card.style"

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
          </>
        ) : (
          ""
        )}
        <PostDescription className="post_des">
          <p>{description}</p>
        </PostDescription>

        <PostMetadata>
          {date && (
            <PostDate
              dangerouslySetInnerHTML={{
                __html: date,
              }}
              className="post_date"
            />
          )}
          {sourceName == null ? null : (
            <PostSource>
              <span>sourceソース: </span>
              <a href={url}>{sourceName}</a>
            </PostSource>
          )}
        </PostMetadata>
      </PostDescriptionWrapper>
    </PostDetailsWrapper>
  )
}

PostDetails.defaultProps = {
  imagePosition: "top",
}

export default PostDetails
