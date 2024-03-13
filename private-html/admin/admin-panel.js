const licenseDialog = document.getElementById("licenseDialog");
const closeButton = document.querySelector(".close-button");
const licenseForm = document.getElementById("licenseForm");
const licenseKeyElement = document.querySelector(".license-key");
const genLicenseButton = document.getElementById("genLicense");

genLicenseButton.addEventListener("click", () => {
  console.log("genLicenseButton clicked");
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
