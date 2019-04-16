import React from "react"
import { Link as GatsbyLink, graphql } from "gatsby"
import Layout from "../components/layout"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import createStyles from "@material-ui/core/styles/createStyles"
import Typography from "@material-ui/core/Typography"
import moment, { months } from "moment"
import { Helmet } from "react-helmet"
import withRoot from "../withRoot"
import { Paper, Link } from "@material-ui/core"
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

interface IncidentIndexProps extends WithStyles<typeof styles> {
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
}

const Incident = ({ node, classes }: any) => (
  <ListItem>
    <Link underline="hover">
      <GatsbyLink
        style={{
          color: `inherit`,
          textDecoration: `none`,
          ":hover": { textDecoration: `underline` },
        }}
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
      </GatsbyLink>
    </Link>
  </ListItem>
)

class IncidentIndexPage extends React.PureComponent<IncidentIndexProps> {
  constructor(props: IncidentIndexProps) {
    super(props)
  }
  render() {
    const incidentEdges = this.props.data.incident.edges
    const monthList = this.props.data.month
    const classes = this.props.classes
    return (
      <Layout>
        <Helmet>
          <title>Mountain Incidents</title>
        </Helmet>
        <Paper>
          <Typography variant="h2" component="h2">
            Mountain Incidents
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

export default withRoot(withStyles(styles)(IncidentIndexPage))

export const pageQuery = graphql`
  query {
    incident: allIncident(
      limit: 50
      filter: { tags: { in: "山岳事故" } }
      sort: { fields: [date, publishedDate], order: DESC }
    ) {
      edges {
        node {
          id
          title
          url
          date
          publishedDate
          tags
          content
          source
          sourceName
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
