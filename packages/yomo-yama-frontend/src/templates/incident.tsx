import React from "react"
import { Link as GatsbyLink, graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout"
import { Helmet } from "react-helmet"
import {
  Paper,
  TableBody,
  TableRow,
  Table,
  TableCell,
  Typography,
  Divider,
  Link,
} from "@material-ui/core"
import moment from "moment"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import createStyles from "@material-ui/core/styles/createStyles"
import withRoot from "../withRoot"

const styles = (theme: Theme) => {
  return createStyles({})
}

interface IncidentTemplateProps extends WithStyles<typeof styles> {
  data: {
    incident: {
      source: string
      sourceName: string
      url: string
      title: string
      content: string
      date: string
      publishedDate: string
      tags: string[]
      author: string
    }
  }
}

class IncidentTemplate extends React.Component<IncidentTemplateProps> {
  constructor(props: IncidentTemplateProps) {
    super(props)
  }
  render() {
    const incident = this.props.data.incident
    const classes = this.props.classes
    return (
      <Layout>
        <Helmet>
          <title>{incident.title} - Mountain Incident</title>
        </Helmet>
        <Paper>
          <Typography variant="h2">{incident.title}</Typography>
          <Typography>
            {incident.tags.includes("__private-use")
              ? incident.content.substring(
                  0,
                  Math.min(120, incident.content.length)
                ) + "..."
              : incident.content}
          </Typography>

          <Divider className="section-divider" />

          <Typography variant="h2">Metadata</Typography>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell variant="head">source</TableCell>
                <TableCell>
                  <Link underline="hover" href={incident.url} rel="noopener">
                    {incident.sourceName}
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">date</TableCell>
                <TableCell>{moment(incident.date).format()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">published</TableCell>
                <TableCell>{moment(incident.publishedDate).format()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell variant="head">tags</TableCell>
                <TableCell>
                  {incident.tags.map((tag, i) => (
                    <Typography component="span" key={tag}>
                      {tag}
                    </Typography>
                  ))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Layout>
    )
  }
}

export default withRoot(withStyles(styles)(IncidentTemplate))

export const pageQuery = graphql`
  query($id: String!) {
    incident(id: { eq: $id }) {
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
`
