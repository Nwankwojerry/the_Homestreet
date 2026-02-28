// js/main.js
console.log("JavaScript is successfully linked!");

// Basic test function
function testConnection() {
    alert("JS Link Verified");
}

// Initialize
window.onload = function() {
    console.log("Page fully loaded");
};

document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("menu-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.querySelector(".overlay");

  if (!menuBtn || !sidebar) {
    console.log("Menu button or sidebar not found");
    return;
  }

  // Open menu
  menuBtn.addEventListener("click", function () {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  // Close when overlay is clicked
  if (overlay) {
    overlay.addEventListener("click", function () {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

  console.log("Menu system loaded");
});
