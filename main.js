console.log("main.js running ✅");

document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // Reveal targets
  const targets = document.querySelectorAll("section, .card, .featuredCard");

  // Start hidden
  targets.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;

      if (entry.isIntersecting) {
        // entering viewport -> animate in
        el.classList.add("in");
      } else {
        // leaving viewport -> reset so it can animate again
        el.classList.remove("in");
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -10% 0px"
  });

  targets.forEach(el => io.observe(el));
  // ===== Cute carousel =====
(function(){
  const root = document.querySelector("[data-carousel]");
  if(!root) return;

  const track = root.querySelector("[data-track]");
  const prev = root.querySelector("[data-prev]");
  const next = root.querySelector("[data-next]");
  const dotsWrap = root.querySelector("[data-dots]");
  const slides = Array.from(track.children);

  let i = 0;

  // dots
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

  // auto-play (gentle)
  let t = setInterval(() => go(i + 1), 5000);
  root.addEventListener("mouseenter", () => clearInterval(t));
  root.addEventListener("mouseleave", () => t = setInterval(() => go(i + 1), 5000));
})();

// ===== Projects filters (projects.html) =====
(function(){
  const list = document.getElementById("allProjects");
  if(!list) return;

  const btns = document.querySelectorAll("[data-filter]");
  btns.forEach(b => b.addEventListener("click", () => {
    btns.forEach(x => x.classList.remove("isOn"));
    b.classList.add("isOn");

    const f = b.dataset.filter;
    list.querySelectorAll(".card").forEach(card => {
      const tags = (card.dataset.tags || "");
      const ok = f === "all" || tags.includes(f);
      card.style.display = ok ? "" : "none";
    });
  }));
})();

});
