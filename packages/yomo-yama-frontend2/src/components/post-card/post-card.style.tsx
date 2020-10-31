import styled from "styled-components"
import { themeGet } from "@styled-system/theme-get"

export const PostCardWrapper = styled.div`
  position: relative;
  margin: 0 auto;
  padding: 30px 0 0 0;
  max-width: 870px;
  @media (min-width: 990px) {
    width: 900px;
  }
  @media (min-width: 1200px) {
    width: 1050px;
  }
  @media (min-width: 1400px) {
    width: 1170px;
  }
  @media (max-width: 990px) {
    padding: 25px 0 0 0;
  }
  @media (max-width: 575px) {
    padding: 5px 0 0 0;
  }
`

export const PostPreview = styled.div`
  margin-bottom: 45px;
  position: relative;
  img {
    border-radius: 3px;
  }

  &:before {
    content: "";
    position: absolute;
    width: 80%;
    height: 80%;
    background-color: #757575;
    bottom: 0;
    left: 10%;
    filter: blur(15px);
  }
`

export const PostDetails = styled.div`
  display: flex;
`

export const PostContent = styled.div`
  align-self: center;
`

export const PostTitle = styled.h2`
  font-size: 30px;
  font-weight: 700;
  color: ${themeGet("colors.textColor", "#292929")};
  line-height: 1.53;
  margin-bottom: 10px;
  a {
    color: ${themeGet("colors.textColor", "#292929")};
  }
  @media (max-width: 1200px) {
    font-size: 26px;
  }
  @media (max-width: 990px) {
    font-size: 21px;
    margin-bottom: 12px;
  }
  @media (max-width: 575px) {
    font-size: 20px;
    margin-bottom: 10px;
  }
`

export const Excerpt = styled.p`
  font-size: ${themeGet("fontSizes.3", "15")}px;
  color: ${themeGet("textColor", "#292929")};
  font-weight: 400;
  line-height: 2;
  margin-bottom: 0;
  @media (max-width: 990px) {
    font-size: 14px;
  }
`
export const PostMetadata = styled.div`
  // display: flex;
  // @media (max-width: 575px) {
  //   flex-direction: column;
  // }
`
export const PostDate = styled.div`
  display: block;
  align-items: center;
  margin-top: 15px;
  margin-right: 15px;
  font-size: 14px;
  font-weight: 400;
  color: ${themeGet("colors.textColor", "#292929")};
  min-witth: 300px;
  @media (max-width: 990px) {
    font-size: 13px;
    margin-right: 25px;
  }
`
export const PostTags = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
  flex: 1;

  span {
    display: block;
    margin-right: 30px;
    font-size: 14px;
    font-weight: 400;
    @media (max-width: 990px) {
      font-size: 13px;
      margin-right: 25px;
    }
  }
  a {
    display: block;
    margin-right: 30px;
    font-size: 14px;
    font-weight: 400;
    color: ${themeGet("colors.primary", "#D10068")};
    @media (max-width: 990px) {
      font-size: 13px;
      margin-right: 25px;
    }
  }
`
