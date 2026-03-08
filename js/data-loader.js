/* ============================================
   Data Loader
   Fetches JSON data files and renders content
   into page containers. Falls back to existing
   hardcoded HTML if fetch fails.
   ============================================ */

const DataLoader = {
  cache: {},

  async fetch(file) {
    if (this.cache[file]) return this.cache[file];
    try {
      const res = await fetch(`data/${file}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.cache[file] = data;
      return data;
    } catch (e) {
      console.warn(`DataLoader: Could not load ${file}, using fallback.`, e);
      return null;
    }
  },

  formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  },

  formatMonth(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  },

  formatBadge(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  },

  // Re-observe new .reveal and .reveal-wipe elements so scroll animations work on dynamic content
  observeReveals(container) {
    const reveals = container.querySelectorAll('.reveal:not(.revealed), .reveal-wipe:not(.revealed)');
    if (!reveals.length) return;

    // Use requestAnimationFrame to ensure DOM is painted before observing
    requestAnimationFrame(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '50px 0px 50px 0px' });
      reveals.forEach(el => observer.observe(el));
    });
  },

  // ---- HOME PAGE: Featured Event Cards (Carousel) ----
  async loadFeaturedEvents(containerId) {
    const data = await this.fetch('events.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    data.sort((a, b) => new Date(a.date + 'T00:00:00') - new Date(b.date + 'T00:00:00'));

    container.innerHTML = data.map((ev, i) => `
      <div class="carousel__slide">
        <div class="card reveal reveal--scale reveal--delay-${(i % 3) + 1}">
          <div class="card__image-wrapper reveal-wipe">
            <img src="${ev.image}" alt="${ev.title}" class="card__image">
            <span class="card__badge">${this.formatBadge(ev.date)}</span>
          </div>
          <div class="card__body">
            <h3 class="card__title">${ev.title}</h3>
            <p class="card__text">${ev.description}</p>
            <a href="events.html" class="btn btn--primary btn--small" style="margin-top: var(--space-sm);">Learn More</a>
          </div>
        </div>
      </div>
    `).join('');
    this.observeReveals(container);
    this.initCarousel(containerId);
  },

  // ---- Carousel Controller ----
  initCarousel(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const carousel = track.closest('.carousel');
    if (!carousel) return;

    const leftBtn = carousel.querySelector('.carousel__arrow--left');
    const rightBtn = carousel.querySelector('.carousel__arrow--right');
    const dotsContainer = carousel.querySelector('.carousel__dots');
    const slides = track.querySelectorAll('.carousel__slide');
    const totalSlides = slides.length;

    let currentPage = 0;

    const getPerPage = () => {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    };

    const getTotalPages = () => Math.max(1, Math.ceil(totalSlides / getPerPage()));

    const renderDots = () => {
      const pages = getTotalPages();
      if (pages <= 1) { dotsContainer.innerHTML = ''; return; }
      dotsContainer.innerHTML = Array.from({ length: pages }, (_, i) =>
        `<button class="carousel__dot ${i === currentPage ? 'active' : ''}" data-page="${i}" aria-label="Go to page ${i + 1}"></button>`
      ).join('');
      dotsContainer.querySelectorAll('.carousel__dot').forEach(dot => {
        dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.page)); });
      });
    };

    const updateArrows = () => {
      const pages = getTotalPages();
      leftBtn.style.display = pages <= 1 ? 'none' : '';
      rightBtn.style.display = pages <= 1 ? 'none' : '';
      leftBtn.disabled = currentPage === 0;
      rightBtn.disabled = currentPage >= pages - 1;
    };

    const goTo = (page) => {
      const perPage = getPerPage();
      const pages = getTotalPages();
      currentPage = Math.max(0, Math.min(page, pages - 1));
      const slideWidth = slides[0].offsetWidth;
      const gap = parseInt(getComputedStyle(track).gap) || 0;
      const offset = currentPage * perPage * (slideWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      renderDots();
      updateArrows();
    };

    leftBtn.addEventListener('click', () => goTo(currentPage - 1));
    rightBtn.addEventListener('click', () => goTo(currentPage + 1));

    // Swipe support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(currentPage + (diff > 0 ? 1 : -1));
    });

    window.addEventListener('resize', () => goTo(currentPage));
    goTo(0);
  },

  // ---- EVENTS PAGE: Featured Event (first featured event) ----
  async loadFeaturedEvent(containerId) {
    const data = await this.fetch('events.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    data.sort((a, b) => new Date(a.date + 'T00:00:00') - new Date(b.date + 'T00:00:00'));
    const featured = data.find(e => e.featured) || data[0];
    if (!featured) return;

    container.innerHTML = `
      <div class="featured-event reveal reveal--up">
        <img src="${featured.image}" alt="${featured.title}" class="featured-event__image">
        <div class="featured-event__body">
          <h2>${featured.title}</h2>
          <div class="featured-event__meta">
            <div class="featured-event__meta-item">
              <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
              ${this.formatDate(featured.date)}${featured.time ? ' | ' + featured.time : ''}
            </div>
            ${featured.location ? `
            <div class="featured-event__meta-item">
              <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              ${featured.location}
            </div>` : ''}
          </div>
          <p style="color: var(--white-muted); font-size: 1.1rem; margin-bottom: var(--space-md);">
            ${featured.description}
          </p>
          <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap;">
            ${featured.link ? `<a href="${featured.link}" target="_blank" class="btn btn--primary">Get Tickets</a>` : ''}
            <a href="donate.html" class="btn btn--outline">Donate</a>
          </div>
        </div>
      </div>
    `;
    this.observeReveals(container);
  },

  // ---- EVENTS PAGE: Timeline ----
  async loadTimeline(containerId) {
    const data = await this.fetch('events.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    data.sort((a, b) => new Date(a.date + 'T00:00:00') - new Date(b.date + 'T00:00:00'));

    container.innerHTML = data.map((ev, i) => `
      <div class="timeline__item reveal reveal--${i % 2 === 0 ? 'left' : 'right'}">
        <div class="timeline__dot animate-dot-pulse"></div>
        <div class="timeline__month">${this.formatMonth(ev.date)}</div>
        <h3 style="margin-bottom: var(--space-xs);">${ev.title}</h3>
        <p class="card__text">${ev.description}</p>
        ${ev.link
          ? `<a href="${ev.link}" target="_blank" class="btn btn--small btn--primary" style="margin-top: var(--space-sm);">Get Tickets</a>`
          : `<a href="contact.html" class="btn btn--small btn--outline" style="margin-top: var(--space-sm);">Get Involved</a>`
        }
      </div>
    `).join('');
    this.observeReveals(container);
  },

  // ---- STORE PAGE: Product Cards ----
  async loadMerch(containerId) {
    const data = await this.fetch('merch.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data.map((item, i) => `
      <div class="product-card reveal reveal--scale reveal--delay-${(i % 3) + 1}">
        <div class="product-card__image-wrap">
          <img src="${item.image}" alt="${item.name}" class="product-card__image">
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${item.name}</h3>
          <p class="product-card__desc">${item.description}</p>
          <a href="${item.link}" class="btn btn--primary btn--small">Order Now</a>
        </div>
      </div>
    `).join('');
    this.observeReveals(container);
  },

  // ---- ABOUT PAGE: Team Cards ----
  async loadTeam(containerId) {
    const data = await this.fetch('team.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data.map((member, i) => `
      <div class="team-card reveal reveal--scale reveal--delay-${(i % 3) + 1}">
        <div class="team-card__photo">
          ${member.photo
            ? `<img src="${member.photo}" alt="${member.name}" style="width:100%;height:100%;object-fit:cover;">`
            : `<svg width="60" height="60" viewBox="0 0 24 24" fill="var(--pink)"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
          }
        </div>
        <h3 class="team-card__name">${member.name}</h3>
        <p class="team-card__role">${member.role}</p>
      </div>
    `).join('');
    this.observeReveals(container);
  },

  // ---- PAST EVENTS PAGE: Photo Gallery Grid ----
  async loadGalleryPhotos(containerId) {
    const data = await this.fetch('gallery.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    const allImages = [];
    data.forEach(event => {
      if (event.images) {
        event.images.forEach(img => {
          allImages.push({ src: img, title: event.title });
        });
      }
    });

    container.innerHTML = allImages.map((img, i) => `
      <div class="gallery-item reveal reveal--scale reveal--delay-${(i % 3) + 1}">
        <img src="${img.src}" alt="${img.title}" loading="lazy">
        <div class="gallery-item__overlay">
          <span class="gallery-item__title">${img.title}</span>
        </div>
      </div>
    `).join('');
    this.observeReveals(container);
  },

  // ---- HOME PAGE: Sponsors Grid ----
  async loadSponsors(containerId) {
    const data = await this.fetch('sponsors.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data.map((sponsor, i) => `
      <div class="reveal reveal--scale reveal--delay-${(i % 4) + 1}" style="position: relative; border-radius: var(--radius-md); overflow: hidden; aspect-ratio: 3/2; background: var(--dark-card); border: 1px solid var(--white-subtle); transition: border-color 0.3s, transform 0.3s;">
        ${sponsor.url ? `<a href="${sponsor.url}" target="_blank" rel="noopener noreferrer" style="display: block; width: 100%; height: 100%; text-decoration: none; color: inherit;">` : ''}
        ${sponsor.image
          ? `<img src="${sponsor.image}" alt="${sponsor.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;">`
          : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: var(--space-sm);"><span style="font-size: 1.1rem; font-weight: 600; color: var(--white-muted);">${sponsor.name}</span></div>`}
        ${sponsor.image ? `<div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 0.6rem; background: linear-gradient(transparent, rgba(0,0,0,0.8)); text-align: center;"><span style="font-size: 0.9rem; font-weight: 600; color: #fff;">${sponsor.name}</span></div>` : ''}
        ${sponsor.url ? '</a>' : ''}
      </div>
    `).join('');
    this.observeReveals(container);
  },

  // ---- Hero Image from hero.json ----
  async loadHero(pageKey, bgSelector, extras) {
    const data = await this.fetch('hero.json');
    if (!data || !data[pageKey]) return;
    const hero = data[pageKey];
    const bgEl = document.querySelector(bgSelector);
    if (bgEl && hero.image) {
      bgEl.style.backgroundImage = `url('${hero.image}')`;
    }
    // Handle extra image mappings (e.g. storyImage -> #about-story-img)
    if (extras) {
      for (const [key, selector] of Object.entries(extras)) {
        const el = document.querySelector(selector);
        if (el && hero[key]) el.src = hero[key];
      }
    }
  },

  // ---- ABOUT PAGE: Educational Resources ----
  async loadResources(containerId) {
    const data = await this.fetch('resources.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data.map((item, i) => `
      <${item.url ? `a href="${item.url}" target="_blank" rel="noopener noreferrer"` : 'div'} class="card reveal reveal--scale reveal--delay-${(i % 4) + 1}" style="padding: var(--space-md); text-align: center; text-decoration: none; color: inherit; display: block; transition: transform 0.3s, box-shadow 0.3s;">
        <h3 class="card__title" style="color: var(--pink);">${item.title}</h3>
        <p class="card__text" style="margin: var(--space-xs) auto;">${item.description}</p>
        ${item.url ? '<span style="display: inline-block; margin-top: var(--space-xs); color: var(--pink); font-weight: 600; font-size: 0.9rem;">Learn More &rarr;</span>' : ''}
      </${item.url ? 'a' : 'div'}>
    `).join('');
    this.observeReveals(container);
  },

  // ---- PAST EVENTS PAGE: Event Highlights ----
  async loadHighlights(containerId) {
    const data = await this.fetch('gallery.json');
    if (!data) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data.map((event, i) => {
      const d = new Date(event.date + 'T00:00:00');
      const year = d.getFullYear();
      return `
        <div class="highlight-card reveal reveal--${i % 2 === 0 ? 'left' : 'right'} reveal--delay-${(i % 4) + 1}">
          <div class="highlight-card__year">${year}</div>
          <h3 style="margin-bottom: var(--space-xs);">${event.title}</h3>
          <p class="card__text">${event.description}</p>
        </div>
      `;
    }).join('');
    this.observeReveals(container);
  }
};

window.DataLoader = DataLoader;
