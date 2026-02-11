// main.js (FULL)
console.log("main.js running ✅");

document.addEventListener("DOMContentLoaded", () => {
  // ===== Footer year =====
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // ===== Reveal (scroll down + up) =====
  const targets = document.querySelectorAll("section, .card, .featuredCard");
  targets.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("in");
      else entry.target.classList.remove("in");
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px"
  });

  targets.forEach(el => io.observe(el));

  // ===== Carousel =====
  initCarousel();

  // ===== Projects filters (projects.html) =====
  initFilters();

  // ===== Burger menu =====
  initBurgerMenu();
});

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
