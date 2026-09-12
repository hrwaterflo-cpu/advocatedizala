document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  const navLinks = [...document.querySelectorAll(".main-nav a[href^='#']")];
  const revealItems = document.querySelectorAll(".reveal");
  const sections = document.querySelectorAll("main section[id]");
  const counters = document.querySelectorAll(".counter");
  const tiltCards = document.querySelectorAll("[data-tilt]");
  const profileImage = document.querySelector(".profile-photo");
  const year = document.querySelector("#year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Keep the local fallback image, but prefer the supplied professional
  // photo when its remote URL is reachable.
  if (profileImage?.dataset.remoteSrc) {
    const remotePhoto = new Image();
    remotePhoto.onload = () => {
      profileImage.src = profileImage.dataset.remoteSrc;
    };
    remotePhoto.src = profileImage.dataset.remoteSrc;
  }

  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 20);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const closeMenu = () => {
    nav?.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation menu");
    document.body.classList.remove("menu-open");
  };

  menuToggle?.addEventListener("click", () => {
    const opened = nav?.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(Boolean(opened)));
    menuToggle.setAttribute("aria-label", opened ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("menu-open", Boolean(opened));
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -36px 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${visible.target.id}`
        );
      });
    },
    {
      threshold: [0.18, 0.35, 0.55],
      rootMargin: "-25% 0px -55% 0px",
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = Number(element.dataset.target || 0);
        const suffix = element.dataset.suffix || "";
        const duration = 850;
        const start = performance.now();

        const animate = (time) => {
          const progress = Math.min((time - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = `${Math.round(target * eased)}${suffix}`;

          if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
        observer.unobserve(element);
      });
    },
    { threshold: 0.65 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  const canTilt = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (min-width: 901px)"
  );

  const resetTilt = (inner) => {
    inner.style.transform = "";
  };

  tiltCards.forEach((card) => {
    const inner =
      card.querySelector(".tilt-inner") ||
      (card.classList.contains("portrait-stage")
        ? card.querySelector(".portrait-card")
        : null);

    if (!inner) return;

    card.addEventListener("pointermove", (event) => {
      if (!canTilt.matches) {
        resetTilt(inner);
        return;
      }

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 7;
      const rotateX = (0.5 - y) * 7;

      inner.style.transform =
        `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    });

    card.addEventListener("pointerleave", () => resetTilt(inner));
  });

  canTilt.addEventListener?.("change", () => {
    if (canTilt.matches) return;

    tiltCards.forEach((card) => {
      const inner =
        card.querySelector(".tilt-inner") ||
        card.querySelector(".portrait-card");
      if (inner) resetTilt(inner);
    });
  });
});
