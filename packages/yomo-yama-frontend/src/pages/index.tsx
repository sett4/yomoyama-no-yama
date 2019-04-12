import React from "react"
import { Link, graphql } from "gatsby"
import * as PropTypes from "prop-types"
import Img from "gatsby-image"
import { rhythm } from "../utils/typography"
import Layout from "../components/layout"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import withStyles, {
  WithStyles,
  StyleRules,
} from "@material-ui/core/styles/withStyles"
import createStyles from "@material-ui/core/styles/createStyles"
import Typography from "@material-ui/core/Typography"
import moment from "moment"
import withRoot from "../withRoot"

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
  })
}

interface AboutPageProps extends WithStyles<typeof styles> {
  data: {}
}

class AboutPage extends React.PureComponent<AboutPageProps> {
  constructor(props: AboutPageProps) {
    super(props)
  }
  render() {
    return (
      <Layout>
        <article>
          <h2>よもやまごとのやま</h2>
          <Typography component="p">
            山にまつわることを集めていきます。 contact{" "}
            <a href="https://twitter.com/sett4">https://twitter.com/sett4</a>
          </Typography>
        </article>
      </Layout>
    )
  }
}

export default withRoot(withStyles(styles)(AboutPage))
