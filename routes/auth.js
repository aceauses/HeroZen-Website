const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { db } = require("../database/database"); // Import 'db' from database.js
// const { banUserForHwidFails } = require("./user");
const jwt = require('jsonwebtoken'); // Install 'jsonwebtoken' package 
const { authenticateToken } = require("./authjwt");


// /login (POST) endpoint WEB APP
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

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

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const payload = {
        userId: user.id,
        username: user.username,
        isAdmin: user.is_admin,
        isBanned: user.is_banned
      };
      const secret = process.env.JWT_SECRET;

      const token = jwt.sign(payload, secret, { expiresIn: "1h" });

      res
        .cookie("authToken", token, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 3600000, // 1 hour
        })
        .status(200)
        .json({ message: "Login successful" });
    } else {
      res.status(401).json({ error: "Incorrect username or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Basic validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    // Check if the username already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Hash the password
    const saltRounds = 12; // Adjust for desired security level
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const hwid = "0";
    const active_sub = 0;
    const hwid_fails = 0;
    const sub_start = 0;
    const sub_duration = -1;
    const Admin = 0;
    const is_banned = 0;

    // Insert new user into database
    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (username, password, hwid, active_sub, hwid_fails, sub_start, sub_duration, is_admin, is_banned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [username, passwordHash, hwid, active_sub, hwid_fails, sub_start, sub_duration, Admin, is_banned],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subcheck", authenticateToken, async (req, res) => {
  const username = req.user.username;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
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
      return res.status(404).json({ error: "User not found" });
    }

    if (user.is_banned) {
      return res.status(403).json({ error: "User is banned" });
    }

    if (user.active_sub) {
      const remainingSub = user.sub_duration - Date.now();
      const remainingDays = Math.floor(remainingSub / (1000 * 60 * 60 * 24)); // Calculate days

      res.json({ message: "User has an active subscription", remainingDays });
    } else {
      res.json({ message: "User does not have an active subscription" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Cansole log using colors
const colors = require("colors");
console.log("[Auth]:".green, "Auth route loaded".cyan);
module.exports = router;
