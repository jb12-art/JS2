// =============================
// Auth functions
// =============================

"use-strict"; // Strict mode ON in local browser.

import { API_BASE, API_AUTH, API_REGISTER, API_LOGIN } from "./config.js";
import { save } from "./storage.js";

// Register user / function / API calls
export async function register(name, email, password) {
  const response = await fetch(API_BASE + API_AUTH + API_REGISTER, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  if (response.ok) return await response.json();
  throw new Error(
    "Account is already registered, choose another name and email."
  );
}

// Login user / function / API calls
export async function login(email, password) {
  const response = await fetch(API_BASE + API_AUTH + API_LOGIN, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.ok) {
    const { accessToken, ...profile } = (await response.json()).data;
    save("token", accessToken);
    save("profile", profile);
    return profile;
  }

  throw new Error("Could not login the account");
}

// Handle register/login
export function setAuthListener() {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  // Register
  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const messageBox = document.getElementById("registerMessage");

      const name = event.target.name.value;
      const email = event.target.email.value;
      const password = event.target.password.value;

      try {
        await register(name, email, password);
        await login(email, password);

        messageBox.textContent =
          "Registration successful! Redirecting to Home page...";
        messageBox.style.color = "green";

        event.target.reset();

        setTimeout(() => {
          window.location.href = "../index.html";
        }, 2000); // 2 seconds wait.
      } catch (error) {
        messageBox.textContent = error.message;
        messageBox.style.color = "red";
        messageBox.style.textAlign = "center";
        messageBox.style.marginBottom = "10px";
        messageBox.style.textDecoration = "underline 1px black";
      }
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const messageBox = document.getElementById("loginMessage");

      const email = event.target.email.value;
      const password = event.target.password.value;

      try {
        await login(email, password);

        event.target.reset();

        setTimeout(() => {
          window.location.href = "../index.html";
        });
      } catch (error) {
        messageBox.textContent = error.message;
        messageBox.style.color = "red";
        messageBox.style.textAlign = "center";
        messageBox.style.marginBottom = "10px";
        messageBox.style.textDecoration = "underline 1px black";
      }
    });
  }
}
