// =============================
// Follow / Unfollow a user
// =============================

"use-strict"; // Strict mode ON in local browser.

import { API_BASE, API_KEY } from "./config.js";
import { load } from "./storage.js";

// Follow a user
export async function followUser(username) {
  const response = await fetch(
    `${API_BASE}/social/profiles/${username}/follow`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${load("token")}`,
        "X-noroff-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();
  console.log(`Followed ${username}:`, data);
  return data;
}

// Unfollow a user
export async function unfollowUser(username) {
  const response = await fetch(
    `${API_BASE}/social/profiles/${username}/unfollow`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${load("token")}`,
        "X-Noroff-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  const data = await response.json();
  console.log(`Unfollowed ${username}:`, data);
  return data;
}

// Check if you are already following a user
export async function getProfile(username) {
  const response = await fetch(
    `${API_BASE}/social/profiles/${username}?_followers=true`,
    {
      headers: {
        Authorization: `Bearer ${load("token")}`,
        "X-Noroff-API-Key": API_KEY,
      },
    }
  );
  const data = await response.json();
  return data;
}
