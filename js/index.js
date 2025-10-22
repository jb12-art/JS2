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

/**
 * Create a new post.
 * @param {string} title - The title of the post.
 * @param {string} body - The body text of the post.
 * @param {string} imageUrl - (optional) A public image URL.
 * @returns {promise<object>} The created post.
 * @example
 * createPost("My Post", "This is my first post", "http://picsum.photos/300");
 */

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

// Update an existing post by ID.
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

// =============================
// Display posts in the 'media-box'
// =============================
async function displayPosts() {
  const container = document.querySelector(".media-box");
  if (!container) return;

  const postsData = await getPosts();
  const posts = postsData.data; // The actual array of posts
  const currentUser = load("profile"); // logged-in user

  container.innerHTML = ""; // Clear old posts

  posts.forEach((post) => {
    const div = document.createElement("div");
    div.classList.add("js-post-card");

    //  Compare logged-in user name to post author name
    const isMyPost =
      currentUser && post.author && post.author.name === currentUser.name;

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
    <p><small>By: ${post.author.name || "Unknown"}</small></p>
    <p><small>Created: ${new Date(
      post.created
    ).toLocaleDateString()}</small></p>
    ${
      isMyPost
        ? `
      <button class="edit-btn" data-id="${post.id}">Edit</button>
      <button class="delete-btn" data-id="${post.id}">Delete</button>
      `
        : ""
    }
    <h2 class="edit-title" style="display:none;">Edit Post</h2>
    `;

    container.appendChild(div);
  });

  // Delete event listeners
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      const id = event.target.dataset.id;
      await deletePost(id);
      displayPosts(); // refresh the list
    });
  });

  // Edit buttons event
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      const postCard = event.target.closest(".js-post-card");

      // Show "Edit Post" title
      const editTitle = postCard.querySelector(".edit-title");
      if (editTitle) editTitle.style.display = "block";

      // Get current values
      const currentTitle = postCard.querySelector("h3").innerText;
      const currentBody = postCard.querySelector("p").innerText;
      const currentImg = postCard.querySelector("img")?.src || "";

      // Replace content with an edit form
      postCard.innerHTML = `
      <h2 class="edit-title">Edit Post</h2>
      <form class="edit-form">
      <label>Title:</label>
      <input type="text" id="editTitle" value="${currentTitle}" />

      <label>Content:</label>
      <textarea id="editBody">${currentBody}</textarea>

      <label>Image/ image url:</label>
      <input type="url" id="editImage" value="${currentImg}" placeholder"Paste image/ image url" />

      <button type="submit">Save</button>
      <button type="button" class="cancel-btn">Cancel</button>
      </form>
      `;

      // SAVE button inside the form
      postCard
        .querySelector(".edit-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const newTitle = e.target.querySelector("#editTitle").value;
          const newBody = e.target.querySelector("#editBody").value;
          const newImage = e.target.querySelector("#editImage").value;

          await updatePost(id, newTitle, newBody, newImage);
          await displayPosts();
        });

      // CANCEL
      postCard.querySelector(".cancel-btn").addEventListener("click", () => {
        displayPosts();
      });
    });
  });
}

// =============================
// Create post form handle
// =============================
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

// =============================
// Run setup
// =============================
// Run displayPosts after login
displayPosts();
setAuthListener();
