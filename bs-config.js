module.exports = {
  // Update this URL to match your WordPress site:
  // Examples:
  // Herd HTTPS: "https://foodcoop.test" 
  // Herd HTTP: "http://foodcoop.test"
  // XAMPP: "http://localhost/foodcoop"
  // Local by Flywheel: "https://foodcoop.local"
  proxy: "http://foodcoop.test",
  files: [
    "build/**/*.js",
    "build/**/*.css", 
    "inc/**/*.php",
    "**/*.php"
  ],
  ignore: [
    "node_modules",
    "vendor"
  ],
  reloadDelay: 1000,
  notify: false,
  open: false, // Manually open http://localhost:3000
  cors: true,
  logLevel: "info"
};
