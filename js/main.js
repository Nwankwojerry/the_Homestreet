document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-nav");
  const toggleBtn = document.querySelector(".site-header__toggle");

  if (!nav || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("site-nav--open");
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".sitee-nav__button").forEach((button => {
    button.addEventListener("click", () => {
      const submenu = button.nextElementSibling;
      if (!submenu) return;

      const isOpen = submenu.classList.toggle("site-nav__submenu--open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });
});

const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

document.querySelectorAll(".social-link").forEach(link => {
  link.addEventListener("click", (e) => {
      console.log(`User clicked social link: ${e.target.innerText}`);
  });
});
})();
