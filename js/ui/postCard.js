// postCard.js
// Shared with index.js, user-posts.js, user-profile.js

import { load } from '../api/storage.js';

export function createPostCard(post, options = {}) {
  const div = document.createElement('div');

  const currentUser = load('profile');
  const isMyPost = currentUser && post.author?.name === currentUser.name;

  div.dataset.id = post.id;
  div.className = `js-post-card m-5 border border-black bg-orange-100 p-4 rounded space-y-2 cursor-pointer`;

  div.innerHTML = `
  <h3 class="font-semibold text-lg">${post.title}</h3>
  <p>${post.body || 'No content'}</p>

  ${
    post.media?.url
      ? `<img src="${post.media.url}" alt="${
          post.media.alt || 'Post image'
        }" class="w-100 h-48 object-cover" />`
      : ''
  }

  <p class="text-sm text-gray-600">
  By: ${post.author?.name || 'Unknown'}
  ${new Date(post.created).toLocaleDateString()}
  </p>

${
  options.showViewUser !== false
    ? `
    <div class="flex gap-2 mt-2">
      <button 
        class="view-user-btn text-sm px-2 py-1 border rounded bg-indigo-200 hover:bg-indigo-300"
        data-username="${post.author?.name}">
        View all ${post.author.name}'s Posts
      </button>
    </div>
    `
    : ''
}
`;

  // Open single post, but not when clicking view all
  div.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') return;
    window.location.href = `post.html?id=${post.id}`;
  });

  return div;
}
