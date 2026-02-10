/* ===========================
   DFZ LABS — Script
   High-end interactive effects
   =========================== */

(function () {
  'use strict';

  // ─── Utility: lerp ────────────────────────────────────
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // ─── Global mouse state ───────────────────────────────
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // ═══════════════════════════════════════════════════════
  //  1. PAGE LOADER
  // ═══════════════════════════════════════════════════════

  var loader = document.getElementById('loader');
  var loaderProgress = loader.querySelector('.loader-progress');
  var loadProgress = 0;

  function animateLoader() {
    loadProgress += (100 - loadProgress) * 0.08;
    loaderProgress.style.width = loadProgress + '%';

    if (loadProgress < 99) {
      requestAnimationFrame(animateLoader);
    }
  }
  animateLoader();

  window.addEventListener('load', function () {
    loadProgress = 100;
    loaderProgress.style.width = '100%';

    setTimeout(function () {
      loader.classList.add('done');
      document.getElementById('nav').classList.add('visible');
      initSplitText();
    }, 400);
  });

  // ═══════════════════════════════════════════════════════
  //  2. CUSTOM CURSOR
  // ═══════════════════════════════════════════════════════

  if (!isTouchDevice) {
    var cursorEl = document.getElementById('cursor');
    var cursorDot = cursorEl.querySelector('.cursor-dot');
    var cursorRing = cursorEl.querySelector('.cursor-ring');

    var cx = { dot: mouse.x, ring: mouse.x };
    var cy = { dot: mouse.y, ring: mouse.y };

    function updateCursor() {
      cx.dot = lerp(cx.dot, mouse.x, 0.35);
      cy.dot = lerp(cy.dot, mouse.y, 0.35);
      cx.ring = lerp(cx.ring, mouse.x, 0.12);
      cy.ring = lerp(cy.ring, mouse.y, 0.12);

      cursorDot.style.left = cx.dot + 'px';
      cursorDot.style.top = cy.dot + 'px';
      cursorRing.style.left = cx.ring + 'px';
      cursorRing.style.top = cy.ring + 'px';

      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover state on interactive elements
    var hoverTargets = 'a, button, input, textarea, [data-magnetic], [data-tilt]';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) {
        cursorEl.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) {
        cursorEl.classList.remove('hovering');
      }
    });

    // Click feedback
    document.addEventListener('mousedown', function () {
      cursorEl.classList.add('clicking');
    });
    document.addEventListener('mouseup', function () {
      cursorEl.classList.remove('clicking');
    });
  }

  // ═══════════════════════════════════════════════════════
  //  3. GRADIENT ORB (follows mouse)
  // ═══════════════════════════════════════════════════════

  if (!isTouchDevice) {
    var orb = document.getElementById('gradient-orb');
    var orbX = mouse.x, orbY = mouse.y;

    function updateOrb() {
      orbX = lerp(orbX, mouse.x, 0.03);
      orbY = lerp(orbY, mouse.y, 0.03);
      orb.style.left = orbX + 'px';
      orb.style.top = orbY + 'px';
      requestAnimationFrame(updateOrb);
    }
    updateOrb();
  }

  // ═══════════════════════════════════════════════════════
  //  4. SPLIT TEXT ANIMATION (hero)
  // ═══════════════════════════════════════════════════════

  function initSplitText() {
    var splitEls = document.querySelectorAll('[data-split]');
    var baseDelay = 0;

    splitEls.forEach(function (el) {
      var text = el.textContent;
      var isHeroLine = el.classList.contains('hero-line');
      el.textContent = '';
      el.setAttribute('aria-label', text);

      for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.className = 'char';
        span.textContent = text[i] === ' ' ? '\u00A0' : text[i];
        var delay = baseDelay + (i * 0.04);
        span.style.animationDelay = delay + 's';
        el.appendChild(span);
      }

      baseDelay += text.length * 0.04 + 0.1;
    });

    // Word-by-word reveal for about heading
    var revealTexts = document.querySelectorAll('.reveal-text');
    revealTexts.forEach(function (el) {
      var text = el.textContent;
      el.textContent = '';
      el.setAttribute('aria-label', text);

      var words = text.split(' ');
      words.forEach(function (word, i) {
        var wordWrap = document.createElement('span');
        wordWrap.className = 'word';
        var inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.textContent = word;
        inner.style.transitionDelay = (i * 0.05) + 's';
        wordWrap.appendChild(inner);
        el.appendChild(wordWrap);
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  //  5. PARTICLE CANVAS
  // ═══════════════════════════════════════════════════════

  var canvas = document.getElementById('hero-canvas');
  var ctx = canvas.getContext('2d');
  var particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    var count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 150);
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  var time = 0;

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    time += 0.01;

    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Mouse repulsion
      var dx = p.x - mouse.x;
      var dy = p.y - (mouse.y + window.scrollY);
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180 && dist > 0) {
        var force = (180 - dist) / 180;
        p.vx += (dx / dist) * force * 0.03;
        p.vy += (dy / dist) * force * 0.03;
      }

      p.vx *= 0.99;
      p.vy *= 0.99;

      // Pulsing opacity
      var pulse = Math.sin(time * 2 + p.pulsePhase) * 0.15;
      var alpha = Math.max(0, Math.min(1, p.opacity + pulse));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
      ctx.fill();
    });

    // Connections with gradient lines
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          var alpha = 0.07 * (1 - dist / 120);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(255, 255, 255, ' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  createParticles();
  drawParticles();

  window.addEventListener('resize', function () {
    resizeCanvas();
    createParticles();
  });

  // ═══════════════════════════════════════════════════════
  //  6. MAGNETIC HOVER EFFECT
  // ═══════════════════════════════════════════════════════

  if (!isTouchDevice) {
    var magneticEls = document.querySelectorAll('[data-magnetic]');

    magneticEls.forEach(function (el) {
      var strength = 0.3;

      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;

        el.style.transform = 'translate(' + (relX * strength) + 'px, ' + (relY * strength) + 'px)';
      });

      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(function () { el.style.transition = ''; }, 500);
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  //  7. 3D TILT EFFECT ON CARDS
  // ═══════════════════════════════════════════════════════

  if (!isTouchDevice) {
    var tiltCards = document.querySelectorAll('[data-tilt]');

    tiltCards.forEach(function (card) {
      var glow = card.querySelector('.card-glow');

      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = (y - centerY) / centerY * -8;
        var rotateY = (x - centerX) / centerX * 8;

        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(1.02, 1.02, 1.02)';

        if (glow) {
          glow.style.left = x + 'px';
          glow.style.top = y + 'px';
        }
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(function () {
          card.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        }, 600);
      });
    });
  }

  // ═══════════════════════════════════════════════════════
  //  8. PARALLAX ON SCROLL
  // ═══════════════════════════════════════════════════════

  var heroContent = document.querySelector('.hero-content');

  function updateParallax() {
    var scrollY = window.scrollY;
    var vh = window.innerHeight;

    // Hero content moves up + fades as you scroll
    if (scrollY < vh) {
      var progress = scrollY / vh;
      heroContent.style.transform = 'translateY(' + (scrollY * 0.4) + 'px)';
      heroContent.style.opacity = 1 - progress * 1.5;
    }
  }

  // ═══════════════════════════════════════════════════════
  //  9. NAVBAR SCROLL EFFECT
  // ═══════════════════════════════════════════════════════

  var nav = document.getElementById('nav');

  function updateNav() {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // Combined scroll handler
  window.addEventListener('scroll', function () {
    updateParallax();
    updateNav();
  }, { passive: true });

  // ═══════════════════════════════════════════════════════
  //  10. INTERSECTION OBSERVER (fade-in + stagger)
  // ═══════════════════════════════════════════════════════

  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ═══════════════════════════════════════════════════════
  //  11. SMOOTH SCROLL (custom momentum)
  // ═══════════════════════════════════════════════════════

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        var start = window.scrollY;
        var end = target.getBoundingClientRect().top + start - 80;
        var duration = 1200;
        var startTime = null;

        function easeOutExpo(t) {
          return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = easeOutExpo(progress);
          window.scrollTo(0, start + (end - start) * eased);
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }

        requestAnimationFrame(step);
      }
    });
  });

  // ═══════════════════════════════════════════════════════
  //  12. CONTACT FORM
  // ═══════════════════════════════════════════════════════

  var form = document.getElementById('contact-form');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var message = document.getElementById('message').value.trim();

    if (!name || !email || !message) return;

    var btn = form.querySelector('.btn-submit');
    btn.innerHTML = '<span>Sending...</span>';
    btn.disabled = true;

    // Simulate send delay for polish
    setTimeout(function () {
      var formParent = form.parentElement;
      form.remove();

      var success = document.createElement('div');
      success.className = 'form-success fade-in';
      success.innerHTML =
        '<h3>Message Sent</h3>' +
        '<p>Thanks, ' + escapeHtml(name) + '. We\'ll be in touch soon.</p>';
      formParent.appendChild(success);

      // Trigger animation
      requestAnimationFrame(function () {
        success.classList.add('visible');
      });
    }, 800);
  });

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════════════════
  //  13. INPUT FOCUS ANIMATIONS
  // ═══════════════════════════════════════════════════════

  var formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

  formInputs.forEach(function (input) {
    input.addEventListener('focus', function () {
      this.parentElement.style.transform = 'translateX(4px)';
      this.parentElement.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    input.addEventListener('blur', function () {
      this.parentElement.style.transform = 'translateX(0)';
    });
  });

})();
