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
});
