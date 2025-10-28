// index.js

/**
 * Create a new post.
 * @param {string} title - The title of the post.
 * @param {string} body - The body text of the post.
 * @param {string} imageUrl - (optional) A public image URL.
 * @returns {promise<object>} The created post.
 * @example
 * createPost("My Post", "This is my first post", "http://picsum.photos/300");
 */

import {
  getPosts,
  createPost,
  deletePost,
  updatePost,
  load,
  setAuthListener,
} from "./api.js";

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
    div.dataset.id = post.id;

    //  Compare logged-in user name to post author name
    const isMyPost =
      currentUser && post.author && post.author?.name === currentUser.name;

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
    <p><small>By: ${post.author.name}</small></p>
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
    `;

    container.appendChild(div);

    // view single post
    // Make post clickable
    div.addEventListener("click", (event) => {
      // Avoid triggering if user clicks Edit/Delete
      if (event.target.tagName === "BUTTON") return;

      // Go to the individual post page
      window.location.href = `post.html?id=${post.id}`;
    });
  });

  // Delete button
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation();
      const id = event.target.dataset.id;
      await deletePost(id);
      displayPosts(); // refresh the list
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
    const title = postForm.querySelector("#postTitle").value;
    const body = postForm.querySelector("#postBody").value;
    const imageUrl = postForm.querySelector("#postImage").value;

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
