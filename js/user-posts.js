// All posts from one user
import { getUserPosts } from "./api.js";

async function displayUserPosts() {
  const container = document.querySelector(".media-box");

  // Get username from URL (e.g. user-posts.html?name=john)
  const params = new URLSearchParams(window.location.search);
  const username = params.get("name");

  if (!username) {
    container.innerHTML = "<p>No username specified.</p>";
    return;
  }

  const postData = await getUserPosts(username);
  const posts = postData.data;

  container.innerHTML = `<h2>Posts by ${username}</h2>`;

  if (!posts || posts.length === 0) {
    container.innerHTML += "<p>No posts found,</p>";
    return;
  }

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
    `;
    container.appendChild(div);
  });
}

displayUserPosts();
