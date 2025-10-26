const fs = require("fs");
const path = require("path");

// Copy 404.html from root to build directory
const srcFile = path.join(__dirname, "..", "404.html");
const destFile = path.join(__dirname, "..", "build", "404.html");

try {
  fs.copyFileSync(srcFile, destFile);
  console.log("✓ 404.html copied to build directory");
} catch (error) {
  console.error("Error copying 404.html:", error.message);
  process.exit(1);
}
