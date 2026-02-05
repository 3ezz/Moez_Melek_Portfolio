console.log("main.js running ✅");

document.addEventListener("DOMContentLoaded", () => {

  const targets = document.querySelectorAll("section, .card");

  targets.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  targets.forEach(el => observer.observe(el));

});
