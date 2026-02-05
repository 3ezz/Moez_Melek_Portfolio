// ===== Portfolio JS =====

// footer year
document.getElementById("y").textContent = new Date().getFullYear();

// scroll reveal animations
document.addEventListener("DOMContentLoaded", () => {

  const targets = document.querySelectorAll("section, .card");

  targets.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        // slight delay = visible transition
        setTimeout(() => {
          entry.target.classList.add("in");
        }, 80);

        observer.unobserve(entry.target);
      }

    });

  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));

});
