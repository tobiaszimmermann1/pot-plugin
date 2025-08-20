const defaultConfig = require("@wordpress/scripts/config/webpack.config.js")
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  ...defaultConfig,
  entry: {
    frontend: "./src/frontend.js",
    backend: "./src/backend.js"
  },
  plugins: [new NodePolyfillPlugin(), ...defaultConfig.plugins.filter(plugin => plugin.constructor.name !== "ReactRefreshPlugin")],
  module: {
    ...defaultConfig.module,
    rules: defaultConfig.module.rules.map(rule => {
      if (rule.use && rule.use.loader && rule.use.loader.includes("babel-loader")) {
        return {
          ...rule,
          use: {
            ...rule.use,
            options: {
              ...rule.use.options,
              plugins: (rule.use.options.plugins || []).filter(p => !(Array.isArray(p) && p[0] === "react-refresh/babel"))
            }
          }
        }
      }
      return rule
    })
  },
  devServer: {
    ...defaultConfig.devServer,
    allowedHosts: "all",
    liveReload: true,
    watchFiles: ["**/*.php"]
  }
}
