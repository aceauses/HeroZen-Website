const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { db } = require("../database/database"); // Import 'db' from database.js
const { banUserForHwidFails } = require("./user");

// /version endpoint
router.get("/version", (req, res) => {
  res.json({ version: "1.0" });
});

// /status endpoint
router.get("/status", (req, res) => {
  res.json({ status: "OK" });
});

// /login (POST) endpoint
router.post("/login", async (req, res) => {
  const { username, password, hwid } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Fetch user based on provided username
    const user = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({ error: "Incorrect username or password" });
    }
    // Check if the user is banned
    if (user.is_banned) {
      return res.status(403).json({ error: "User is banned" });
    }

    if (user.hwid == 0) {
      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE users SET hwid = ? WHERE username = ?",
          [hwid, username],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
    }

    if (user.hwid_fails > 3) {
      await banUserForHwidFails(username);
      return res.status(409).json({ error: "HWID limit reached" });
    }

    if (user.hwid != hwid) {
      await new Promise((resolve, reject) => {
        db.run(
          "UPDATE users SET hwid_fails = ? WHERE username = ?",
          [user.hwid_fails + 1, username],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });
      return res.status(409).json({ error: "HWID does not match" });
    }

    if (user.active_sub == 0) {
      return res
        .status(409)
        .json({ error: "User does not have an active subscription" });
    }

    if (user.sub_duration < Date.now()) {
      return res.status(409).json({ error: "Subscription has expired" });
    }
    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.status(200).json({ message: "Login successful " + user.hwid });
    } else {
      res.status(401).json({ error: "Incorrect username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const colors = require("colors");
console.log("[application.js]".green, "Exporting application router...".yellow);
module.exports = router;
