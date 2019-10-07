import { withStyles } from "@material-ui/core/styles"
import PropTypes from "prop-types"
import React from "react"
import Button from "@material-ui/core/Button"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import MenuIcon from "@material-ui/icons/Menu"
import { Link } from "gatsby"
import Slide from "@material-ui/core/Slide"
import useScrollTrigger from "@material-ui/core/useScrollTrigger"

const styles = {
  appBar: {
    flexGrow: 1,
    padding: 0,
    margin: 0,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  link: {
    textDecoration: "none",
    color: "inherit",
  },
}

function HideOnScroll(props: any) {
  const { children, window } = props
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({ target: window ? window() : undefined })

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

HideOnScroll.propTypes = {
  children: PropTypes.element.isRequired,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
}

const Header = ({ siteTitle, classes, children, window }: any) => (
  <header style={{ height: `5rem` }} className={classes.root}>
    <HideOnScroll {...children}>
      <AppBar style={{ padding: 0, margin: 0 }}>
        <Toolbar>
          <IconButton
            className={classes.menuButton}
            color="inherit"
            aria-label="Menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" className={classes.grow}>
            {siteTitle}
          </Typography>
          {/* <Link to={`/`} className={classes.link}>
          <Button color="inherit">Home</Button>
        </Link> */}
          <Link to={`/incident/`} className={classes.link}>
            <Button color="inherit">山岳事故</Button>
          </Link>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
  classes: PropTypes.object.isRequired,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default withStyles(styles)(Header)
