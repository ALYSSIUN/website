(function () {
  const BASE = (window.ALYSSIUN_BASE || "/assets/").replace(/\/+$/, "") + "/";

  async function fetchFirst(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) return await res.text();
      } catch (_) {}
    }
    return null;
  }
  async function inject(selector, urls) {
    const host = document.querySelector(selector);
    if (!host) return;
    const html = await fetchFirst(urls);
    if (html) host.outerHTML = html;
  }

  const headerURLs = [`${BASE}partials/header.html`, "/partials/header.html", "./partials/header.html"];
  const footerURLs = [`${BASE}partials/footer.html`, "/partials/footer.html", "./partials/footer.html"];

  Promise.resolve(inject('[data-include="header"]', headerURLs)).then(() => {
    initNav();
    setHeaderOffset();
    window.addEventListener("resize", setHeaderOffset);
  });
  inject('[data-include="footer"]', footerURLs);

  function setHeaderOffset() {
    const h = document.querySelector(".site-header");
    if (!h) return;
    const height = Math.ceil(h.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-h", height + "px");
    document.body.classList.add("has-fixed-header");
  }

  function initNav() {
    const nav = document.querySelector("[data-nav]");
    const toggle = document.querySelector(".nav-toggle");
    const closeBtn = nav?.querySelector(".nav-close");

    const openMenu = () => {
      nav?.classList.add("open");
      toggle?.setAttribute("aria-expanded", "true");
      document.documentElement.classList.add("body-lock");
    };
    const closeMenu = () => {
      nav?.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("body-lock");
      closeAllDropdowns();
    };

    toggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      nav?.classList.contains("open") ? closeMenu() : openMenu();
    });
    closeBtn?.addEventListener("click", closeMenu);

    document.addEventListener("click", (e) => {
      if (!nav?.classList.contains("open")) return;
      if (nav.contains(e.target) || toggle?.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (nav?.classList.contains("open")) closeMenu();
        closeAllDropdowns();
      }
    });

    // Stable dropdown
    document.querySelectorAll("[data-dropdown]").forEach((dd) => {
      const btn = dd.querySelector(".dropbtn");
      const menu = dd.querySelector(".dropdown-content");
      if (!btn || !menu) return;

      let hideTimer = null;
      const open = () => { clearTimeout(hideTimer); menu.classList.add("show"); btn.setAttribute("aria-expanded","true"); };
      const close = () => { hideTimer = setTimeout(() => { menu.classList.remove("show"); btn.setAttribute("aria-expanded","false"); }, 140); };

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (menu.classList.contains("show")) close();
        else open();
      });

      dd.addEventListener("mouseenter", open);
      dd.addEventListener("mouseleave", close);
      menu.addEventListener("mouseenter", () => clearTimeout(hideTimer));
      menu.addEventListener("mouseleave", close);
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("[data-dropdown]")) return;
      closeAllDropdowns();
    });

    function closeAllDropdowns() {
      document.querySelectorAll(".dropdown-content.show").forEach((m) => m.classList.remove("show"));
      document.querySelectorAll('.dropbtn[aria-expanded="true"]').forEach((b) => b.setAttribute("aria-expanded", "false"));
    }
  }
})();
