/* ============================================
   Home Page - Hero Animation & Counters
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeroAnimation();
  initParticles('hero-particles');
  if (window.initCounters) window.initCounters();
});

function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero__logo', {
    opacity: 0,
    scale: 0.8,
    duration: 0.8,
    delay: 0.3
  })
  .from('.hero__title .word', {
    opacity: 0,
    y: 40,
    duration: 0.6,
    stagger: 0.08
  }, '-=0.3')
  .from('.hero__subtitle', {
    opacity: 0,
    y: 20,
    duration: 0.6
  }, '-=0.2')
  .from('.hero__cta-group', {
    opacity: 0,
    y: 30,
    duration: 0.6
  }, '-=0.2')
  .from('.hero__scroll-indicator', {
    opacity: 0,
    y: -20,
    duration: 0.5
  }, '-=0.1');
}
