const sqlite3 = require("sqlite3").verbose();

let db; // Declare the global 'db' variable

// Open database connection
function openDatabase() {
  db = new sqlite3.Database("./data.db", (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Connected to database");
    }
  });
}

// Create tables (if needed)
async function initializeTables() {
  openDatabase(); // Call the openDatabase function

  const createLicenseTableQuery = `CREATE TABLE IF NOT EXISTS licenses (
    license_key TEXT PRIMARY KEY,
    days INTEGER,
    username TEXT,
    created_at TEXT,
    redeemed_at TEXT,
    redeemed_by TEXT
  )`;

  const createUsersTableQuery = `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    hwid TEXT,
    active_sub INTEGER,
    hwid_fails INTEGER,
    sub_start INTEGER,
    sub_duration INTEGER,
    is_admin INTEGER,
    is_banned INTEGER
  )`;

  await new Promise((resolve, reject) => {
    db.run(createLicenseTableQuery, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log("Licenses table initialized successfully");
        resolve();
      }
    });
  });

   await new Promise((resolve, reject) => {
       db.run(createUsersTableQuery, (err) => {
           if (err) {
           reject(err);
           } else {
            console.log("Users table initialized successfully");
           resolve();
           }
       });
       });
}

// Call the initializeTables function
initializeTables();
const colors = require("colors");
console.log("[database.js]".green, "Database initialized successfully".yellow);
module.exports = {
  db
};