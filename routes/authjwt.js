const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { db } = require("../database/database");
const fs = require("fs");

function authenticateToken(req, res, next) {
  // Get authToken cookie
  const authToken = req.cookies.authToken;

  if (!authToken) return res.sendStatus(401); // Unauthorized

  try {
    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(authToken, secret);

    if (decoded.is_banned) {
      return res.status(403).json({ error: "Forbidden: User is banned" });
    }
    // Attach the decoded data to the request
    req.user = decoded;

    next(); // Proceed to the actual route handler
  } catch (err) {
    return res.sendStatus(403); // Forbidden
  }
}

// Protected route
router.post("/verify", authenticateToken, (req, res) => {
    res.json({
      message: "Token valid",
      user: {
        username: req.user.username,
        isAdmin: req.user.isAdmin,
      },
    });
});

router.get("/admin-panel", authenticateToken, (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
  } else {
    const adminPanelHTML = fs.readFileSync("/root/Javascript/private-html/admin/admin-panel.html");
    res.send(adminPanelHTML);
  }
});

router.post("/redeem", authenticateToken, async (req, res) => {
  const { license_key } = req.body;

  if (!license_key) {
    return res.status(400).json({ error: "License key is required" });
  }

  const username = req.user.username;
  try {
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

router.post("/logout", (req, res) => {
  // Clear the authToken cookie
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/",
  });
  res.sendStatus(200);
});

const colors = require("colors");
console.log("[authjwt.js]".yellow + " Module loaded.");
module.exports = router;
module.exports.authenticateToken = authenticateToken;
