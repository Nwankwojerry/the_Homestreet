// Get DOM elements
const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.querySelector(".sidebar-nav");
const overlay = document.querySelector(".overlay");

if (menuBtn && sidebar && overlay) {
  // Toggle sidebar when menu button is clicked
  menuBtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    overlay.classList.toggle("active", isOpen); // Show/hide overlay
    menuBtn.setAttribute("aria-expanded", isOpen);
  });
  // Close sidebar when overlay is clicked
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
  });

  // Close sidebar with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

} else {
  console.warn("Menu button, sidebar, or overlay not found. Check class names.");
}
