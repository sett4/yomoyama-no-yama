/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

require("source-map-support").install()

// require("tsconfig-paths").register({
//   baseUrl: "./",
//   paths: {
//     "@src/*": ["src/*"],
//     "@test/*": ["test/*"],
//   },
// })

require("ts-node").register({
  compilerOptions: {
    module: "commonjs",
    target: "es2017",
    noImplicitAny: false,
  },
})

// You can delete this file if you're not using it
const gatsbyNodeTs = require("./gatsby-node-ts")

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programmatically
// create pages.
exports.createPages = gatsbyNodeTs.createPages
exports.sourceNodes = gatsbyNodeTs.sourceNodes
