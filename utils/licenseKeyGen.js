// Function to generate a unique license key
function generateUniqueLicenseKey() {
  return Math.random().toString(36).substr(2, 10);
}

const colors = require("colors");
console.log("[licenseKeyGen.js]".green, "Exporting generateUniqueLicenseKey function...".yellow);
module.exports = { generateUniqueLicenseKey };