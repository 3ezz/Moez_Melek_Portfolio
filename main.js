document.addEventListener("DOMContentLoaded", () => {
console.log("main.js loaded ✅");

  const targets = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        requestAnimationFrame(() => {
          entry.target.classList.add("in");
        });

        observer.unobserve(entry.target);
      }

    });

  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));

});
