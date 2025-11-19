// user-posts.js
"use-strict"; // Strict mode ON in local browser.

// All posts from one user
import { getUserPosts } from "../api/posts.js";
import { followUser, unfollowUser, getProfile } from "../api/profiles.js";
import { load } from "../api/storage.js";

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

  // Load current logged-in user to mark owned posts
  const currentUser = load("profile");

  // Fetch User's posts
  const postsData = await getUserPosts(username);
  const userPosts = postsData.data;

  // --- header + follow button area ---
  container.innerHTML = `<h2>${username}'s Posts</h2>`;

  // 'Follow' button under the title
  const headerFollowWrapper = document.createElement("div");
  headerFollowWrapper.classList.add("user-header-actions");

  const followBtn = document.createElement("button");
  followBtn.id = "followBtn";
  followBtn.style.margin = "8px 0";
  headerFollowWrapper.appendChild(followBtn);
  container.appendChild(headerFollowWrapper);
  // --- end header + follow button area ---

  // isFollowing
  let isFollowing = false;

  // Hide follow button if viewing your own profile
  if (currentUser?.name === username) {
    followBtn.style.display = "none";
  } else {
    // check if you are 'following' this user
    const profileData = await getProfile(username);
    const followers = profileData.data.followers || [];
    isFollowing = followers.some((f) => f.name === currentUser?.name);

    // Set button label based on status
    followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
  }

  // Click handler toggles follow / unfollow
  followBtn.addEventListener("click", async () => {
    try {
      followBtn.disabled = true;
      followBtn.textContent = "Please wait...";

      if (isFollowing) {
        // unfollow
        await unfollowUser(username);
        isFollowing = false;
        followBtn.textContent = "Follow";
      } else {
        // Follow
        await followUser(username);
        isFollowing = true;
        followBtn.textContent = "Unfollow";
      }
    } catch (err) {
      console.error("Follow/Unfollow failed:", err);
      alert("An error occurred. Check console.");
      // reset label based on current state
      followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
    } finally {
      followBtn.disabled = false;
    }
  });

  // If there are no posts
  if (!userPosts || userPosts.length === 0) {
    container.innerHTML += `<p>No posts found for ${username}.</p>`;
    return;
  }

  // Render posts
  userPosts.forEach((post) => {
    const div = document.createElement("div");
    div.classList.add("js-post-card");
    div.dataset.id = post.id;

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

  // Open single post in new tab
  document.querySelectorAll(".view-post-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const id = event.target.dataset.id;
      window.open(`post.html?id=${id}`, "_blank");
    });
  });
}

// Run the setup
displayUserPosts();
