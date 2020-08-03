/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  siteMetadata: {
    title: `evendilo ui`,
    description: `The frontend of evendilo`,
    author: `@digitalillusion`
  },
  /* Your site config here */
  plugins: [{
    resolve: `gatsby-plugin-silverghost`,
    options: {
      // [required] - path to your createStore module
      pathToCreateStoreModule: "./src/state/createStore",
      // [required] - path to your createActions module
      pathToCreateActions: "./src/actions/createActions",
      // [optional] - options passed to `serialize-javascript`
      // info: https://github.com/yahoo/serialize-javascript#options // will be merged with these defaults:  serialize: {
      space: 0,
      isJSON: true,
      unsafe: false
    }
  }]
}
