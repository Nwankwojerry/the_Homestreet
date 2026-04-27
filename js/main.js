const nav = document.querySelector(".site-nav");
const toggleBtn = document.querySelector(".site-header__toggle");
const submenuButtons = document.querySelectorAll(".site-nav__button");


toggleBtn.addEventListener("click", () => {
  nav.classList.toggle("site-nav--open");

  const isOpen = nav.classList.contains("site-nav--open");
  toggleBtn.setAttribute("aria-expanded", isOpen);
});


submenuButtons.forEach(button => {
  button.addEventListener("click", () => {
    const submenu = button.nextElementSibling;

    document.querySelectorAll(".site-nav__submenu").forEach(menu => {
      if (menu !== submenu) {
        menu.classList.remove("site-nav__submenu--open");
      }
    });

    submenu.classList.toggle("site-nav__submenu--open");
  });
});

document.addEventListener("click", (e) => {
  if (!nav.contains(e.target) && !toggleBtn.contains(e.target)) {
    nav.classList.remove("site-nav--open");
    toggleBtn.setAttribute("aria-expanded", false);
  }
});

document.querySelectorAll(".site-nav__link, .site-nav__sublink").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("site-nav--open");
    toggleBtn.setAttribute("aria-aria-expanded", false);
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
