const defaultConfig = require("./node_modules/@wordpress/scripts/config/webpack.config.js")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")
const path = require("path")

module.exports = {
  ...defaultConfig,
  ...{
    plugins: [new NodePolyfillPlugin()]
  },
  entry: { frontend: "./src/frontend.js", backend: "./src/backend.js" }
}
