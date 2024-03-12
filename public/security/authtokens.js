import { setUsername } from "../user-data.js";

export function getToken() {
  return localStorage.getItem("authToken");
}

export async function deleteToken() {
    try {
        const response = await fetch("/secure/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (!response.ok) {
            console.error("Server response was not ok");
        }
        return true;
    } catch (error) {
        console.error("Error logging out:", error);
        return false;
    }
}

// Logic to check if the token is valid using fetch to your backend
export async function isTokenValid() {
  try {
    const response = await fetch("/secure/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    
    if (!response.ok) {
      console.error("Server response was not ok");
      return false;
    }
    const tokenData = await response.json();
    setUsername(tokenData.user.username);
    return true;
  } catch (error) {
    console.error("Error verifying token:", error);
    return false;
  }
}