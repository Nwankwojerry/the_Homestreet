document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.querySelector(".menu-btn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.querySelector(".overlay");

  if (!menuBtn || !sidebar || !overlay) {
    console.log("Menu button, sidebar, or overlay not found");
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
