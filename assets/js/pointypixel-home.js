(() => {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const typedElement = document.querySelector(".typed[data-typed-items]");
  const menuLabel = menuToggle?.querySelector("span");

  const syncHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  const setMenu = (open) => {
    menuToggle?.setAttribute("aria-expanded", String(open));
    menuToggle?.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
    nav?.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };

  const closeMenu = () => setMenu(false);

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("menu-open")) return;
    if (nav?.contains(event.target) || menuToggle?.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !document.body.classList.contains("menu-open")) return;
    closeMenu();
    menuToggle?.focus();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  }, { passive: true });

  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  if (typedElement) {
    const items = typedElement.dataset.typedItems.split(",").map((item) => item.trim());

    if (typeof window.Typed !== "function") {
      typedElement.dataset.typedMode = "library-unavailable";
      typedElement.textContent = items[0];
    } else {
      typedElement.dataset.typedMode = "animated";
      new window.Typed(typedElement, {
        strings: items,
        typeSpeed: 55,
        backSpeed: 28,
        backDelay: 1800,
        startDelay: 850,
        loop: true,
        smartBackspace: true
      });
    }
  }

  const reveals = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -5%" });

  reveals.forEach((element, index) => {
    if (element.closest(".hero")) {
      element.style.transitionDelay = `${Math.min(index * 110, 440)}ms`;
    }
    observer.observe(element);
  });
})();
