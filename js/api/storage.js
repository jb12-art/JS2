// =============================
// Local storage functions
// =============================
"use-strict"; // Strict mode ON in local browser.

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
export function load(key) {
  return JSON.parse(localStorage.getItem(key));
}
