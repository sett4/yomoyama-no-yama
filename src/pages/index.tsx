import React from "react"
import Layout from "../components/layout"
import { Header, Container } from 'semantic-ui-react'
import Typography from '@material-ui/core/Typography'
import Helmet from "react-helmet";

const IndexPage: React.FC = () => (
    <Layout>
        <Helmet>
            <title>よもやまごとのやま</title>
        </Helmet>
        <Header as="h2">よもやまごとのやま</Header>
        <p>
            山にまつわることを集めていきます。
        contact <a href="https://twitter.com/sett4">https://twitter.com/sett4</a>
        </p>
    </Layout>
)


export default IndexPage;
