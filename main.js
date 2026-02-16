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
