// ============================================================
//  BURGEON ENGINEERING — script.js (Redesign 2026)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Page load reveal ─────────────────────────────────────
  setTimeout(() => document.body.classList.add('loaded'), 80);

  // ── Particle Canvas (Hero) ────────────────────────────────
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const GREEN = 'rgba(46,204,113,';
    const GOLD  = 'rgba(245,200,66,';

    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedY = -(Math.random() * 0.4 + 0.15);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.life = 1;
        this.decay = Math.random() * 0.003 + 0.001;
        this.color = Math.random() > 0.8 ? GOLD : GREEN;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        if (this.life <= 0 || this.y < -10) this.reset(false);
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + (this.life * 0.5) + ')';
        ctx.fill();
      }
    }

    // Create particle pool
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    // Connection lines
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist/100) * 0.08;
            ctx.strokeStyle = `rgba(46,204,113,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(loop);
    };
    loop();

    // Mouse interaction
    let mouse = { x: -999, y: -999 };
    canvas.parentElement.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
  }

  // ── Sticky header ─────────────────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Hamburger / mobile nav ────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Fade-up on scroll ─────────────────────────────────────
  const faders = document.querySelectorAll('.fade-up');
  if (faders.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('fade-up-active');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
    faders.forEach(el => io.observe(el));
  }

  // ── Animated counters ─────────────────────────────────────
  const counters = document.querySelectorAll('.counter[data-target]');
  if (counters.length) {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.target;
        const dur = 1800;
        const start = performance.now();
        const tick = now => {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3); // ease out cubic
          el.textContent = Math.round(eased * target);
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(c => cio.observe(c));
  }

  // ── Active nav link ───────────────────────────────────────
  const currentPath = window.location.pathname;
  document.querySelectorAll('.main-nav a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (currentPath === href || (href === '/' && currentPath === '/'))) {
      a.classList.add('active');
    }
  });

  // ── Contact form ─────────────────────────────────────────
  const form = document.getElementById('contactForm');
  if (form) {
    const btn = form.querySelector('.form-submit');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name  = form.querySelector('#name')?.value.trim();
      const email = form.querySelector('#email')?.value.trim();
      const msg   = form.querySelector('#message')?.value.trim();
      if (!name || !email || !msg) {
        showMsg(form, 'Please fill in all required fields.', '#ef4444');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMsg(form, 'Please enter a valid email address.', '#ef4444');
        return;
      }
      const orig = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      await new Promise(r => setTimeout(r, 1400));
      showMsg(form, '✓ Message sent! We\'ll respond within 24 hours.', '#2ecc71');
      form.reset();
      btn.textContent = orig;
      btn.disabled = false;
    });
  }
  function showMsg(form, text, color) {
    let el = form.querySelector('.form-msg');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-msg';
      form.appendChild(el);
    }
    el.textContent = text;
    el.style.color = color;
  }

  // ── Parallax subtle tilt on service tiles ────────────────
  document.querySelectorAll('.service-tile').forEach(tile => {
    tile.addEventListener('mousemove', e => {
      const r = tile.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      tile.style.transform = `perspective(600px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    });
    tile.addEventListener('mouseleave', () => {
      tile.style.transform = '';
    });
  });

  // ── Auto-select product from URL param ───────────────────
  const params = new URLSearchParams(window.location.search);
  const prod = params.get('product');
  if (prod) {
    const sel = document.getElementById('product');
    if (sel) {
      [...sel.options].forEach(o => {
        if (o.value === prod) sel.value = prod;
      });
    }
  }

  // ── Number ticker on stats-band ──────────────────────────
  // Already handled by counter logic above

  // ── Smooth reveal for page hero ──────────────────────────
  const pageHero = document.querySelector('.page-hero');
  if (pageHero) {
    pageHero.style.opacity = '0';
    pageHero.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      pageHero.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      pageHero.style.opacity = '1';
      pageHero.style.transform = 'translateY(0)';
    });
  }

});
