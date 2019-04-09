import React from "react"
import { Link, graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout"
import { Helmet } from "react-helmet"
import moment from 'moment'
import { Header, Container, Table, Button } from "semantic-ui-react";

type IncidentTemplateProps = {
  data: {
    incident: {
      source: string;
      sourceName: string;
      url: string;
      title: string;
      content: string;
      date: string;
      publishedDate: string;
      tags: string[];
      author: string;
    }
  }
}

const IncidentTemplate: React.FC<IncidentTemplateProps> = (props) => {
  const incident = props.data.incident
  return (
    <Layout>
      <Helmet>
        <title>{incident.title} - Mountain Incident</title>
      </Helmet>
      {/* <div
        style={{
          display: `flex`,
          alignItems: `center`,
        }}
      >
      </div> */}
      <Container text>
      <Header as="h2">{incident.title}</Header>
        <p>
        {
        incident.tags.includes('__private-use') ? incident.content.substring(0, Math.min(64,incident.content.length))+'(snip)' : incident.content
      }
        </p>
      {/* <Paper elevation={1}> */}
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>source</Table.Cell>
            <Table.Cell><a href={incident.url} rel="noopener">{incident.sourceName}</a></Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>date</Table.Cell>
            <Table.Cell>{moment(incident.date).format()}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>published</Table.Cell>
            <Table.Cell>{moment(incident.publishedDate).format()}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>tags</Table.Cell>
            <Table.Cell>
            {incident.tags.map(( tag, i ) => (
              <Button key={tag}>{tag}</Button>
              ))}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      {/* </Paper> */}

      </Container>
    </Layout>
  )
}




export default IncidentTemplate

export const pageQuery = graphql`
  query($id: String!) {
    incident(id: { eq: $id }) {
      title,
      url,
      content,
      source,
      sourceName,
      date,
      publishedDate,
      tags
    }
  }
`