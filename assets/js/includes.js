/* /assets/js/includes.js — robust loader for header, footer, and any partials */

/* How it works:
   - If data-include="header" or "footer", it loads from `${BASE}partials/header.html` or footer.html
   - If data-include ends with .html (e.g. "/assets/partials/license.html"), it loads that exact path
   - BASE comes from window.ALYSSIUN_BASE or defaults to "/assets/"
*/

(function () {
  const BASE = (window.ALYSSIUN_BASE || "/assets/").replace(/\/+$/, "") + "/";

  function resolveUrl(token) {
    if (!token) return null;

    // If the token looks like a file, use it as-is
    if (/\.html?(\?.*)?$/i.test(token)) return token;

    // Friendly aliases
    if (token === "header") return `${BASE}partials/header.html`;
    if (token === "footer") return `${BASE}partials/footer.html`;

    // Fall back: treat token as relative under BASE
    return `${BASE}${token.replace(/^\/+/, "")}`;
  }

  async function loadInto(el, url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const html = await res.text();
      // Use innerHTML so the element remains in place (avoids layout flashes)
      el.innerHTML = html;
      return true;
    } catch (err) {
      console.warn("Include failed:", url, err);
      return false;
    }
  }

  async function processIncludes() {
    const nodes = Array.from(document.querySelectorAll("[data-include]"));

    for (const host of nodes) {
      const token = host.getAttribute("data-include");
      const url = resolveUrl(token);
      if (!url) continue;
      await loadInto(host, url);
    }

    // Recompute header offset after header is injected
    setHeaderOffset();
    initNav();
    window.addEventListener("resize", setHeaderOffset, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", processIncludes);

  /* ---------- Layout: fixed header offset ---------- */
  function setHeaderOffset() {
    const h = document.querySelector(".site-header");
    if (!h) return;
    const height = Math.ceil(h.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--header-h", height + "px");
    document.body.classList.add("has-fixed-header");
  }

  /* ---------- Navigation & dropdowns ---------- */
  function initNav() {
    const nav = document.querySelector("[data-nav]");
    const toggleBtn = document.querySelector(".nav-toggle");
    const closeBtn = nav?.querySelector(".nav-close");
    if (!nav || !toggleBtn) return;

    function toggleMenu(open) {
      nav.classList.toggle("open", open);
      toggleBtn.setAttribute("aria-expanded", String(open));
      document.documentElement.classList.toggle("body-lock", open);
      if (!open) closeAllDropdowns();
    }

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

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (nav.classList.contains("open")) toggleMenu(false);
        closeAllDropdowns();
      }
    });

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
  }

  function closeAllDropdowns() {
    document.querySelectorAll(".dropdown-content.show").forEach((m) => m.classList.remove("show"));
    document.querySelectorAll('.dropbtn[aria-expanded="true"]').forEach((b) => b.setAttribute("aria-expanded", "false"));
  }
})();
