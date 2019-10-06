import React from "react"
import { Link, graphql } from "gatsby"
import { rhythm } from "../utils/typography"
import Layout from "../components/layout"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import createStyles from "@material-ui/core/styles/createStyles"
import Typography from "@material-ui/core/Typography"
import moment from "moment"
import { Helmet } from "react-helmet"
import withRoot from "../withRoot"
import { Paper } from "@material-ui/core"
import IncidentMonthlyFragment from "../components/IncidentMonthlyFragment"

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

interface IncidentMonthlyIndexProps extends WithStyles<typeof styles> {
  classes: any
  data: {
    incident: {
      edges: [
        {
          node: {
            id: string
            source: string
            author: string
            sourceName: string
            url: string
            title: string
            content: string
            date: string
            publishedDate: string
          }
        }
      ]
    }
    month: string
  }
  pageContext: {
    month: string
  }
}

const Incident = ({ node, classes }: any) => (
  <ListItem>
    <Link
      style={{ color: `inherit`, textDecoration: `none` }}
      to={`/incident/${node.id}/`}
    >
      <ListItemText
        primary={moment(node.date).format("YYYY-MM-DD") + " " + node.title}
        secondary={
          <React.Fragment>
            <Typography component="span" color="textSecondary">
              {node.sourceName}
            </Typography>
            {/* {node.content} */}
          </React.Fragment>
        }
      />
    </Link>
  </ListItem>
)

class IncidentMonthlyIndexPage extends React.PureComponent<
  IncidentMonthlyIndexProps
> {
  constructor(props: IncidentMonthlyIndexProps) {
    super(props)
  }
  render() {
    const incidentEdges = this.props.data.incident.edges
    const pageContext = this.props.pageContext
    const classes = this.props.classes
    const monthList = this.props.data.month
    return (
      <Layout>
        <Helmet>
          <title>Mountain Incidents {pageContext.month}</title>
        </Helmet>
        <Paper>
          <Typography variant="h2">
            Mountain Incidents {pageContext.month}
          </Typography>
          <List>
            {incidentEdges.map(({ node }, i) => (
              <Incident node={node} classes={classes} key={node.id} />
            ))}
          </List>
        </Paper>
        <IncidentMonthlyFragment month={monthList} classes={classes} />
      </Layout>
    )
  }
}

export default withRoot(withStyles(styles)(IncidentMonthlyIndexPage))

export const pageQuery = graphql`
  query($started: Date, $ended: Date) {
    incident: allIncident(
      filter: { tags: { in: "山岳事故" }, date: { gte: $started, lte: $ended } }
      sort: { fields: [date, publishedDate] }
    ) {
      edges {
        node {
          id
          title
          url
          content
          source
          sourceName
          date
          publishedDate
          tags
        }
      }
    }
    month: allIncidentMonthly(sort: { fields: [month], order: [DESC] }) {
      edges {
        node {
          id
          month
          started
          ended
        }
      }
    }
  }
`
