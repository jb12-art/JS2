// index.js

import { getPost } from "./api.js"; // To get edit content to show in edit

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

    <button class="view-user-btn" data-username="${post.author.name}">
      View all ${post.author.name}'s Posts
    </button>

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

      // Go to the individual post page in new tab
      window.open(`post.html?id=${post.id}`, "_blank");
    });
  });

  // View all user's posts button
  document.querySelectorAll(".view-user-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      const username = event.target.dataset.username;

      // Open new browser window tab
      window.open(`user-posts.html?name=${username}`, "_blank");
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

  // Edit button
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation(); // Prevent navigation to post page
      const id = event.target.dataset.id;

      // Fetch single post for edit
      const { data: post } = await getPost(id);
      const postCard = event.target.closest(".js-post-card");

      // Replace content with edit form
      postCard.innerHTML = `
      <h2>Edit Post</h2>
      <form class="edit-form">
      <label>Title:</label>
      <input type="text" id="editTitle" value="${post.title}" />
      <label>Body:</label>
      <textarea id="editBody">${post.body || ""}</textarea>
      <label>Image URL:</label>
      <input type="url" id="editImage" value="${post.media?.url || ""}" />
      <button type="submit">Save</button>
      <button type="button" class="cancel-btn">Cancel</button>
      </form>
      `;

      // Prevent feed post edit to navigation to single post edit
      postCard.querySelector(".edit-form").addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Save button
      postCard
        .querySelector(".edit-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const newTitle = e.target.querySelector("#editTitle").value;
          const newBody = e.target.querySelector("#editBody").value;
          const newImage = e.target.querySelector("#editImage").value;
          await updatePost(id, newTitle, newBody, newImage);
          displayPosts(); // reload posts
        });

      // Cancel edit button
      postCard
        .querySelector(".cancel-btn")
        .addEventListener("click", displayPosts);
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
