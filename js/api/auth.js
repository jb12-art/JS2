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
  throw new Error("Could not register the account");
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
// Attach Auth event listener
export function setAuthListener() {
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = event.target.name.value;
      const email = event.target.email.value;
      const password = event.target.password.value;

      await register(name, email, password);
      await login(email, password);
      alert("Registration successful");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = event.target.email.value;
      const password = event.target.password.value;

      await login(email, password);
      alert("Login successful");
    });
  }
}
