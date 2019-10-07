import React from "react"
import { Link } from "gatsby"
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
import { Paper } from "@material-ui/core"

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
          <ListItem key={node.month}>
            <Link
              style={{ color: `inherit`, textDecoration: `underline` }}
              to={`/incident/${node.month}/`}
            >
              <ListItemText primary={node.month} />
            </Link>
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default IncidentMonthlyFragment
