console.log("main.js running ✅");

document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll("section, .card");

  // Start hidden BEFORE revealing
  targets.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // force browser to register the hidden state first
        entry.target.getBoundingClientRect();
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => io.observe(el));
});
