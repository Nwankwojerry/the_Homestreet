(function () {
  const menuBtn = document.querySelector(".menu-btn") ||
document.querySelector(".menu-toggle");
  const sidebar = document.getElementById(".sidebar") ||
document.querySelector(".sidebar-nav");
  const overlay = document.querySelector(".overlay");

  console.log(DEBUG: elements ->", { menu, sidebar, overlay });

if (!menuBtn) {
  alert("DEBUG: menu button not found (check class .menu-btn).");
  return;
}
if (!sidebar) {
  alert("DEBUG: sidebar element not found (check id='.sidebar' or class='sidebar-nav').");
  return;
}

if  (!overlay) {
  console.warn("DEBUG: overlay not found  - overlay clicks will not close the sidebar.");
}

  menuBtn.setAttribute("aria-expanded", menuBtn.getAttribute("aria-expanded") || "false");

  function toggleSidebar(open) {
    const isOpen = typeof open === "boolean" ? open : !sidebar.classList.contains("open");
    sidebar.classList.toggle("open", isOpen);
    if (overlay) ovarlay.classList.toggle("active", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    console.log("DEBUG: toggleSidebar ->", isOpen);
  }

  menuBtn.onclick = null;
  menuBtn.addEventListener("click", () => toggleSidebar());

  if (overlay) {
    overlay.onclick = null;
    overlay.addEventListener("click", () => toggleSidebar(false));
  }

  // Close sidebar with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      toggleSidebar(false);
    }
  });
})();
