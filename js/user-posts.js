// user-posts.js

// All posts from one user
import { getPosts, load } from "./api.js";

// Get query parameter from URL
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

async function displayUserPosts() {
  const container = document.querySelector(".media-box");
  if (!container) return;

  const username = getQueryParam("name");
  if (!username) {
    container.innerHTML = "<p>No user selected.</p>";
    return;
  }

  document.title = `${username}'s Posts`;

  const postsData = await getPosts();
  const posts = postsData.data;

  // Filter posts by author name
  const userPosts = posts.filter((post) => post.author?.name === username);

  container.innerHTML = `<h2>${username}'s Posts</h2>`;

  if (userPosts.length === 0) {
    container.innerHTML += "<p>No posts found for ${username}.</p>";
    return;
  }

  // Load current logged-in user to mark owned posts
  const currentUser = load("profile");

  userPosts.forEach((post) => {
    const div = document.createElement("div");
    div.classList.add("js-post-card");
    div.dataset.id = post.id;

    const isMyPost = currentUser && post.author?.name === currentUser.name;

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

    <button class="view-post-btn" data-id="${post.id}">View post</button>
    `;

    container.appendChild(div);
  });

  // View single post
  document.querySelectorAll(".view-post-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      window.open(`post.html?id=${id}`, "_blank");
    });
  });
}

// Run the setup
displayUserPosts();
