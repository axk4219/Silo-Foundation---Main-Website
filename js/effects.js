/* ============================================
   Enhanced Effects
   Scroll Progress, Magnetic, 3D Tilt,
   Nav Letters, Text Shimmer, Slot Counters
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initMagneticButtons();
  init3DCardTilt();
  initNavLetterSplit();
  initSlotCounters();
  initImageRevealWipe();
});

/* --- 1. Scroll Progress Bar --- */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }, { passive: true });
}

/* --- 2. Magnetic Cursor Effect --- */
function initMagneticButtons() {
  if (window.innerWidth < 1024) return; // Desktop only

  const magnetics = document.querySelectorAll('.btn, .nav__donate-btn, .footer__social-link, .chatbot-bubble');

  magnetics.forEach(el => {
    el.classList.add('magnetic');

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const strength = 0.3;

      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* --- 3. 3D Card Tilt on Hover --- */
function init3DCardTilt() {
  if (window.innerWidth < 1024) return; // Desktop only

  const cards = document.querySelectorAll('.card, .product-card, .stat, .team-card, .highlight-card');

  cards.forEach(card => {
    card.classList.add('card-3d');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8; // Max 8deg
      const rotateY = ((x - centerX) / centerX) * 8;

      // Set CSS variables for the light reflection
      card.style.setProperty('--mouse-x', (x / rect.width * 100) + '%');
      card.style.setProperty('--mouse-y', (y / rect.height * 100) + '%');

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });
}

/* --- 4. Staggered Nav Letter Hover --- */
function initNavLetterSplit() {
  const navLinks = document.querySelectorAll('.nav__links .nav__link');

  navLinks.forEach(link => {
    const text = link.textContent;
    link.textContent = '';
    link.setAttribute('aria-label', text);

    [...text].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'letter';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.transitionDelay = (i * 0.03) + 's';
      link.appendChild(span);
    });

    // Re-add the ::after underline by keeping the link structure
    link.addEventListener('mouseenter', () => {
      link.querySelectorAll('.letter').forEach((letter, i) => {
        setTimeout(() => {
          letter.style.transform = 'translateY(-2px)';
        }, i * 30);
      });
    });

    link.addEventListener('mouseleave', () => {
      link.querySelectorAll('.letter').forEach(letter => {
        letter.style.transform = '';
      });
    });
  });
}

/* --- 5. Slot Machine Counters --- */
function initSlotCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateSlotCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateSlotCounter(el) {
  const target = parseInt(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const targetStr = target.toLocaleString();

  // Clear existing content
  el.textContent = '';
  el.style.display = 'inline-flex';
  el.style.overflow = 'hidden';
  el.style.justifyContent = 'center';

  // Add prefix
  if (prefix) {
    const prefixSpan = document.createElement('span');
    prefixSpan.textContent = prefix;
    prefixSpan.className = 'slot-counter__digit';
    prefixSpan.style.animationDelay = '0s';
    el.appendChild(prefixSpan);
  }

  // Add each digit with staggered animation
  [...targetStr].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'slot-counter__digit';
    span.textContent = char;
    span.style.animationDelay = (0.15 + i * 0.12) + 's';
    el.appendChild(span);
  });

  // Add suffix
  if (suffix) {
    const suffixSpan = document.createElement('span');
    suffixSpan.textContent = suffix;
    suffixSpan.className = 'slot-counter__digit';
    suffixSpan.style.animationDelay = (0.15 + targetStr.length * 0.12) + 's';
    el.appendChild(suffixSpan);
  }
}

/* --- 6. Image Reveal Wipe --- */
function initImageRevealWipe() {
  const wipes = document.querySelectorAll('.reveal-wipe');
  if (!wipes.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  wipes.forEach(el => observer.observe(el));
}
