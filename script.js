/* ============================================================
   Think Green Design | Build Landscape — v2 Script
   ============================================================ */
(function () {
  'use strict';

  var SITE_PHONE_RAW = '4809229497';
  var SITE_PHONE_DISPLAY = '(480) 922-9497';

  function applySitePhone() {
    document.querySelectorAll('[data-site-phone-link]').forEach(function (el) {
      el.setAttribute('href', 'tel:' + SITE_PHONE_RAW);
    });
    document.querySelectorAll('[data-site-phone-display]').forEach(function (el) {
      el.textContent = SITE_PHONE_DISPLAY;
    });
  }
  applySitePhone();

  /* ---- NAV SCROLL STATE ---- */
  var nav = document.getElementById('nav');
  function updateNav() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ---- MOBILE MENU ---- */
  var burger  = document.getElementById('nav-burger');
  var overlay = document.getElementById('nav-overlay');
  var close   = document.getElementById('nav-close');
  var stickyBar = document.getElementById('sticky-bar');
  var contactSection = document.getElementById('contact');
  var isContactInView = false;

  function updateStickyBar() {
    if (!stickyBar) return;
    var isMobile = window.innerWidth <= 768;
    var passedHero = window.scrollY > Math.max(220, window.innerHeight * 0.35);
    var menuOpen = overlay && overlay.classList.contains('is-open');
    var shouldShow = isMobile && passedHero && !menuOpen && !isContactInView;
    stickyBar.classList.toggle('is-visible', shouldShow);
  }

  function openMenu() {
    if (!overlay || !burger) return;
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    updateStickyBar();
  }
  function closeMenu() {
    if (!overlay || !burger) return;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    updateStickyBar();
  }
  if (burger) burger.addEventListener('click', openMenu);
  if (close)  close.addEventListener('click', closeMenu);
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  if ('IntersectionObserver' in window && contactSection) {
    var contactObs = new IntersectionObserver(function (entries) {
      isContactInView = entries.some(function (entry) { return entry.isIntersecting; });
      updateStickyBar();
    }, { threshold: 0.2 });
    contactObs.observe(contactSection);
  }
  window.addEventListener('scroll', updateStickyBar, { passive: true });
  window.addEventListener('resize', updateStickyBar);
  updateStickyBar();

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
  window.addEventListener('load', function () {
    if (!window.location.hash) return;
    var hashTarget = document.querySelector(window.location.hash);
    if (!hashTarget) return;
    var offset = nav ? nav.offsetHeight + 8 : 80;
    window.scrollTo({ top: hashTarget.getBoundingClientRect().top + window.scrollY - offset, behavior: 'auto' });
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

  /* ---- BEFORE / AFTER SLIDER ---- */
  document.querySelectorAll('[data-before-after]').forEach(function (slider) {
    var range = slider.querySelector('[data-before-after-range]');
    var overlayPanel = slider.querySelector('[data-before-after-overlay]');
    var divider = slider.querySelector('[data-before-after-divider]');
    if (!range || !overlayPanel || !divider) return;

    function updateBeforeAfter() {
      var value = Number(range.value || 50);
      overlayPanel.style.width = value + '%';
      divider.style.left = value + '%';
    }

    range.addEventListener('input', updateBeforeAfter);
    range.addEventListener('change', updateBeforeAfter);
    updateBeforeAfter();
  });

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
  var submittedLocal  = document.getElementById('submitted-local');
  var ownerSummary    = document.getElementById('owner-summary');
  var ownerPriority   = document.getElementById('owner-priority');
  var ownerContact    = document.getElementById('owner-contact-card');
  var ownerProject    = document.getElementById('owner-project-snapshot');
  var ownerTracking   = document.getElementById('owner-tracking');
  var serviceInput    = document.getElementById('service');
  var fullNameInput   = document.getElementById('full_name');
  var firstNameInput  = document.getElementById('fname');
  var lastNameInput   = document.getElementById('lname');
  var emailVisibleInput = document.getElementById('email_visible');
  var emailInput      = document.getElementById('email');
  var phoneInput      = document.getElementById('phone');
  var cityInput       = document.getElementById('city');
  var addressInput    = document.getElementById('property_address');
  var budgetInput     = document.getElementById('budget');
  var timelineInput   = document.getElementById('timeline');
  var contactMethod   = document.getElementById('contact_method');
  var messageInput    = document.getElementById('message');
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

  function formatPhoenixDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Phoenix',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }).format(date);
  }

  function getPriority(budget, timeline) {
    if (timeline === 'ASAP' || timeline === 'Within 30 days' || budget === '$100,000+') return 'High Priority';
    if (budget === '$50,000 - $100,000' || timeline === '1-3 months') return 'Qualified Opportunity';
    return 'Standard Intake';
  }

  function valueOrFallback(input, fallback) {
    if (!input) return fallback;
    return input.value && input.value.trim() ? input.value.trim() : fallback;
  }

  function splitName(fullName) {
    var cleaned = String(fullName || '').trim().replace(/\s+/g, ' ');
    if (!cleaned) return { first: 'Not provided', last: '' };
    var parts = cleaned.split(' ');
    if (parts.length === 1) return { first: parts[0], last: '' };
    return {
      first: parts.shift(),
      last: parts.join(' ')
    };
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
    var utmSource = params.get('utm_source') || '';
    var utmMedium = params.get('utm_medium') || '';
    var utmCampaign = params.get('utm_campaign') || '';

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
      var submittedDate = new Date();
      var submittedLocalTime = formatPhoenixDateTime(submittedDate);
      var nameParts = splitName(valueOrFallback(fullNameInput, ''));
      if (firstNameInput) firstNameInput.value = nameParts.first;
      if (lastNameInput) lastNameInput.value = nameParts.last;
      if (emailInput) emailInput.value = valueOrFallback(emailVisibleInput, '');
      var fullName = (valueOrFallback(firstNameInput, '') + ' ' + valueOrFallback(lastNameInput, '')).trim();
      var service = valueOrFallback(serviceInput, 'Not selected');
      var budget = valueOrFallback(budgetInput, 'Not selected');
      var timeline = valueOrFallback(timelineInput, 'Not selected');
      var priority = getPriority(budget, timeline);
      var preferredContact = valueOrFallback(contactMethod, 'Not selected');
      var projectCity = valueOrFallback(cityInput, 'Not provided');
      var projectAddress = valueOrFallback(addressInput, 'Not provided');
      var vision = valueOrFallback(messageInput, 'No project details provided.');
      var email = valueOrFallback(emailInput, 'Not provided');
      var phone = valueOrFallback(phoneInput, 'Not provided');

      if (ticketInput) ticketInput.value = ticketId;
      if (submittedLocal) submittedLocal.value = submittedLocalTime;
      if (ownerPriority) ownerPriority.value = priority;
      if (ownerSummary) {
        ownerSummary.value = [
          'New project ticket submitted.',
          'Priority: ' + priority,
          'Requested service: ' + service,
          'Budget / Timeline: ' + budget + ' / ' + timeline
        ].join('\n');
      }
      if (ownerContact) {
        ownerContact.value = [
          'Client: ' + (fullName || 'Not provided'),
          'Email: ' + email,
          'Phone: ' + phone,
          'Preferred contact: ' + preferredContact
        ].join('\n');
      }
      if (ownerProject) {
        ownerProject.value = [
          'Ticket ID: ' + ticketId,
          'Submitted (Phoenix): ' + submittedLocalTime,
          'Project location: ' + projectAddress + ', ' + projectCity,
          'Project vision:',
          vision
        ].join('\n');
      }
      if (ownerTracking) {
        ownerTracking.value = [
          'Lead source: website-ticket',
          'Page URL: ' + window.location.href,
          'UTM source: ' + (utmSource || 'n/a'),
          'UTM medium: ' + (utmMedium || 'n/a'),
          'UTM campaign: ' + (utmCampaign || 'n/a')
        ].join('\n');
      }

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
          errorMessage.textContent = 'We could not submit your ticket right now. Please call us at ' + SITE_PHONE_DISPLAY + '.';
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
