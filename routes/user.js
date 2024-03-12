const { db } = require("../database/database");
const bcrypt = require("bcrypt");


// Ban user for exceeding HWID fail limit
async function banUserForHwidFails(username) {
  const query = "SELECT hwid_fails FROM users WHERE username = ?";
  const params = [username];

  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(); // User not found, nothing to do
      } else {
        const newFailCount = row.hwid_fails + 1;

        if (newFailCount > 3) {
          db.run(
            "UPDATE users SET hwid_fails = 0, is_banned = 1 WHERE username = ?",
            [username],
            (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(
                  `User ${username} banned for exceeding HWID fail limit.`
                );
                resolve();
              }
            }
          );
        } else {
          db.run(
            "UPDATE users SET hwid_fail_count = ?",
            [newFailCount],
            (err) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        }
      }
    });
  });
}

// Check if the user is banned
function isUserBanned(username) {
  return new Promise((resolve, reject) => {
    const query = "SELECT is_banned FROM users WHERE username = ?";
    const params = [username];

    db.get(query, params, (err, user) => {
      if (err) {
        console.error("Error checking if user is banned:", err);
        reject(err);
      } else {
        resolve(user && user.is_banned);
      }
    });
  });
}

// Check if user is Admin
function isAdmin(username) {
  const query = "SELECT is_admin FROM users WHERE username = ?";
  const params = [username];

  // Return a new Promise
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error("Error checking if user is admin:", err);
        reject(err); // Reject the promise on error
      } else if (!row) {
        resolve(false); // Resolve with false if no user found
      } else {
        resolve(row.is_admin); // Resolve with the 'is_admin' value
      }
    });
  });
}

// Validate Admin password from database using Bcrypt compare
async function validateAdminPassword(username, password) {
  const query =
    "SELECT password FROM users WHERE username = ? AND is_admin = 1";
  const params = [username];

  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error("Error validating admin password:", err);
        reject(err);
      } else if (!row) {
        resolve(false); // User not found or not an admin
      } else {
        bcrypt.compare(password, row.password, (err, isMatch) => {
          if (err) {
            reject(err);
          } else {
            resolve(isMatch);
          }
        });
      }
    });
  });
}

// Cansole log using colors
const colors = require("colors");
console.log("[user.js] ".green, "Functions exported:\n".yellow, {
  isUserBanned,
  isAdmin,
  validateAdminPassword,
  banUserForHwidFails,
});
module.exports = {
  banUserForHwidFails,
  isUserBanned,
  isAdmin,
  validateAdminPassword,
  banUserForHwidFails,
};
