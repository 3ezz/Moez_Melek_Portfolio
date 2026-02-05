console.log("main.js running ✅");

document.addEventListener("DOMContentLoaded", () => {
  const targets = document.querySelectorAll(".card, section");

  targets.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {

        // stagger delay based on index
        const index = [...targets].indexOf(entry.target);

        setTimeout(() => {
          entry.target.classList.add("in");
        }, index * 120); // ← animation cascade

        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: "0px 0px -80px 0px"
  });

  targets.forEach(el => io.observe(el));
});
