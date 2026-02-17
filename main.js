// main.js (FULL)
console.log("main.js running ✅");

document.addEventListener("DOMContentLoaded", () => {
  // ===== Footer year =====
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // ===== Projects cards (home + projects) =====
  initProjectCards();

  // ===== Reveal (scroll down + up) =====
  initReveal();

  // ===== Carousel =====
  initCarousel();

  // ===== Projects filters (projects.html) =====
  initFilters();

  // ===== Burger menu =====
  initBurgerMenu();

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

  // Build dots
  dotsWrap.innerHTML = "";
  slides.forEach((_, idx) => {
    const d = document.createElement("div");
    d.className = "dot" + (idx === 0 ? " on" : "");
    d.addEventListener("click", () => go(idx));
    dotsWrap.appendChild(d);
  });

  const dots = Array.from(dotsWrap.children);

  function render(){
    track.style.transform = `translateX(${-i * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle("on", idx === i));
  }

  function go(idx){
    i = (idx + slides.length) % slides.length;
    render();
  }

  prev.addEventListener("click", () => go(i - 1));
  next.addEventListener("click", () => go(i + 1));

  // Auto-play (pause on hover)
  let t = setInterval(() => go(i + 1), 5000);
  root.addEventListener("mouseenter", () => clearInterval(t));
  root.addEventListener("mouseleave", () => {
    clearInterval(t);
    t = setInterval(() => go(i + 1), 5000);
  });

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


function createProjectCard(project, includeTags = false){
  const card = document.createElement("a");
  card.className = "card";
  card.href = project.href;

  const tags = [...(project.tags || [])];
  if (project.category) tags.push(project.category);

  if (includeTags) {
    card.dataset.tags = tags.join(" ");
  }

  const pills = (project.pills || []).map(pill => `<span class="pill">${pill}</span>`).join("");
  const thumbSrc = project.thumbnail || "assets/icons/card-thumbnail-placeholder.svg";
  const statusText = project.status || "WIP";

  card.innerHTML = `
    <div class="thumb">
      <img class="thumbImg" src="${thumbSrc}" alt="${project.title} thumbnail" loading="lazy" decoding="async">
      <span class="thumbLabel">${project.thumbLabel || "PROJECT"}</span>
    </div>
    <div class="cardTitleRow">
      <h3>${project.title}</h3>
      <span class="statusBadge">${statusText}</span>
    </div>
    <p>${project.description}</p>
    <div class="pillRow">${pills}</div>
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
    sessionId
  }, cfg);

  trackScrollDepth(cfg, visitorId, sessionId);
  trackNavigationClicks(cfg, visitorId, sessionId);

  window.addEventListener("beforeunload", () => {
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
    endpoint: "",
    // Set to true while wiring Cloudflare Worker + browser debugging.
    debug: false,
    site: "Moez_Melek_Portfolio"
  };
}

function getVisitorId(){
  const key = "mm_visitor_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const created = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, created);
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
