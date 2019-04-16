import React from "react"
import { Link as GatsbyLink, graphql } from "gatsby"
import * as PropTypes from "prop-types"
import Img from "gatsby-image"
import { rhythm } from "../utils/typography"
import Layout from "./layout"
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
import { Helmet } from "react-helmet"
import withRoot from "../withRoot"
import { Paper, Link } from "@material-ui/core"

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

interface IncidentMonthlyFragmentProps extends WithStyles<typeof styles> {
  month: {
    edges: [
      {
        node: {
          month: string
          started: Date
          ended: Date
        }
      }
    ]
  }
}

const IncidentMonthlyFragment: React.FC<IncidentMonthlyFragmentProps> = ({
  month,
}) => {
  return (
    <Paper>
      <Typography variant="h2">Monthly Archive</Typography>
      <List>
        {month.edges.map(({ node }, i) => (
          <ListItem>
            <Link underline="hover">
              <GatsbyLink
                style={{ color: `inherit`, textDecoration: `none` }}
                to={`/incident/${node.month}/`}
              >
                <ListItemText primary={node.month} />
              </GatsbyLink>
            </Link>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default IncidentMonthlyFragment
