protectRoutes();
checkAuthTokenAndLoadAdminPanel();
const daysRemainingElement = document.getElementById("days-remaining");
const renewButton = document.getElementById("renew-button");
const newsList = document.getElementById("news-list");
import { setUsername, getUsername } from "../user-data.js";
import { getToken, isTokenValid, deleteToken } from "../security/authtokens.js";
const redeemDialog = document.getElementById("redeemDialog");
const redeemMessageElement = document.querySelector(".redeem-message");
const redeemBtn = document.getElementById("redeem-button");
const redeemForm = document.getElementById("redeemForm");

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  deleteToken();
  window.location.href = "/";
});


window.onload = function () {
  const licenseDialog = document.getElementById("licenseDialog");
  const closeButton = document.querySelector(".close-button");
  const licenseForm = document.getElementById("licenseForm");
  const licenseKeyElement = document.querySelector(".license-key");
  
  const genLicenseButton = document.getElementById("genLicense");
  genLicenseButton.addEventListener("click", () => {
    licenseDialog.style.display = "block";
});

closeButton.addEventListener("click", () => {
  licenseDialog.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === licenseDialog) {
    licenseDialog.style.display = "none";
  }
});

licenseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const adminUsername = document.getElementById("adminUsername").value;
  const adminPassword = document.getElementById("adminPassword").value;
  const username = document.getElementById("username").value;
  const days = document.getElementById("days").value;
  
  const response = await fetch("/license/create_license", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Ausername: adminUsername,
      password: adminPassword,
      username,
      days,
    }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    licenseKeyElement.textContent = `Generated License Key: ${data.license_key}`;
  } else {
    licenseKeyElement.textContent = `Error: ${data.error}`;
  }
});
}

function protectRoutes() {
  isTokenValid()
  .then((isValid) => {
    if (!isValid) {
      window.location.href = "/";
    } else {
      fetchSubscriptionData();
    }
  })
  .catch((error) => console.error("Error in protectRoutes:", error));
}

function checkAuthTokenAndLoadAdminPanel() {
    fetch("/secure/admin-panel", {
      credentials: "include",
    })
    .then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        return "";
      }
    })
    .then((adminPanelHtml) => {
      const container = document.getElementById("admin-panel-container");
      container.innerHTML = adminPanelHtml;
    })
    .catch((error) => console.error("Error loading admin panel:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  redeemBtn.addEventListener("click", () => {
    redeemDialog.style.display = "block";
  });

  const closeButtons = document.querySelectorAll(".close-button");
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      redeemDialog.style.display = "none";
      licenseDialog.style.display = "none";
    });
  });

  window.addEventListener("click", (event) => {
    if (event.target === redeemDialog || event.target === licenseDialog) {
      redeemDialog.style.display = "none";
      licenseDialog.style.display = "none";
    }
  });

  redeemForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const licenseKeyInput = document.getElementById("licenseKeyInput").value;
    console.log(licenseKeyInput);
    console.log(getToken());

    const response = await fetch("/secure/redeem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Direct retrieval
      },
      body: JSON.stringify({ license_key: licenseKeyInput }),
    });

    const data = await response.json();

    if (response.ok) {
      redeemMessageElement.textContent = "License redeemed successfully!";
      redeemMessageElement.style.color = "green";
    } else {
      redeemMessageElement.textContent = `Error: ${data.error}`;
      redeemMessageElement.style.color = "red";
    }
  });
});

// ... Logic to fetch subscription data (days remaining) from your backend ...
async function fetchSubscriptionData() {
  try {
    const response = await fetch("/auth/subcheck", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: getUsername() }), // Replace with username logic
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.message === "User has an active subscription") {
      daysRemainingElement.textContent = `${data.remainingDays} days remaining`;
      renewButton.style.display = "none"; // Hide if active subscription
    } else if (data.message === "User does not have an active subscription") {
      daysRemainingElement.textContent = "No active subscription";
      renewButton.style.display = "block"; // Show renew button
    } else {
      daysRemainingElement.textContent = "Subscription expired";
      renewButton.style.display = "block"; // Show renew button
    }
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    daysRemainingElement.textContent = "Error fetching data";
  }
}

function createDroplet() {
  const droplet = document.createElement("div");
  droplet.classList.add("droplet");

  const size = Math.random() * 25 + 30 + "px";
  droplet.style.width = size;
  droplet.style.height = size;
  droplet.style.left = Math.random() * 90 + "%";

  droplet.style.animationDelay = Math.random() * 5 + "s";

  document.body.appendChild(droplet);
}

// Create multiple droplets
for (let i = 0; i < 35; i++) {
  createDroplet();
}