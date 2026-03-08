/* ============================================
   Pink Particle Canvas Effect
   With floating awareness ribbon shapes
   ============================================ */

function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 25 : 50;
  const ribbonCount = 0;

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  function createParticle() {
    return {
      type: 'dot',
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 16 + 10,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.15,
      opacity: Math.random() * 0.4 + 0.2,
      hue: Math.random() > 0.5 ? 340 : 330
    };
  }

  function createRibbon() {
    return {
      type: 'ribbon',
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 12 + 8,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -Math.random() * 0.5 - 0.1,
      opacity: Math.random() * 0.25 + 0.08,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      hue: 340
    };
  }

  function drawRibbonShape(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;

    const s = p.size;

    // Awareness ribbon loops
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(-s * 0.6, -s * 0.3, -s * 0.3, -s * 1.0, 0, -s * 0.2);
    ctx.bezierCurveTo(s * 0.3, -s * 1.0, s * 0.6, -s * 0.3, 0, s * 0.3);
    ctx.fillStyle = `hsla(${p.hue}, 70%, 57%, ${p.opacity * 0.6})`;
    ctx.fill();
    ctx.strokeStyle = `hsla(${p.hue}, 70%, 57%, ${p.opacity + 0.15})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tails
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.lineTo(-s * 0.25, s * 1.0);
    ctx.moveTo(0, s * 0.3);
    ctx.lineTo(s * 0.25, s * 1.0);
    ctx.stroke();

    ctx.restore();
  }

  function init() {
    resize();
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }
    for (let i = 0; i < ribbonCount; i++) {
      particles.push(createRibbon());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      if (p.type === 'ribbon') {
        drawRibbonShape(p);
        p.rotation += p.rotationSpeed;
      } else {
        // Draw a tiny heart
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = `hsla(${p.hue}, 70%, 57%, 1)`;
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.4);
        ctx.bezierCurveTo(-s, -s * 0.2, -s * 0.5, -s * 1.2, 0, -s * 0.4);
        ctx.bezierCurveTo(s * 0.5, -s * 1.2, s, -s * 0.2, 0, s * 0.4);
        ctx.fill();
        ctx.restore();
      }

      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y < -20) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -20 || p.x > canvas.width + 20) {
        p.x = Math.random() * canvas.width;
      }
    });

    animationId = requestAnimationFrame(draw);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  init();
  draw();

  window.addEventListener('resize', resize);

  return () => cancelAnimationFrame(animationId);
}

window.initParticles = initParticles;
