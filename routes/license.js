const { db } = require("../database/database");
const express = require("express");
const router = express.Router();
const { isUserBanned, isAdmin, validateAdminPassword } = require("./user.js");
const { generateUniqueLicenseKey } = require("../utils/licenseKeyGen.js");
const { authenticateToken } = require("./authjwt.js");

// /redeem endpoint
router.post("/redeem", async (req, res) => {
  const { license_key, username } = req.body;

  if (!license_key) {
    return res.status(400).json({ error: "License key is required" });
  }
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    // Check if the user is banned
    isUserBanned(username).then((isBanned) => {
      if (isBanned) {
        return res.status(403).json({ error: "User is banned" });
      }
    });
    const license = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM licenses WHERE license_key = ?",
        [license_key],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });
    if (!license) {
      return res.status(404).json({ error: "Invalid license key" });
    } else if (license.redeemed_at) {
      return res.status(409).json({ error: "License already redeemed" });
    } else if (license.username && license.username !== username) {
      return res.status(403).json({ error: "License not assigned to you" });
    }

    db.run(
      "UPDATE licenses SET redeemed_at = ?, redeemed_by = ? WHERE license_key = ?",
      [Date.now(), username, license_key]
    );
    db.run(
      "UPDATE users SET active_sub = 1, sub_start = ?, sub_duration = ? WHERE username = ?",
      [Date.now(), Date.now() + license.days * 24 * 60 * 60 * 1000, username]
    );

    res.json({
      message: "License redeemed successfully",
      subscriptionDays: license.days,
    });
  } catch (err) {
    console.error(err); // Log errors for debugging
    res.status(500).json({ error: "Error redeeming license" });
  }
});

// /create_license endpoint
router.post("/create_license", authenticateToken, async (req, res) => {

  const { days, username, Ausername, password } = req.body;

  if (!days || !Ausername || !password) {
    return res.status(400).json({ error: "Days, Ausername, and password are required" });
  }

  // Check the user to be admin
  if (!(await isAdmin(Ausername))) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  // Validate Admin password
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  // Check admin account password to be correct
  if (!(await validateAdminPassword(Ausername, password))) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const licenseKey = generateUniqueLicenseKey();

  db.run(
    "INSERT INTO licenses (license_key, days, username, created_at) VALUES (?, ?, ?, ?)",
    [licenseKey, days, username, Date.now()],
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Error creating license" });
      } else {
        res.json({ license_key: licenseKey });
      }
    }
  );
});

// Cansole log using colors
const colors = require("colors");
console.log("[License]:".green, "License route loaded".cyan);
module.exports = router;
