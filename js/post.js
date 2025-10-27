// View Single Post
import { getPost, load } from "./index.js";

async function displaySinglePost() {
  const container = document.querySelector(".single-post");

  // Get the post ID from the URL
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  if (!postId) {
    container.innerHTML = "<p>No post ID found.</p>";
    return;
  }

  // Fetch the post data
  const postData = await getPost(postId);
  const post = postData.data;

  // Same post-card design style with the same class as your feed posts
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
        }" width="300 />`
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
}

displaySinglePost();
