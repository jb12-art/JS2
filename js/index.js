// API details
export const API_KEY = "23b0a87d-57db-46c3-9d24-ad236eb84ac5";
export const API_BASE = "https://v2.api.noroff.dev";
export const API_AUTH = "/auth";
export const API_REGISTER = "/register";
export const API_LOGIN = "/login";
export const API_KEY_URL = "/create-api-key";

// Local storage functions
export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
export function load(key) {
  return JSON.parse(localStorage.getItem(key));
}

// GET post function / API calls
export async function getPosts() {
  const response = await fetch(API_BASE + "/social/posts", {
    headers: {
      Authorization: `Bearer ${load("token")}`,
      "X-Noroff-API-Key": API_KEY,
    },
  });
  return await response.json();
}

/**
 * Create a new post.
 * @param {string} title - The title of the post.
 * @param {string} body - The body text of the post.
 * @param {string} imageUrl - (optional) A public image URL.
 * @returns {promise<object>} The created post.
 * @example
 * createPost("My Post", "This is my first post", "http://picsum.photos/300");
 */
export async function createPost(title, body, imageUrl) {
  const postData = {
    title,
    body,
  };

  // Only include media if user added an image URL
  if (imageUrl && imageUrl.trim() !== "") {
    postData.media = { url: imageUrl, alt: title };
  }

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

/**
 * Update an existing post by ID.
 */
export async function updatePost(id, title, body) {
  const response = await fetch(`${API_BASE}/social/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${load("token")}`,
      "X-Noroff-API-Key": API_KEY,
    },
    body: JSON.stringify({ title, body }),
  });

  const data = await response.json();
  console.log("Updated post:", data);
  return data;
}

/**
 * Delete a post by ID.
 */
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

// GET API Key
export async function getAPIKey() {
  const response = await fetch(API_BASE + API_AUTH + API_KEY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${load("token")}`,
    },
    body: JSON.stringify({
      name: "My API key",
    }),
  });

  if (response.ok) {
    return await response.json();
  }

  console.error(await response.json());
  throw new Error("Could not register for an API key");
}

// Register user / function / API calls
export async function register(name, email, password) {
  const response = await fetch(API_BASE + API_AUTH + API_REGISTER, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  if (response.ok) {
    return await response.json();
  }

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

// Display posts in the 'media-box'
async function displayPosts() {
  const container = document.querySelector(".media-box");
  if (!container) return;

  const postsData = await getPosts();
  const posts = postsData.data; // The actual array of posts

  container.innerHTML = ""; // Clear old posts

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.classList.add("js-post-card");

    div.innerHTML = `
    <h3>${post.title}</h3>
    <p>${post.body || "No content"}</p>
    ${
      post.media?.url
        ? `<img src="${post.media.url}" alt="${
            post.media.alt || "Post image"
          }" width="200"/>`
        : ""
    }
    <p><small>Created: ${new Date(
      post.created
    ).toLocaleDateString()}</small></p>
    <button class="delete-btn" data-id="${post.id}">Delete</button>
    `;

    container.appendChild(div);
  });

  // Add delete event listeners
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const id = event.target.dataset.id;
      await deletePost(id);
      displayPosts(); // refresh the list
    });
  });
}

// Handle create post form
const postForm = document.getElementById("createPostForm");
if (postForm) {
  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = document.getElementById("postTitle").value;
    const body = document.getElementById("postBody").value;
    const imageUrl = document.getElementById("postImage").value;

    await createPost(title, body, imageUrl);
    postForm.reset();
    displayPosts();
  });
}

// Run setup
// Run displayPosts after login
displayPosts();
setAuthListener();
