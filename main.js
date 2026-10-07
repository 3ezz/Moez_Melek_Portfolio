// main.js (FULL)

document.addEventListener("DOMContentLoaded", () => {
  // ===== Footer year =====
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // ===== Projects cards (home + projects) =====
  initProjectCards();

  // ===== Reveal (scroll down + up) =====
  initReveal();

  // ===== Carousel (slides come from projects-data.js: showCarousel) =====
  renderCarouselSlides();
  initCarousel();

  // ===== Projects filters (projects.html) =====
  initFilters();

  // ===== Burger menu =====
  initBurgerMenu();

  // ===== Highlight current page in nav =====
  initActiveNav();

  // ===== Visitor analytics =====
  initAnalytics();
});

function initReveal(){
  const rawTargets = document.querySelectorAll("section, .projectGrid > .panelCard, .card, .featuredCard");
  const targets = Array.from(new Set(Array.from(rawTargets))).filter(el => !el.classList.contains("projectGrid"));
  if (targets.length === 0) return;

  const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;

  targets.forEach(el => {
    const tooTall = viewportH > 0 && el.offsetHeight > viewportH * 2.4;
    if (tooTall) {
      // Avoid hiding very tall blocks that can fail strict IO ratios.
      el.classList.remove("reveal");
      el.classList.add("in");
      return;
    }

    el.classList.add("reveal");
  });

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      // One-way reveal keeps content visible and avoids re-triggering slow reanimations.
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -5% 0px"
  });

  targets.forEach(el => {
    if (el.classList.contains("reveal")) io.observe(el);
  });

  // Safety net: if a target never intersects (very tall/lazy media timing), make it visible.
  window.setTimeout(() => {
    targets.forEach(el => {
      if (el.classList.contains("reveal") && !el.classList.contains("in")) {
        el.classList.add("in");
      }
    });
  }, 1800);
}


function renderCarouselSlides(){
  const track = document.querySelector("[data-carousel] [data-track]");
  const data = Array.isArray(window.PROJECTS_DATA) ? window.PROJECTS_DATA : [];
  if (!track || track.children.length) return;

  sortByOrder(data.filter(p => p.showCarousel === true), "carouselOrder").forEach((p, idx) => {
    const slide = document.createElement("div");
    slide.className = "carSlide";
    const img = p.carouselImage || p.thumbnail;
    slide.innerHTML = `
      <div class="carCard">
        ${img ? `<img class="carBg" src="${escapeHtml(img)}" alt="" decoding="async"${idx ? ' fetchpriority="low"' : ""}>` : ""}
        <div class="carLabel">${escapeHtml(p.carouselLabel || p.status || "Project")}</div>
        <div class="carTitle">${escapeHtml(p.carouselTitle || p.title)}</div>
        <div class="carDesc">${escapeHtml(p.carouselText || p.description || "")}</div>
        <a class="btn primary" href="${escapeHtml(p.href)}">Open</a>
      </div>`;
    track.appendChild(slide);
  });
}

function initCarousel(){
  const root = document.querySelector("[data-carousel]");
  if (!root) return;

  const track = root.querySelector("[data-track]");
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  const dotsWrap = root.querySelector("[data-dots]");

  if (!track || !prev || !next || !dotsWrap) {
    console.warn("Carousel: missing elements");
    return;
  }

  const slides = Array.from(track.children);
  if (slides.length === 0) return;

  let i = 0;

  // Build dots (real buttons so they're keyboard-accessible)
  dotsWrap.innerHTML = "";
  slides.forEach((_, idx) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "dot" + (idx === 0 ? " on" : "");
    d.setAttribute("aria-label", `Show slide ${idx + 1} of ${slides.length}`);
    d.addEventListener("click", () => go(idx));
    dotsWrap.appendChild(d);
  });

  const dots = Array.from(dotsWrap.children);

  function render(){
    track.style.transform = `translateX(${-i * 100}%)`;
    dots.forEach((d, idx) => {
      d.classList.toggle("on", idx === i);
      d.setAttribute("aria-current", idx === i ? "true" : "false");
    });
    // Keep links in hidden slides out of the tab order
    slides.forEach((s, idx) => {
      s.setAttribute("aria-hidden", idx === i ? "false" : "true");
      s.querySelectorAll("a").forEach(a => a.tabIndex = idx === i ? 0 : -1);
    });
  }

  function go(idx){
    i = (idx + slides.length) % slides.length;
    render();
  }

  prev.addEventListener("click", () => { go(i - 1); restart(); });
  next.addEventListener("click", () => { go(i + 1); restart(); });

  // Auto-play: off for reduced-motion users; paused on hover, focus or hidden tab
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let t = null;
  function stop(){ if (t) { clearInterval(t); t = null; } }
  function start(){ if (!reduceMotion && !t) t = setInterval(() => go(i + 1), 5000); }
  function restart(){ stop(); if (!root.matches(":hover") && !root.contains(document.activeElement)) start(); }

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) start(); });
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

  // Swipe on touch screens
  let x0 = null;
  root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  root.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
    x0 = null;
    start();
  });

  start();
  render();
}

