fetchSubscriptionData();
// checkAuthTokenAndLoadAdminPanel();
const daysRemainingElement = document.getElementById("days-remaining");
const renewButton = document.getElementById("renew-button");
const newsList = document.getElementById("news-list");
import { deleteToken } from "../security/authtokens.js";
const redeemDialog = document.getElementById("redeemDialog");
const redeemMessageElement = document.querySelector(".redeem-message");
const redeemBtn = document.getElementById("redeem-button");
const redeemForm = document.getElementById("redeemForm");

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  deleteToken();
  window.location.href = "/";
});



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
    if (event.target === redeemDialog) {
      redeemDialog.style.display = "none";
      licenseDialog.style.display = "none";
    }
  });
  
  redeemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const licenseKeyInput = document.getElementById("licenseKeyInput").value;
    
    const response = await fetch("/secure/redeem", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
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
      credentials: "include",
    });
    
    if (!response.ok) {
      // throw new Error(`HTTP Error: ${response.status}`);
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


function checkAuthTokenAndLoadAdminPanel() {
  fetch("/secure/admin-panel", {
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.text();
    })
    .then((adminPanelHTML) => {
      const container = document.getElementById("admin-panel-container");
      if (adminPanelHTML.trim() === "") {
        container.innerHTML = "";
      } else {
        container.innerHTML = adminPanelHTML;
        const script = document.createElement("script");
        fetch("/secure/admin-panel-script", {
          credentials: "include",
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP Error: ${response.status}`);
            }
            return response.text();
          })
          .then((adminPanelJS) => {
            script.textContent = adminPanelJS;
            document.head.appendChild(script);
          })
          .catch((error) => console.error("Error loading admin panel script:", error));
      }
    })
    .catch((error) => console.error("Error loading admin panel:", error));
}
document.addEventListener("DOMContentLoaded", checkAuthTokenAndLoadAdminPanel);
// window.addEventListener("load", checkAuthTokenAndLoadAdminPanel);

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

let currentPage = 1;

// Function to fetch news data from the backend
async function fetchNewsData(page) {
  try {
    const response = await fetch(`/api/news?page=${page}`);
    const newsData = await response.json();
    return newsData;
  } catch (error) {
    console.error("Error fetching news data:", error);
    return [];
  }
}

// Function to create a news item element
function createNewsItemElement(newsItem) {
  const newsItemElement = document.createElement('div');
  newsItemElement.classList.add('news-item');

  const newsHeading = document.createElement('h3');
  newsHeading.textContent = newsItem.title;

  const newsContent = document.createElement('p');
  newsContent.textContent = newsItem.content;

  newsItemElement.appendChild(newsHeading);
  newsItemElement.appendChild(newsContent);

  return newsItemElement;
}

// Function to load and display news items
async function loadNewsItems() {
  const newsData = await fetchNewsData(currentPage);
  const newsListElement = document.querySelector(".news-list");
  newsListElement.innerHTML = ""; // Clear previous news items

  if (newsData && newsData.length > 0) {
    newsData.forEach((item) => {
      const newsItemElement = createNewsItemElement(item);
      newsListElement.appendChild(newsItemElement);
    });
  } else {
    const noNewsElement = document.createElement("p");
    noNewsElement.textContent = "No news available.";
    newsListElement.appendChild(noNewsElement);
  }
}

// Function to handle the "Load More" button click
const loadMoreButton = document.querySelector(".load-more-btn");
loadMoreButton.addEventListener("click", async () => {
  currentPage++;
  await loadNewsItems();
});

// Load initial news items
loadNewsItems();