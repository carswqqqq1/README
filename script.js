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

  /* ---- FAQ ACCORDION ---- */
  var faqButtons = document.querySelectorAll('.faq__question');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = this.closest('.faq-item');
      if (!item) return;
      var willOpen = !item.classList.contains('is-open');

      faqButtons.forEach(function (otherBtn) {
        var otherItem = otherBtn.closest('.faq-item');
        if (!otherItem) return;
        otherItem.classList.remove('is-open');
        otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('is-open');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
  if (faqButtons.length) {
    var firstFaqItem = faqButtons[0].closest('.faq-item');
    if (firstFaqItem) {
      firstFaqItem.classList.add('is-open');
      faqButtons[0].setAttribute('aria-expanded', 'true');
    }
  }

  /* ---- CONTACT FORM ---- */
  var form            = document.getElementById('contact-form');
  var success         = document.getElementById('form-success');
  var errorMessage    = document.getElementById('form-error');
  var ticketInput     = document.getElementById('ticket-id');
  var submittedAt     = document.getElementById('submitted-at');
  var pageUrl         = document.getElementById('page-url');
  var serviceInput    = document.getElementById('service');
  var messageInput    = document.getElementById('message');
  var utmSourceInput  = document.getElementById('utm-source');
  var utmMediumInput  = document.getElementById('utm-medium');
  var utmCampaignInput= document.getElementById('utm-campaign');
  var ticketReference = document.getElementById('ticket-reference');
  var progressBar     = document.querySelector('.ticket-progress__bar');
  var progressFill    = document.getElementById('ticket-progress-fill');
  var progressText    = document.getElementById('ticket-progress-text');

  function encodeFormData(data) {
    return Object.keys(data)
      .map(function (key) { return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]); })
      .join('&');
  }

  function createTicketId() {
    var stamp = Date.now().toString(36).toUpperCase();
    var rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return 'TG-' + stamp + '-' + rand;
  }

  function updateFormProgress() {
    if (!form || !progressFill || !progressText || !progressBar) return;
    var required = Array.from(form.querySelectorAll('[required]'));
    var filled = required.filter(function (field) { return field.value.trim() !== ''; }).length;
    var percent = required.length ? Math.round((filled / required.length) * 100) : 0;
    progressFill.style.width = percent + '%';
    progressText.textContent = percent + '% complete';
    progressBar.setAttribute('aria-valuenow', String(percent));
  }

  if (form) {
    var params = new URLSearchParams(window.location.search);
    if (utmSourceInput) utmSourceInput.value = params.get('utm_source') || '';
    if (utmMediumInput) utmMediumInput.value = params.get('utm_medium') || '';
    if (utmCampaignInput) utmCampaignInput.value = params.get('utm_campaign') || '';

    var fitButtons = document.querySelectorAll('[data-service-choice]');
    fitButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var choice = this.getAttribute('data-service-choice');
        if (serviceInput && choice) {
          serviceInput.value = choice;
          serviceInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (messageInput && choice && !messageInput.value.trim()) {
          messageInput.value = 'Interested in ' + choice + '. Please contact me about next steps.';
          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        var contactSection = document.getElementById('contact');
        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    /* Phone format */
    var phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '');
        if (v.length >= 10) v = '(' + v.slice(0,3) + ') ' + v.slice(3,6) + '-' + v.slice(6,10);
        this.value = v;
      });
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var ok = f.value.trim() !== '';
        f.style.borderColor = ok ? '' : '#c62828';
        if (!ok) valid = false;
      });
      if (!valid) {
        if (errorMessage) {
          errorMessage.textContent = 'Please complete all required fields before submitting your ticket.';
          errorMessage.style.display = 'block';
        }
        return;
      }

      if (errorMessage) {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
      }

      var ticketId = createTicketId();
      if (ticketInput) ticketInput.value = ticketId;
      if (submittedAt) submittedAt.value = new Date().toISOString();
      if (pageUrl) pageUrl.value = window.location.href;

      var btn = form.querySelector('[type="submit"]');
      var defaultBtnText = btn.textContent;
      btn.textContent = 'Submitting…';
      btn.disabled = true;

      var payload = {};
      new FormData(form).forEach(function (value, key) {
        payload[key] = String(value);
      });

      try {
        var response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodeFormData(payload)
        });

        if (!response.ok) throw new Error('Submission failed');

        form.style.display = 'none';
        if (success) success.style.display = 'block';
        if (ticketReference) ticketReference.textContent = ticketId;
      } catch (error) {
        if (errorMessage) {
          errorMessage.textContent = 'We could not submit your ticket right now. Please call us at (480) 922-9497.';
          errorMessage.style.display = 'block';
        }
        btn.disabled = false;
        btn.textContent = defaultBtnText;
      }
    });

    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('input', function () {
        this.style.borderColor = '';
        updateFormProgress();
      });
      f.addEventListener('change', updateFormProgress);
    });
    updateFormProgress();
  }

})();