function initFilters(){
  const list = document.getElementById("allProjects");
  if (!list) return;

  const btns = document.querySelectorAll("[data-filter]");
  if (btns.length === 0) return;

  btns.forEach(b => b.addEventListener("click", () => {
    btns.forEach(x => x.classList.remove("isOn"));
    b.classList.add("isOn");

    const f = b.dataset.filter;

    list.querySelectorAll(".card").forEach(card => {
      const tags = (card.dataset.tags || "");
      // ✅ FIX: safer exact tag matching (no accidental substring matches)
      const ok = f === "all" || tags.split(" ").includes(f);
      card.style.display = ok ? "" : "none";
    });
  }));
}

function initBurgerMenu(){
  const burger = document.querySelector(".burger");
  const menu = document.getElementById("mobileMenu");
  if(!burger || !menu) return;

  const root = document.documentElement;

  function closeMenu(){
    root.classList.remove("menuOpen");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  }

  function openMenu(){
    root.classList.add("menuOpen");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
  }

  burger.addEventListener("click", () => {
    const isOpen = root.classList.contains("menuOpen");
    isOpen ? closeMenu() : openMenu();
  });

  // Close when clicking a link
  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => closeMenu());
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if(!root.classList.contains("menuOpen")) return;
    const clickedInside = menu.contains(e.target) || burger.contains(e.target);
    if(!clickedInside) closeMenu();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeMenu();
  });
}


function initActiveNav(){
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const inProjectPage = /\/projects\/[^/]+$/.test(location.pathname);
  document.querySelectorAll("#mobileMenu a").forEach(a => {
    const target = (a.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (target.includes("#")) return;
    const isCurrent = target === file || (inProjectPage && target === "projects.html");
    if (isCurrent) a.setAttribute("aria-current", "page");
  });
}


function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[ch]);
}

function createProjectCard(project, includeTags = false){
  const card = document.createElement("a");
  card.className = "card";
  card.href = project.href;

  const tags = [...(project.tags || [])];
  if (project.category) tags.push(project.category);

  if (includeTags) {
    card.dataset.tags = tags.join(" ");
  }

  const pills = (project.pills || []).map(pill => `<span class="pill">${escapeHtml(pill)}</span>`).join("");
  const thumbSrc = project.thumbnail || "assets/icons/card-thumbnail-placeholder.svg";
  const statusText = project.status || "WIP";

  const fitClass = project.thumbFit === "contain" ? " thumbContain" : "";
  const thumbStyle = project.thumbBg ? ` style="background:${escapeHtml(project.thumbBg)}"` : "";

  card.innerHTML = `
    <div class="thumb${fitClass}"${thumbStyle}>
      <img class="thumbImg" src="${escapeHtml(thumbSrc)}" alt="" loading="lazy" decoding="async" width="640" height="360">
      <span class="thumbLabel">${escapeHtml(project.thumbLabel || "PROJECT")}</span>
    </div>
    <div class="cardBody">
      <div class="cardTitleRow">
        <h3>${escapeHtml(project.title)}</h3>
        <span class="statusBadge">${escapeHtml(statusText)}</span>
      </div>
      <p>${escapeHtml(project.description)}</p>
      <div class="pillRow">${pills}</div>
    </div>
  `;

  return card;
}

function sortByOrder(items, key){
  return [...items].sort((a, b) => (a[key] ?? 999) - (b[key] ?? 999));
}

function renderCards(container, items, includeTags = false){
  if (!container) return;
  container.innerHTML = "";
  items.forEach(item => container.appendChild(createProjectCard(item, includeTags)));
}

