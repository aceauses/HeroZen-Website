const registrationForm = document.getElementById('registration-form');
const returntoMain = document.getElementById("return-button");

returntoMain.addEventListener('click', () => {
  window.location.href = "/";
});

const allowedCharacters = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/;

registrationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username.match(allowedCharacters) || !password.match(allowedCharacters)) {
    const errorInput = document.getElementById("username");
    errorInput.style.borderColor = "red";

    const existingErrorMessage = registrationForm.querySelector("p");
    if (existingErrorMessage) {
      existingErrorMessage.textContent = "Username can only contain letters and numbers";
    } else {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "Username can only contain letters and numbers";
      errorMessage.style.color = "red";
      registrationForm.appendChild(errorMessage);
    }
    return;
  }

  fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      if (data.message === "User registered successfully") {
        window.location.href = "/?registrationSuccess=true";
      } else {
        const errorInput = document.getElementById("username");
        errorInput.style.borderColor = "red";

        const existingErrorMessage = registrationForm.querySelector("p");
        if (existingErrorMessage) {
          existingErrorMessage.textContent = data.error;
        } else {
          const errorMessage = document.createElement("p");
          errorMessage.textContent = data.error;
          errorMessage.style.color = "red";
          registrationForm.appendChild(errorMessage);
        }
      }
    })
    .catch((error) => {
      console.error("Error registering user:", error);
    });
});