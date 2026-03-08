/* ============================================
   Scroll Reveal Animations (Intersection Observer)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initParallax();
});

/* --- Intersection Observer Scroll Reveals --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* --- GSAP Parallax (if GSAP loaded) --- */
function initParallax() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Parallax backgrounds
  document.querySelectorAll('.parallax-section__bg').forEach(bg => {
    gsap.to(bg, {
      y: '20%',
      ease: 'none',
      scrollTrigger: {
        trigger: bg.closest('.parallax-section'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });
}

/* --- Animated Counters --- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');

  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    el.textContent = prefix + current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Export for use in page-specific scripts
window.initCounters = initCounters;
