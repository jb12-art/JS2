// post.js
// View Single Post
"use-strict"; // Strict mode ON in local browser.

import { getPost, load, updatePost, deletePost } from "./api.js";

async function displaySinglePost() {
  const container = document.querySelector(".single-post");

  // Get the post ID from the URL
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  if (!postId) {
    container.innerHTML = "<p>No post ID found.</p>";
    return;
  }

  // Fetch single post data
  const postData = await getPost(postId);
  const post = postData.data;

  // Create post card
  const postCard = document.createElement("div");
  postCard.classList.add("js-post-card");

  // Check if it's the user's own post
  const currentUser = load("profile");
  const isMyPost =
    currentUser && post.author && post.author.name === currentUser.name;

  // Fill the postCard with post content
  postCard.innerHTML = `
    <h3>${post.title}</h3>
  <p>${post.body || "No content"}</p>
  ${
    post.media?.url
      ? `<img src="${post.media.url}" alt="${
          post.media.alt || "Post image"
        }" width="300" />`
      : ""
  }
  <p><small>By: ${post.author.name || "Unknown"}</small></p>
  <p><small>Created: ${new Date(post.created).toLocaleDateString()}</small></p>
  
  ${
    isMyPost
      ? `
    <div class="single-post-actions">
    <button class="edit-btn" data-id="${post.id}">Edit</button>
    <button class="delete-btn" data-id="${post.id}">Delete</button>
    </div>
    `
      : ""
  }
  `;

  // Add shared postCard design to container
  container.innerHTML = "";
  container.appendChild(postCard);

  // Edit post
  const editBtn = postCard.querySelector(".edit-btn");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      postCard.innerHTML = `
    <h2 class="edit-title">Edit Post</h2>
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

      // Save updated post
      postCard
        .querySelector(".edit-form")
        .addEventListener("submit", async (e) => {
          e.preventDefault();
          const newTitle = e.target.querySelector("#editTitle").value;
          const newBody = e.target.querySelector("#editBody").value;
          const newImage = e.target.querySelector("#editImage").value;

          await updatePost(postId, newTitle, newBody, newImage);
          displaySinglePost(); // Refresh
        });

      // Cancel edit
      postCard.querySelector(".cancel-btn").addEventListener("click", () => {
        displaySinglePost();
      });
    });
  }

  // Delete post function
  const deleteBtn = postCard.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Delete this post?")) {
        await deletePost(postId);
        window.location.href = "index.html"; // back to feed after delete
      }
    });
  }
}

displaySinglePost();
