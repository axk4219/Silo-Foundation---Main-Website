/* ============================================
   Custom Ribbon Scrollbar
   Awareness ribbon as the scroll indicator
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Don't show on mobile
  if (window.innerWidth < 768) return;

  // Create the ribbon scrollbar
  const scrollbar = document.createElement('div');
  scrollbar.className = 'ribbon-scrollbar';
  scrollbar.innerHTML = `
    <div class="ribbon-scrollbar__track"></div>
    <div class="ribbon-scrollbar__thumb">
      <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ribbonPinkL" x1="0%" y1="0%" x2="100%" y2="20%">
            <stop offset="0%" stop-color="#f7a5c8"/>
            <stop offset="30%" stop-color="#f48db5"/>
            <stop offset="60%" stop-color="#e96fa0"/>
            <stop offset="100%" stop-color="#db5a8c"/>
          </linearGradient>
          <linearGradient id="ribbonPinkR" x1="100%" y1="0%" x2="0%" y2="20%">
            <stop offset="0%" stop-color="#f7a5c8"/>
            <stop offset="30%" stop-color="#f48db5"/>
            <stop offset="60%" stop-color="#e96fa0"/>
            <stop offset="100%" stop-color="#db5a8c"/>
          </linearGradient>
          <linearGradient id="ribbonPinkDark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#d64d81"/>
            <stop offset="50%" stop-color="#c9437a"/>
            <stop offset="100%" stop-color="#b83969"/>
          </linearGradient>
        </defs>

        <!-- ====== LEFT TAIL ====== -->
        <path d="
          M 22 290
          C 24 255, 38 225, 52 190
          C 62 165, 70 150, 73 135
          L 95 135
          C 92 150, 84 165, 74 190
          C 60 225, 48 255, 48 290
          Z"
          fill="url(#ribbonPinkDark)" stroke="#8a2650" stroke-width="2" stroke-linejoin="round"/>
        <path d="
          M 30 282
          C 32 252, 43 228, 56 195
          C 64 172, 72 155, 76 140"
          fill="none" stroke="white" stroke-width="5" opacity="0.15" stroke-linecap="round"/>

        <!-- ====== RIGHT TAIL ====== -->
        <path d="
          M 178 290
          C 176 255, 162 225, 148 190
          C 138 165, 130 150, 127 135
          L 105 135
          C 108 150, 116 165, 126 190
          C 140 225, 152 255, 152 290
          Z"
          fill="url(#ribbonPinkDark)" stroke="#8a2650" stroke-width="2" stroke-linejoin="round"/>
        <path d="
          M 170 282
          C 168 252, 157 228, 144 195
          C 136 172, 128 155, 124 140"
          fill="none" stroke="white" stroke-width="5" opacity="0.15" stroke-linecap="round"/>

        <!-- ====== LEFT LOOP ====== -->
        <path d="
          M 78 132
          C 52 105, 10 68, 2 38
          C -5 12, 8 -2, 38 -2
          C 62 -2, 82 14, 95 35
          C 104 50, 108 68, 110 82
          L 92 90
          C 90 76, 86 60, 78 48
          C 68 30, 54 20, 40 20
          C 24 20, 16 30, 22 50
          C 30 75, 62 102, 82 122
          Z"
          fill="url(#ribbonPinkL)" stroke="#8a2650" stroke-width="2" stroke-linejoin="round"/>
        <path d="
          M 72 124
          C 50 100, 18 68, 10 42
          C 5 24, 16 8, 36 6"
          fill="none" stroke="white" stroke-width="6" opacity="0.2" stroke-linecap="round"/>

        <!-- ====== RIGHT LOOP ====== -->
        <path d="
          M 122 132
          C 148 105, 190 68, 198 38
          C 205 12, 192 -2, 162 -2
          C 138 -2, 118 14, 105 35
          C 96 50, 92 68, 90 82
          L 108 90
          C 110 76, 114 60, 122 48
          C 132 30, 146 20, 160 20
          C 176 20, 184 30, 178 50
          C 170 75, 138 102, 118 122
          Z"
          fill="url(#ribbonPinkR)" stroke="#8a2650" stroke-width="2" stroke-linejoin="round"/>
        <path d="
          M 128 124
          C 150 100, 182 68, 190 42
          C 195 24, 184 8, 164 6"
          fill="none" stroke="white" stroke-width="6" opacity="0.2" stroke-linecap="round"/>

        <!-- ====== CROSSOVER / KNOT ====== -->
        <path d="
          M 70 115
          C 78 128, 86 138, 100 145
          C 114 138, 122 128, 130 115
          L 125 105
          C 118 116, 110 126, 100 132
          C 90 126, 82 116, 75 105
          Z"
          fill="url(#ribbonPinkDark)" stroke="#8a2650" stroke-width="1.5" opacity="0.9"/>
        <path d="M 85 122 C 92 132, 100 136, 108 132 C 116 126, 120 118, 124 112"
          fill="none" stroke="white" stroke-width="4" opacity="0.15" stroke-linecap="round"/>

        <!-- ====== HEARTS ====== -->
        <g transform="translate(42,38) rotate(-15) scale(1.2)" opacity="0.35">
          <path d="M0,-5 C0,-8 4,-10 6,-7 C8,-4 0,4 0,4 C0,4 -8,-4 -6,-7 C-4,-10 0,-8 0,-5Z" fill="#d64d81"/>
        </g>
        <g transform="translate(155,40) rotate(15) scale(1.2)" opacity="0.35">
          <path d="M0,-5 C0,-8 4,-10 6,-7 C8,-4 0,4 0,4 C0,4 -8,-4 -6,-7 C-4,-10 0,-8 0,-5Z" fill="#d64d81"/>
        </g>
        <g transform="translate(28,58) rotate(-20) scale(0.8)" opacity="0.25">
          <path d="M0,-5 C0,-8 4,-10 6,-7 C8,-4 0,4 0,4 C0,4 -8,-4 -6,-7 C-4,-10 0,-8 0,-5Z" fill="#c43a6e"/>
        </g>
        <g transform="translate(170,60) rotate(20) scale(0.8)" opacity="0.25">
          <path d="M0,-5 C0,-8 4,-10 6,-7 C8,-4 0,4 0,4 C0,4 -8,-4 -6,-7 C-4,-10 0,-8 0,-5Z" fill="#c43a6e"/>
        </g>
        <g transform="translate(50,210) rotate(-8) scale(1.0)" opacity="0.3">
          <path d="M0,-5 C0,-8 4,-10 6,-7 C8,-4 0,4 0,4 C0,4 -8,-4 -6,-7 C-4,-10 0,-8 0,-5Z" fill="#d64d81"/>
        </g>
        <g transform="translate(148,210) rotate(8) scale(1.0)" opacity="0.3">
          <path d="M0,-5 C0,-8 4,-10 6,-7 C8,-4 0,4 0,4 C0,4 -8,-4 -6,-7 C-4,-10 0,-8 0,-5Z" fill="#d64d81"/>
        </g>
      </svg>
    </div>
  `;

  document.body.appendChild(scrollbar);

  const thumb = scrollbar.querySelector('.ribbon-scrollbar__thumb');
  const track = scrollbar.querySelector('.ribbon-scrollbar__track');
  let isDragging = false;
  let showTimeout;

  // Update thumb position on scroll
  function updateThumbPosition() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const progress = scrollTop / docHeight;
    const trackHeight = track.offsetHeight;
    const thumbHeight = 105;
    const maxTop = trackHeight - thumbHeight;
    const top = progress * maxTop;

    thumb.style.top = top + 'px';
  }

  // Show/hide based on scroll
  function showScrollbar() {
    scrollbar.classList.add('visible');
    clearTimeout(showTimeout);
    showTimeout = setTimeout(() => {
      if (!isDragging) {
        scrollbar.classList.remove('visible');
      }
    }, 2000);
  }

  window.addEventListener('scroll', () => {
    updateThumbPosition();
    showScrollbar();
  }, { passive: true });

  // Show on hover
  scrollbar.addEventListener('mouseenter', () => {
    scrollbar.classList.add('visible');
    clearTimeout(showTimeout);
  });

  scrollbar.addEventListener('mouseleave', () => {
    if (!isDragging) {
      showTimeout = setTimeout(() => {
        scrollbar.classList.remove('visible');
      }, 1000);
    }
  });

  // Draggable thumb
  thumb.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const trackRect = track.getBoundingClientRect();
    const thumbHeight = 105;
    const relativeY = e.clientY - trackRect.top;
    const maxY = trackRect.height - thumbHeight;
    const clampedY = Math.max(0, Math.min(relativeY, maxY));
    const progress = clampedY / maxY;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: progress * docHeight });
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      document.body.style.userSelect = '';
      showTimeout = setTimeout(() => {
        scrollbar.classList.remove('visible');
      }, 2000);
    }
  });

  // Click on track to jump
  track.addEventListener('click', (e) => {
    const trackRect = track.getBoundingClientRect();
    const thumbHeight = 105;
    const relativeY = e.clientY - trackRect.top;
    const maxY = trackRect.height - thumbHeight;
    const progress = Math.max(0, Math.min(relativeY / maxY, 1));

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: progress * docHeight, behavior: 'smooth' });
  });

  // Initial position
  updateThumbPosition();

  // Show briefly on load
  setTimeout(() => {
    showScrollbar();
  }, 1500);
});
