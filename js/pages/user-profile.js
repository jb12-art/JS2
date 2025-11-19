// User’s own profile page

"use-strict"; // Strict mode ON in local browser.

import { load } from "../api/storage.js";
import { getUserPosts } from "../api/posts.js";
import { getProfile } from "../api/profiles.js";

async function displayUserProfile() {
  const container = document.querySelector(".media-box");
  if (!container) return;

  const currentUser = load("profile");
  if (!currentUser) {
    container.innerHTML = `<p>Login to view your profile.</p>`;
    return;
  }

  const username = currentUser.name;
  document.title = `${username}'s Profile`;

  // Fetch profile info
  const profileData = await getProfile(username);
  const profile = profileData.data;

  // Basic profile info
  container.innerHTML = `
  <div class="js-profile-info">
  <p><strong>Name:</strong> ${profile.name}</p>
  <p><strong>Email:</strong> ${profile.email}</p>
  <p><strong>Followers:</strong> ${profile._count.followers}</p>
  <p><strong>Following:</strong> ${profile._count.following}</p>
  <p><strong>Posts:</strong> ${profile._count.posts}</p>
  <hr>
  <h3>Your Posts</h3>
  </div>
  <div class="user-posts"></div>;
  `;

  // Fetch user's own posts
  const postsData = await getUserPosts(username);
  const posts = postsData.data;

  const postsContainer = container.querySelector(".user-posts");

  if (!posts || posts.length === 0) {
    postsContainer.innerHTML = "<p>You haven't made any posts yet.</p>";
    return;
  }

  // Display posts
  posts.forEach((post) => {
    const div = document.createElement("div");
    div.classList.add("js-post-card");
    div.innerHTML = `
    <h4>${post.title}</h4>
    <p>${post.body || "No content"}</p>
    ${
      post.media?.url
        ? `<img src="${post.media.url}" alt="${
            post.media.alt || "Post image"
          }" width="200" />`
        : ""
    }
    <p><small>Created: ${new Date(
      post.created
    ).toLocaleDateString()}</small></p>
      <button data-id="${post.id}" class="view-post-btn">View</button>
    `;
    postsContainer.appendChild(div);
  });

  // View individual post in new tab
  postsContainer.querySelectorAll(".view-post-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      window.open(`post.html?id=${id}`, "_blank");
    });
  });
}

// Run setup
displayUserProfile();
