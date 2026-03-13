const menuBtn = document.querySelector(".menu-btn");
const sidebar = document.querySelector("sidebar-nav");
const overlay = document.querySelector(".overlay");

if (menuBtn && sidebar && overlay) {
  menuBtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    overlay.classList.toggle("active", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen);
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open)) {
      sidebar.classList.remove("open");
      overlay.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });

} else {
  console.warn("Menu button, sidebar, or overlay not found. Check class names.");
}
