document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".site-nav");
  const toggleBtn = document.querySelector(".site-header__toggle");

  if (!nav || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("site-nav--open");
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".site-nav__button").forEach((button) => {
    button.addEventListener("click", () => {
      const submenu = button.nextElementSibling;
      if (!submenu) return;

      const isOpen = submenu.classList.toggle("site-nav__submenu--open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  });

document.querySelectorAll(".site-nav__link, .site-nav__sublink, .site-nav__footer-link, .site-footer__link").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("site-nav--open");
    toggleBtn.setAttribute("aria-expanded", "false");
  });
});

  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  document.querySelectorAll(".site-footer__social-link").forEach(link) => {
    link.addEventListener("click", (e) => {
      console.log(`User clicked social link: ${e.target.innerText}`);
    });
  });

  console.log("JS is working");
});
