const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
import { isTokenValid } from "../security/authtokens.js";

const urlParams = new URLSearchParams(window.location.search);
const registrationSuccess = urlParams.get("registrationSuccess");

if (registrationSuccess) {
  console.log("Registration successful");
  const notification = document.querySelector(".notification");
  notification.style.display = "block";
}

loginButton.addEventListener("click", () => {
  isTokenValid()
    .then((isValid) => {
      if (isValid) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login";
      }
    })
    .catch((error) => console.error("Error in loginButton:", error));
});

registerButton.addEventListener("click", () => {
  window.location.href = "/register";
});

function createDroplet() {
  const droplet = document.createElement("div");
  droplet.classList.add("droplet");

  const size = Math.random() * 25 + 30 + "px";
  droplet.style.width = size;
  droplet.style.height = size;
  droplet.style.left = Math.random() * 100 + "%";

  droplet.style.animationDelay = Math.random() * 5 + "s";

  document.body.appendChild(droplet);
}

// Create multiple droplets
for (let i = 0; i < 35; i++) {
  createDroplet();
}