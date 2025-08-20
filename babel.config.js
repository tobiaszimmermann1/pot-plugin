module.exports = {
  presets: [
    [
      "@wordpress/babel-preset-default",
      {
        // Disable React Refresh injection
        reactRefresh: false
      }
    ]
  ]
}