function initProjectCards(){
  const data = Array.isArray(window.PROJECTS_DATA) ? window.PROJECTS_DATA : null;
  if (!data) return;

  const featuredGrid = document.getElementById("featuredProjectsGrid");
  const homeUnityGrid = document.getElementById("homeUnityProjectsGrid");
  const homeUeGrid = document.getElementById("homeUeProjectsGrid");
  const allProjectsGrid = document.getElementById("allProjects");

  data.forEach((project, idx) => {
    if (!project?.title || !project?.href) {
      console.warn(`Project entry #${idx} is missing title or href and may not render correctly.`, project);
    }
  });

  if (featuredGrid) {
    renderCards(featuredGrid, sortByOrder(data.filter(p => p.showFeaturedRow === true), "featuredOrder"));
  }

  if (homeUnityGrid) {
    renderCards(homeUnityGrid, sortByOrder(data.filter(p => p.showHomeUnity === true), "homeUnityOrder"));
  }

  if (homeUeGrid) {
    renderCards(homeUeGrid, sortByOrder(data.filter(p => p.showHomeUe === true), "homeUeOrder"));
  }

  if (allProjectsGrid) {
    // Default to visible on the all-projects page unless explicitly turned off.
    renderCards(allProjectsGrid, sortByOrder(data.filter(p => p.showProjectsPage !== false), "projectsOrder"), true);
  }
}


function initAnalytics(){
  const cfg = getAnalyticsConfig();
  if (!cfg.endpoint) {
    if (cfg.debug) console.warn("Analytics disabled: set ANALYTICS_ENDPOINT in main.js.");
    return;
  }

  const sessionId = getSessionId();
  const visitorId = getVisitorId();
  const startPath = window.location.pathname + window.location.search + window.location.hash;

  trackAnalyticsEvent("page_view", {
    path: startPath,
    title: document.title,
    referrer: document.referrer || "direct",
    visitorId,
    sessionId: sessionId.id
  }, cfg);

  trackScrollDepth(cfg, visitorId, sessionId);
  trackNavigationClicks(cfg, visitorId, sessionId);

  let exitSent = false;
  window.addEventListener("pagehide", () => {
    if (exitSent) return;
    exitSent = true;
    const secondsOnPage = Math.max(0, Math.round((Date.now() - sessionId.createdAt) / 1000));
    trackAnalyticsEvent("page_exit", {
      path: window.location.pathname + window.location.search + window.location.hash,
      secondsOnPage,
      visitorId,
      sessionId: sessionId.id
    }, cfg, true);
  });
}

function getAnalyticsConfig(){
  return {
    // Example: "https://portfolio-analytics.<your-subdomain>.workers.dev/track"
    endpoint: "https://moez-melek-portfolio.moezmaleksk.workers.dev/track",
    // Set to true while wiring Cloudflare Worker + browser debugging.
    debug: false,
    site: "Moez_Melek_Portfolio"
  };
}

function getVisitorId(){
  const key = "mm_visitor_id";
  const created = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  // localStorage can throw (private mode, blocked storage); analytics must never break the page.
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    localStorage.setItem(key, created);
  } catch (_) { /* fall back to a per-page id */ }
  return created;
}

function getSessionId(){
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now()
  };
}

function trackNavigationClicks(cfg, visitorId, sessionId){
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("javascript:")) return;

    const isExternal = /^https?:\/\//i.test(href) && !href.includes(window.location.host);
    trackAnalyticsEvent("navigation_click", {
      fromPath: window.location.pathname + window.location.search + window.location.hash,
      to: href,
      text: (link.textContent || "").trim().slice(0, 120),
      isExternal,
      visitorId,
      sessionId: sessionId.id
    }, cfg);
  });
}

function trackScrollDepth(cfg, visitorId, sessionId){
  const marks = [25, 50, 75, 100];
  const sent = new Set();

  function onScroll(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const viewport = window.innerHeight || document.documentElement.clientHeight || 0;
    const fullHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 1);
    const percent = Math.min(100, Math.round(((scrollTop + viewport) / fullHeight) * 100));

    marks.forEach((mark) => {
      if (percent < mark || sent.has(mark)) return;
      sent.add(mark);
      trackAnalyticsEvent("scroll_depth", {
        path: window.location.pathname + window.location.search + window.location.hash,
        percent: mark,
        visitorId,
        sessionId: sessionId.id
      }, cfg);
    });

    if (sent.size === marks.length) {
      window.removeEventListener("scroll", onScroll);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function trackAnalyticsEvent(eventName, data, cfg, preferBeacon = false){
  const payload = {
    event: eventName,
    site: cfg.site,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    ...data
  };

  const body = JSON.stringify(payload);
  if (cfg.debug) console.log("analytics", payload);

  if (preferBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(cfg.endpoint, blob);
    return;
  }

  fetch(cfg.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    mode: "cors"
  }).catch((err) => {
    if (cfg.debug) console.warn("analytics failed", err);
  });
}
