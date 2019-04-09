import React from "react"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout"
import moment from 'moment'
import { Helmet } from "react-helmet"
import { List, Header } from 'semantic-ui-react'


type Props = {
  data: {
  incident: {
    edges: [{
      node: {
        id: string;
        source: string;
        author: string;
        sourceName: string;
        url: string;
        title: string;
        content: string;
        date: string;
        publishedDate: string;
      }
    }]
  }
}
}


const Incident = ({ node }: any) => (
  <List.Item>
     <List.Icon name='marker' />
      <List.Content>
      <Link
      style={{ color: `inherit`, textDecoration: `none` }}
      to={`/incident/${node.id}/`}
    >
        <List.Header as="span">{moment(node.date).format('YYYY-MM-DD')} {node.title}</List.Header>
        </Link>
        {/* <List.Description>
        {node.sourceName}
        </List.Description> */}
      </List.Content>

  </List.Item>
)

const IncidentIndexPage: React.FC<Props> = (props) => {
    const incidentEdges = props.data.incident.edges
    return (
      <Layout>
        <Helmet>
          <title>Mountain Incidents</title>
        </Helmet>
          <Header as="h2" >Mountain Incidents</Header>
          <List relaxed='very'>
            {incidentEdges.map(({ node }, i) => (
              <Incident node={node} key={node.id} />
            ))}
          </List>
      </Layout>
    )
  }




export default IncidentIndexPage;


export const pageQuery = graphql`
  query {
    incident: allIncident(
      limit: 1000, 
      filter: { tags: { in: "山岳事故"}},
      sort: {fields: [date, publishedDate], order: DESC}) {
      edges {
        node {
          id,
          title,
          url,
          date,
          publishedDate,
          tags,
          content,
          source,
          sourceName
        }
      }
    }
  }
`
