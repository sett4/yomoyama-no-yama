/* eslint-disable no-underscore-dangle */

import { SheetsRegistry } from "jss"
import {
  createMuiTheme,
  createGenerateClassName,
} from "@material-ui/core/styles"
import purple from "@material-ui/core/colors/purple"
import green from "@material-ui/core/colors/green"
import { rhythm } from "./utils/typography"

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: purple[300],
      main: purple[500],
      dark: purple[700],
    },
    secondary: {
      light: green[300],
      main: green[500],
      dark: green[700],
    },
  },
  typography: {
    useNextVariants: true,
    h2: {
      fontSize: 30,
      marginTop: 20,
      marginBottom: 25,
    },
    h3: {
      fontSize: 25,
      marginTop: 15,
      marginBottom: 15,
    },
    body2: {
      color: "inherit",
      marginTop: 10,
      marginBottom: 10,
    },
  },
  overrides: {
    MuiPaper: {
      elevation2: {
        padding: rhythm(1),
        margin: rhythm(0.2),
      },
    },
    GatsbyLink: {
      textDecoration: "none",
    },
  },
  // overrides: {
  //   MuiPaper: {
  //     root: {
  //       padding: rhythm(1),
  //     },
  //   },
  // },
})

function createPageContext() {
  return {
    theme,
    // This is needed in order to deduplicate the injection of CSS in the page.
    sheetsManager: new Map(),
    // This is needed in order to inject the critical CSS.
    sheetsRegistry: new SheetsRegistry(),
    // The standard class name generator.
    generateClassName: createGenerateClassName(),
  }
}

export default function getPageContext() {
  // Make sure to create a new context for every server-side request so that data
  // isn't shared between connections (which would be bad).
  if (!(process as any).browser) {
    return createPageContext()
  }

  // Reuse context on the client-side.
  if (!(global as any).__INIT_MATERIAL_UI__) {
    ;(global as any).__INIT_MATERIAL_UI__ = createPageContext()
  }

  return (global as any).__INIT_MATERIAL_UI__
}
