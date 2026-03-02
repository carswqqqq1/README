/* ============================================================
   Think Green Design | Build Landscape — v2 Script
   ============================================================ */
(function () {
  'use strict';

  /* ---- NAV SCROLL STATE ---- */
  var nav = document.getElementById('nav');
  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ---- MOBILE MENU ---- */
  var burger  = document.getElementById('nav-burger');
  var overlay = document.getElementById('nav-overlay');
  var close   = document.getElementById('nav-close');

  function openMenu() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger) burger.addEventListener('click', openMenu);
  if (close)  close.addEventListener('click', closeMenu);
  overlay.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---- SMOOTH SCROLL ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var offset = nav ? nav.offsetHeight + 8 : 80;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
  });

  /* ---- HERO CAROUSEL ---- */
  var slides = document.querySelectorAll('.hero__slide');
  var dots   = document.querySelectorAll('.hero__dot');
  var current = 0;
  var heroTimer;

  function goToSlide(n) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function nextSlide() { goToSlide(current + 1); }

  function startCarousel() {
    clearInterval(heroTimer);
    heroTimer = setInterval(nextSlide, 5500);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      goToSlide(parseInt(this.dataset.slide, 10));
      startCarousel();
    });
  });

  if (slides.length > 1) startCarousel();

  /* ---- SCROLL REVEAL ---- */
  if ('IntersectionObserver' in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6 * 0.08, 0.4) + 's';
      revealObs.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---- STAT COUNTERS ---- */
  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat__number').forEach(animateCounter);
          statsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    var statsSection = document.getElementById('stats');
    if (statsSection) statsObs.observe(statsSection);
  }

  /* ---- TESTIMONIAL CAROUSEL ---- */
  var testimonials = document.querySelectorAll('.testimonial');
  var tlDots       = document.querySelectorAll('.tl-dot');
  var tlPrev       = document.getElementById('tl-prev');
  var tlNext       = document.getElementById('tl-next');
  var tlCurrent    = 0;
  var tlTimer;

  function goToTl(n) {
    testimonials[tlCurrent].classList.remove('is-active');
    tlDots[tlCurrent].classList.remove('is-active');
    tlDots[tlCurrent].setAttribute('aria-selected', 'false');
    tlCurrent = (n + testimonials.length) % testimonials.length;
    testimonials[tlCurrent].classList.add('is-active');
    tlDots[tlCurrent].classList.add('is-active');
    tlDots[tlCurrent].setAttribute('aria-selected', 'true');
  }

  function startTl() {
    clearInterval(tlTimer);
    tlTimer = setInterval(function () { goToTl(tlCurrent + 1); }, 7000);
  }

  if (tlPrev) tlPrev.addEventListener('click', function () { goToTl(tlCurrent - 1); startTl(); });
  if (tlNext) tlNext.addEventListener('click', function () { goToTl(tlCurrent + 1); startTl(); });
  tlDots.forEach(function (dot) {
    dot.addEventListener('click', function () { goToTl(parseInt(this.dataset.tl, 10)); startTl(); });
  });
  if (testimonials.length > 1) startTl();

  /* ---- CONTACT FORM ---- */
  var form    = document.getElementById('contact-form');
  var success = document.getElementById('form-success');

  if (form) {
    /* Phone format */
    var phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '');
        if (v.length >= 10) v = '(' + v.slice(0,3) + ') ' + v.slice(3,6) + '-' + v.slice(6,10);
        this.value = v;
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var ok = f.value.trim() !== '';
        f.style.borderColor = ok ? '' : '#c62828';
        if (!ok) valid = false;
      });
      if (!valid) return;

      var btn = form.querySelector('[type="submit"]');
      btn.textContent = 'Sending…';
      btn.disabled = true;

      setTimeout(function () {
        form.style.display = 'none';
        if (success) success.style.display = 'block';
      }, 900);
    });

    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('input', function () { this.style.borderColor = ''; });
    });
  }

})();
