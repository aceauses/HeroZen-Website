const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");

const urlParams = new URLSearchParams(window.location.search);
const registrationSuccess = urlParams.get("registrationSuccess");

if (registrationSuccess) {
  console.log("Registration successful");
  const notification = document.querySelector(".notification");
  notification.style.display = "block";
}

loginButton.addEventListener("click", () => {
  window.location.href = "/login";
});

registerButton.addEventListener("click", () => {
  window.location.href = "/register";
});

function createDroplet() {
  if (droplets_limit <= 0) {
    return;
  }
  const droplet = document.createElement("div");
  droplet.classList.add("droplet");

  const size = Math.random() * 50 + 50 + "px";
  droplet.style.width = size;
  droplet.style.height = size;
  droplet.style.left = Math.random() * 100 + "%";

  droplet.style.animationDelay = Math.random() * 5 + "s";

  document.body.appendChild(droplet);
  droplets_limit--;
}

let droplets_limit = 100;

// Create multiple droplets
for (let i = 0; i < 35; i++) {
  createDroplet();
}
