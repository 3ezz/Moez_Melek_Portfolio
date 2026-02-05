console.log("main.js running ✅");

document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll("section, .card");

  // Make sure they start in the hidden state
  targets.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
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
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px"
  });

  targets.forEach(el => observer.observe(el));
});
