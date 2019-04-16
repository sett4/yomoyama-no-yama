import React from "react"
import Layout from "../components/layout"
import { Theme } from "@material-ui/core/styles/createMuiTheme"
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles"
import createStyles from "@material-ui/core/styles/createStyles"
import Typography from "@material-ui/core/Typography"
import withRoot from "../withRoot"
import { Paper, Link } from "@material-ui/core"
import Helmet from "react-helmet"

const styles = (theme: Theme) => {
  return createStyles({})
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
        <Helmet>
          <title>よもやまごとのやま</title>
          <meta
            name="description"
            content="山にまつわるデータをあつめています。山岳事故や気象、全国の山について。"
          />
        </Helmet>
        <Paper>
          <Typography variant="h2">よもやまごとのやま</Typography>
          <Typography component="p">
            山にまつわることを集めていきます。
          </Typography>
          <Typography component="p">
            contact {}
            <Link href="https://twitter.com/sett4">
              https://twitter.com/sett4
            </Link>
          </Typography>
        </Paper>
      </Layout>
    )
  }
}

export default withRoot(withStyles(styles)(AboutPage))
