// =============================
// API features
// =============================

"use-strict"; // Strict mode ON in local browser.

import { API_BASE, API_KEY } from "./config.js";
import { load } from "./storage.js";

// GET all posts
export async function getPosts() {
  const response = await fetch(`${API_BASE}/social/posts?_author=true`, {
    headers: {
      Authorization: `Bearer ${load("token")}`,
      "X-Noroff-API-Key": API_KEY,
    },
  });
  return await response.json();
}

// Get a single post by ID
export async function getPost(id) {
  const response = await fetch(`${API_BASE}/social/posts/${id}?_author=true`, {
    headers: {
      Authorization: `Bearer ${load("token")}`,
      "X-Noroff-API-Key": API_KEY,
    },
  });

  const data = await response.json();
  console.log("Fetch single post:", data); // see in console
  return data;
}

// Get all posts from one user
export async function getUserPosts(username) {
  const response = await fetch(
    `${API_BASE}/social/profiles/${username}/posts?_author=true`,
    {
      headers: {
        Authorization: `Bearer ${load("token")}`,
        "X-Noroff-API-Key": API_KEY,
      },
    }
  );

  const data = await response.json();
  console.log(`Posts of user ${username}:`, data);
  return data;
}

// Create a post
export async function createPost(title, body, imageUrl) {
  const postData = {
    title,
    body,
  };

  // Only include media if user added an image URL
  if (imageUrl && imageUrl.trim() !== "") {
    postData.media = { url: imageUrl, alt: title };
  }

  const response = await fetch(`${API_BASE}/social/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${load("token")}`,
      "X-Noroff-API-Key": API_KEY,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to create post:", data);
    throw new Error(data.errors?.[0]?.message || "Post creation failed");
  }

  console.log("Created post:", data);
  return data;
}

// Update an existing post by ID. (supports image)
export async function updatePost(id, title, body, imageUrl) {
  const postData = {
    title,
    body,
  };

  // Only include media if user added an image URL
  if (imageUrl && imageUrl.trim() !== "") {
    postData.media = { url: imageUrl, alt: title };
  }

  console.log("Updating post:", postData);

  const response = await fetch(`${API_BASE}/social/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${load("token")}`,
      "X-Noroff-API-Key": API_KEY,
    },
    body: JSON.stringify(postData),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to update post:", data);
    throw new Error(data.errors?.[0]?.message || "Post update failed");
  }

  console.log("Updated post:", data);
  return data;
}

// Delete a post by ID.
export async function deletePost(id) {
  const response = await fetch(`${API_BASE}/social/posts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${load("token")}`,
      "X-Noroff-API-Key": API_KEY,
    },
  });

  if (response.ok) {
    console.log(`Post ${id} deleted successfully`);
  } else {
    console.error("Failed to delete post:", await response.json());
  }
}
