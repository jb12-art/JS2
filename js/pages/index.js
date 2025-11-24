// index.js
"use-strict"; // Strict mode ON in local browser.

import {
  getPost,
  getPosts,
  createPost,
  deletePost,
  updatePost,
} from "../api/posts.js";
import { load } from "../api/storage.js";
import { setAuthListener } from "../api/auth.js";

let allPosts = []; // store posts globally

// =============================
// Display posts in the 'media-box'
// =============================
/**
 * Display all posts in the feed with search filtering.
 * @param {string} [searchTerm=""] - Text used to filter posts by title or body.
 * @returns {Promise<void>}
 * @example
 * Write some words in the searchbar and see what show up.
 */
async function displayPosts(searchTerm = "") {
  const container = document.querySelector(".media-box");
  if (!container) return;

  // Fetch posts only if you have not
  if (allPosts.length === 0) {
    const postsData = await getPosts();
    allPosts = postsData.data;
  }

  const currentUser = load("profile"); // logged-in user
  container.innerHTML = ""; // Clear old posts

  // Filter posts by search term (case-insensitive)
  const filteredPosts = allPosts.filter((post) => {
    const title = post.title?.toLowerCase() || "";
    const body = post.body?.toLowerCase() || "";
    return (
      title.includes(searchTerm.toLowerCase()) ||
      body.includes(searchTerm.toLowerCase())
    );
  });

  // Show message if no search is found
  if (filteredPosts.length === 0) {
    container.innerHTML = `<p>No posts found.</p>`;
    return;
  }

  // Render posts
  filteredPosts.forEach((post) => {
    const div = document.createElement("div");
    div.classList.add("js-post-card");
    div.dataset.id = post.id;

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
      allPosts = []; // refresh data
      displayPosts(searchInput.value);
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
          allPosts = [];
          displayPosts(searchInput.value); // reload posts
        });

      // Cancel edit button
      postCard
        .querySelector(".cancel-btn")
        .addEventListener("click", () => displayPosts(searchInput.value));
    });
  });
}

// =============================
// Search input event listener
// =============================
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    displayPosts(searchInput.value);
  });
}

// =============================
// Create post form handle
// =============================
/**
 * Handles the form submission to create a new post.
 * @param {SubmitEvent} event - The form submit event.
 * @returns {Promise<void>}
 */
const postForm = document.getElementById("createPostForm");
if (postForm) {
  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = postForm.querySelector("#postTitle").value;
    const body = postForm.querySelector("#postBody").value;
    const imageUrl = postForm.querySelector("#postImage").value;

    await createPost(title, body, imageUrl);
    allPosts = [];
    postForm.reset();
    displayPosts(searchInput.value);
  });
}

// =============================
// View profile button
// =============================
/**
 * Navigates the logged-in user to their profile page.
 * Alerts user if no profile exists or not logged in.
 */
const viewProfileBtn = document.getElementById("viewProfileBtn");
if (viewProfileBtn) {
  viewProfileBtn.addEventListener("click", () => {
    const currentUser = load("profile");
    if (!currentUser) {
      // container.innerHTML = `<p>Please login or register first.</p>`;
      alert("Please login first.");
      return;
    }
    window.location.href = "user-profile.html";
  });
}

// =============================
// Run setup
// =============================
// Run displayPosts after login
displayPosts();
setAuthListener();
