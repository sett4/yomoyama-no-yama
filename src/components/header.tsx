import { withStyles } from '@material-ui/core/styles';
import PropTypes from "prop-types"
import React from "react"
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from "gatsby"

const styles = {
  root: {
    flexGrow: 1,
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
    color: "inherit"
  }
};

const Header = ({ siteTitle, classes }: any) => (
  <header style={{ height: `5rem` }} className={classes.root}>
    <AppBar position="fixed">
      <Toolbar>
        <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" className={classes.grow}>
          {siteTitle}
        </Typography>
        <Link to={ `/`} className={classes.link} ><Button color="inherit">Home</Button></Link>
        <Link to={ `/incident/`} className={classes.link} ><Button color="inherit">Incident</Button></Link>
      </Toolbar>
    </AppBar>
  </header>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
  classes: PropTypes.object.isRequired,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default withStyles(styles)(Header);
