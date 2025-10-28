// All API and localStorage functions
// =============================
// API details
// =============================
export const API_KEY = "23b0a87d-57db-46c3-9d24-ad236eb84ac5";
export const API_BASE = "https://v2.api.noroff.dev";
export const API_AUTH = "/auth";
export const API_REGISTER = "/register";
export const API_LOGIN = "/login";
export const API_KEY_URL = "/create-api-key";

// =============================
// Local storage functions
// =============================
export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
export function load(key) {
  return JSON.parse(localStorage.getItem(key));
}

// =============================
// API calls
// =============================

// GET post function
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

  // Find out what this do and where I can see it in console.
  console.log("Sending post:", postData);

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

// =============================
// Auth functions
// =============================

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
