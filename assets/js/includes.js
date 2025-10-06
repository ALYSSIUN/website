<script>
(function () {
  const BASE = (window.ALYSSIUN_BASE || "/assets/").replace(/\/+$/, "") + "/";

  // Fetch first working URL
  async function fetchFirst(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) return await res.text();
      } catch (_) {}
    }
    return null;
  }

  // Replace the host element with fetched HTML
  async function inject(host, urls) {
    const html = await fetchFirst(urls);
    if (!html) return;
    host.outerHTML = html;
  }

  // Build candidate URLs for a given include token
  function candidateURLs(token) {
    // special tokens for convenience
    if (token === "header") {
      return [
        `${BASE}partials/header.html`,
        "/assets/partials/header.html",
        "/partials/header.html",
        "./partials/header.html",
      ];
    }
    if (token === "footer") {
      return [
        `${BASE}partials/footer.html`,
        "/assets/partials/footer.html",
        "/partials/footer.html",
        "./partials/footer.html",
      ];
    }

    // direct file paths (recommended: /assets/partials/xxxx.html)
    // try exactly as given, then resolve under BASE
    const t = token.replace(/^\/+/, ""); // drop leading slash for BASE join
    return [token, `${BASE}${t}`];
  }

  // ---------- Auto include all placeholders ----------
  document.addEventListener("DOMContentLoaded", async () => {
    const placeholders = Array.from(document.querySelectorAll("[data-include]"));

    // Inject in order so header exists before nav init
    for (const host of placeholders) {
      const token = host.getAttribute("data-include");
      await inject(host, candidateURLs(token));
    }

    // After header/footer are in DOM, run layout/nav setup
    setHeaderOffset();
    initNav();

    window.addEventListener("resize", setHeaderOffset, { passive: true });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllDropdowns();
        const nav = document.querySelector("[data-nav]");
        if (nav?.classList.contains("open")) toggleMenu(false);
      }
    });
  });

  // ---------- Layout: fixed header offset ----------
  function setHeaderOffset() {
    const h = document.querySelector(".site-header");
    if (!h) return;
    const height = Math.ceil(h.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-h", height + "px");
    document.body.classList.add("has-fixed-header");
  }

  // ---------- Navigation & dropdowns ----------
  function initNav() {
    const nav = document.querySelector("[data-nav]");
    const toggleBtn = document.querySelector(".nav-toggle");
    const closeBtn = nav?.querySelector(".nav-close");

    if (!nav || !toggleBtn) return;

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu(!nav.classList.contains("open"));
    });
    closeBtn?.addEventListener("click", () => toggleMenu(false));

    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || toggleBtn.contains(e.target)) return;
      toggleMenu(false);
    });

    // Dropdowns with stable hover/click
    document.querySelectorAll("[data-dropdown]").forEach((dd) => {
      const btn = dd.querySelector(".dropbtn");
      const menu = dd.querySelector(".dropdown-content");
      if (!btn || !menu) return;

      let hideTimer = null;
      const open = () => { clearTimeout(hideTimer); menu.classList.add("show"); btn.setAttribute("aria-expanded","true"); };
      const close = () => { hideTimer = setTimeout(() => { menu.classList.remove("show"); btn.setAttribute("aria-expanded","false"); }, 140); };

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.contains("show") ? close() : open();
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

    function toggleMenu(open) {
      open ? nav.classList.add("open") : nav.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("body-lock", open);
      if (!open) closeAllDropdowns();
    }
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-content.show").forEach((m) => m.classList.remove("show"));
    document.querySelectorAll('.dropbtn[aria-expanded="true"]').forEach((b) => b.setAttribute("aria-expanded", "false"));
  }
})();
</script>
