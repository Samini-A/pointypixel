(() => {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    setMenu(open);
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
    if (window.innerWidth > 920) closeMenu();
  }, { passive: true });
  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  const galleryItems = [...document.querySelectorAll("[data-gallery-item]")];
  const galleryFeature = document.querySelector("[data-gallery-feature]");
  const galleryFeatureImage = galleryFeature?.querySelector("[data-gallery-feature-image]");
  const galleryFeatureCount = galleryFeature?.querySelector("[data-gallery-feature-count]");
  const galleryDialog = document.querySelector("[data-gallery-dialog]");
  const galleryImage = galleryDialog?.querySelector("[data-gallery-image]");
  const galleryCount = galleryDialog?.querySelector("[data-gallery-count]");
  const galleryRail = document.querySelector("[data-gallery-rail]");
  const galleryDescriptions = [
    "A bright blue energy formation over a beach at night",
    "A chapter title standing on a moonlit shore",
    "Moonlight reflecting across the sea beside a beach fire",
    "A night-time rescue scene at the water's edge",
    "An overhead view of figures gathered around a beach fire",
    "A playable character arranging objects on the ground by flashlight",
    "A playable character examining a rock with a flashlight",
    "A playable character standing beside an open car at night",
    "Two characters inside a modern living room",
    "A playable character exploring a workshop",
    "Two characters facing each other beneath a night sky",
  ];
  let activeGalleryIndex = 0;
  let galleryTrigger = null;
  let galleryScrollTimer = null;
  let galleryProgrammaticScroll = false;

  const normalizeGalleryIndex = (index) => (
    galleryItems.length ? (index + galleryItems.length) % galleryItems.length : 0
  );

  const updateGalleryFeature = (index, { scrollThumbnail = false } = {}) => {
    if (!galleryFeatureImage || !galleryFeatureCount || galleryItems.length === 0) return;
    activeGalleryIndex = normalizeGalleryIndex(index);
    const activeItem = galleryItems[activeGalleryIndex];
    const sourceImage = activeItem.querySelector("img");
    if (!sourceImage) return;

    galleryFeatureImage.src = sourceImage.currentSrc || sourceImage.src;
    galleryFeatureImage.alt = galleryDescriptions[activeGalleryIndex] || "Dark Waves gameplay capture";
    galleryFeatureCount.textContent = `${String(activeGalleryIndex + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
    galleryFeature?.setAttribute("aria-label", `View gameplay capture ${activeGalleryIndex + 1} full frame`);

    galleryItems.forEach((item, itemIndex) => {
      const isActive = itemIndex === activeGalleryIndex;
      item.classList.toggle("is-active", isActive);
      if (isActive) item.setAttribute("aria-current", "true");
      else item.removeAttribute("aria-current");
    });

    if (scrollThumbnail && galleryRail) {
      galleryProgrammaticScroll = true;
      const railBounds = galleryRail.getBoundingClientRect();
      const itemBounds = activeItem.getBoundingClientRect();
      const targetLeft = galleryRail.scrollLeft
        + itemBounds.left
        - railBounds.left
        - (galleryRail.clientWidth - itemBounds.width) / 2;
      galleryRail.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: reducedMotion ? "auto" : "smooth",
      });
      window.setTimeout(() => { galleryProgrammaticScroll = false; }, reducedMotion ? 0 : 500);
    }
  };

  const updateGalleryViewer = (index) => {
    if (!galleryImage || !galleryCount || galleryItems.length === 0) return;
    updateGalleryFeature(index, { scrollThumbnail: true });
    const sourceImage = galleryItems[activeGalleryIndex].querySelector("img");
    if (!sourceImage) return;
    galleryImage.src = sourceImage.currentSrc || sourceImage.src;
    galleryImage.alt = galleryDescriptions[activeGalleryIndex] || "Dark Waves gameplay capture";
    galleryCount.textContent = `${String(activeGalleryIndex + 1).padStart(2, "0")} / ${String(galleryItems.length).padStart(2, "0")}`;
  };

  const openGalleryViewer = (index, trigger) => {
    if (!galleryDialog) return;
    galleryTrigger = trigger;
    updateGalleryViewer(index);
    if (typeof galleryDialog.showModal === "function") {
      if (!galleryDialog.open) galleryDialog.showModal();
    } else {
      galleryDialog.setAttribute("open", "");
    }
  };

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => updateGalleryFeature(index, { scrollThumbnail: true }));
  });

  galleryFeature?.addEventListener("click", () => {
    openGalleryViewer(activeGalleryIndex, galleryFeature);
  });

  document.querySelectorAll("[data-gallery-feature-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.galleryFeatureDirection === "next" ? 1 : -1;
      updateGalleryFeature(activeGalleryIndex + direction, { scrollThumbnail: true });
    });
  });

  galleryDialog?.querySelectorAll("[data-gallery-direction]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.galleryDirection === "next" ? 1 : -1;
      updateGalleryViewer(activeGalleryIndex + direction);
    });
  });

  galleryDialog?.addEventListener("click", (event) => {
    if (event.target !== galleryDialog) return;
    if (typeof galleryDialog.close === "function") galleryDialog.close();
    else galleryDialog.removeAttribute("open");
  });

  galleryDialog?.addEventListener("close", () => galleryTrigger?.focus());

  document.addEventListener("keydown", (event) => {
    if (!galleryDialog?.open || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    updateGalleryViewer(activeGalleryIndex + (event.key === "ArrowRight" ? 1 : -1));
  });

  document.querySelectorAll("[data-gallery-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.galleryScroll === "next" ? 1 : -1;
      updateGalleryFeature(activeGalleryIndex + direction, { scrollThumbnail: true });
    });
  });

  galleryRail?.addEventListener("scroll", () => {
    if (galleryProgrammaticScroll) return;
    window.clearTimeout(galleryScrollTimer);
    galleryScrollTimer = window.setTimeout(() => {
      const railLeft = galleryRail.getBoundingClientRect().left;
      let nearestIndex = activeGalleryIndex;
      let nearestDistance = Number.POSITIVE_INFINITY;
      galleryItems.forEach((item, index) => {
        const distance = Math.abs(item.getBoundingClientRect().left - railLeft);
        if (distance >= nearestDistance) return;
        nearestDistance = distance;
        nearestIndex = index;
      });
      updateGalleryFeature(nearestIndex);
    }, 140);
  }, { passive: true });

  updateGalleryFeature(0);

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
  }, { threshold: .12, rootMargin: "0px 0px -5%" });

  reveals.forEach((element, index) => {
    if (element.closest(".dw-hero")) {
      element.style.transitionDelay = `${Math.min(index * 120, 360)}ms`;
    }
    observer.observe(element);
  });
})();
