/**
 * release.js
 * Creates a distributable ZIP of the plugin, excluding dev-only files.
 * Run via: npm run release
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const os = require("os")

// Read version from the main plugin file
const pluginFile = fs.readFileSync("foodcoop.php", "utf8")
const versionMatch = pluginFile.match(/Version:\s*([\d.]+)/)
if (!versionMatch) {
  console.error("Could not determine plugin version from foodcoop.php")
  process.exit(1)
}
const version = versionMatch[1]
const zipName = `pot-plugin-${version}.zip`

// Files/folders to include in the release ZIP
const include = ["build", "images", "inc", "languages", "scripts", "styles", "vendor", "composer.json", "foodcoop.php", "index.php", "README.md", "uninstall.php"]

function copyRecursive(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child))
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
  }
}

if (fs.existsSync(zipName)) {
  fs.unlinkSync(zipName)
  console.log(`Removed old ${zipName}`)
}

const tmpDir = path.join(os.tmpdir(), "pot-plugin-release")
if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, { recursive: true })
}
fs.mkdirSync(tmpDir, { recursive: true })

for (const item of include) {
  if (!fs.existsSync(item)) {
    console.warn(`Warning: "${item}" not found, skipping.`)
    continue
  }
  copyRecursive(item, path.join(tmpDir, item))
  console.log(`  + ${item}`)
}

const zipPath = path.resolve(zipName)
execSync(`powershell -Command "Compress-Archive -Path '${tmpDir}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: "inherit" })

fs.rmSync(tmpDir, { recursive: true })

console.log(`\nRelease ZIP created: ${zipName}  (v${version})`)
