/* ============================================
   Main JS - Shared across all pages
   Sticky Nav, Hamburger, Smooth Scroll
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initSmoothScroll();
  setFooterYear();
});

/* --- Sticky Navigation --- */
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* --- Smooth Scroll for Anchor Links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* --- Footer Year --- */
function setFooterYear() {
  const yearEl = document.querySelector('.footer__year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}
