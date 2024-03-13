const loginForm = document.getElementById("login-form");
const returntoMain = document.getElementById("return-button");

returntoMain.addEventListener("click", () => {
  window.location.href = "/";
});

// Allowed character to be Number, Letter, and special characters
const allowedCharacters = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/;

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;


  if (
    !username.match(allowedCharacters) ||
    !password.match(allowedCharacters)
  ) {
    const errorInput = document.getElementById("username");
    errorInput.style.borderColor = "red";

    const existingErrorMessage = loginForm.querySelector("p");
    if (existingErrorMessage) {
      existingErrorMessage.textContent =
        "Username can only contain letters and numbers";
    } else {
      const errorMessage = document.createElement("p");
      errorMessage.textContent =
        "Username can only contain letters and numbers";
      errorMessage.style.color = "red";
      loginForm.appendChild(errorMessage);
    }
    return;
  }
  fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.message === "Login successful") {
        // storeToken(data.token);
        window.location.href = "/dashboard";
      } else {
        const errorInput = document.getElementById("username");
        errorInput.style.borderColor = "red";

        // Check if an error message already exists
        const existingErrorMessage = loginForm.querySelector("p");

        if (existingErrorMessage) {
          // Update existing message
          existingErrorMessage.textContent = data.error;
        } else {
          // Create error message if it doesn't exist
          const errorMessage = document.createElement("p");
          errorMessage.textContent = data.error;
          errorMessage.style.color = "red";
          loginForm.appendChild(errorMessage);
        }
      }
    })
    .catch((error) => {
      console.error("Error logging in user:", error);
    });
});

function storeToken(token) {
  localStorage.setItem("authToken", token);
}
