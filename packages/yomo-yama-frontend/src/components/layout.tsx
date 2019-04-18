/**
 * Layout component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from "react"
import PropTypes from "prop-types"
import { StaticQuery, graphql } from "gatsby"
import { rhythm } from "../utils/typography"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import withStyles, {
  WithStyles,
  StyleRules,
} from "@material-ui/core/styles/withStyles"
import createStyles from "@material-ui/core/styles/createStyles"

import Header from "./header"
import "./layout.css"
import { Typography, Link } from "@material-ui/core"
import GatsbyLink from "gatsby-link"

const styles = (theme: Theme) => {
  return createStyles({
    root: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: "inline",
    },
    footer: {
      martinTop: rhythm(2),
    },
  })
}

const Layout: React.SFC = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <Header siteTitle={data.site.siteMetadata.title} />
        <div
          style={{
            margin: `0 auto`,
            maxWidth: 800,
            padding: `0px 1.0875rem 1.45rem`,
            paddingTop: 0,
            marginBottom: rhythm(2),
          }}
        >
          <main>{children}</main>
          <footer style={{ marginTop: rhythm(1) }}>
            <Typography
              variant="subtitle1"
              align="center"
              color="textSecondary"
              component="p"
            >
              <Link underline="hover">
                <GatsbyLink to="/privacy/">Privacy Policy</GatsbyLink>
              </Link>
            </Typography>
            <Typography />
            <Typography
              variant="subtitle1"
              align="center"
              color="textSecondary"
              component="p"
            >
              build with Gatsby.
            </Typography>
          </footer>
        </div>
      </>
    )}
  />
)

export default Layout
