/* ============================================================
   Config-driven site script
   ============================================================ */
(function () {
  'use strict';

  var SITE_CONFIG = window.SITE_CONFIG || {};
  var BRAND = SITE_CONFIG.brand || {};
  var ADDRESS = SITE_CONFIG.address || {};
  var PHONE = SITE_CONFIG.phone || {};
  var PHONE_TRACKING = SITE_CONFIG.phoneTracking || {};
  var GOOGLE_REVIEWS = SITE_CONFIG.googleReviews || {};
  var TRUST_ASSETS = SITE_CONFIG.trustAssets || {};
  var FINANCING = SITE_CONFIG.financing || {};
  var ANALYTICS = SITE_CONFIG.analytics || {};
  var URL_PARAMS = new URLSearchParams(window.location.search);

  var SITE_NAME = SITE_CONFIG.businessName || 'Think Green Design | Build Landscape';
  var SITE_PHONE_RAW = String(PHONE.raw || '4809229497').replace(/\D/g, '');
  var SITE_PHONE_DISPLAY = PHONE.display || '(480) 922-9497';
  var DETECTED_LEAD_SOURCE = 'website';
  var SITE_EMAIL = SITE_CONFIG.email || 'thinkgreen@thinkgreenaz.com';
  var SITE_ADDRESS_LINE1 = ADDRESS.line1 || '7730 E. Gelding Dr. Ste 1';
  var SITE_CITY = ADDRESS.city || 'Scottsdale';
  var SITE_STATE = ADDRESS.state || 'AZ';
  var SITE_ZIP = ADDRESS.zip || '85260';

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function setHtml(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.innerHTML = value;
    });
  }

  function normalizePhone(rawValue) {
    return String(rawValue || '').replace(/\D/g, '');
  }

  function toTitleCase(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/(^|[-_\s])([a-z])/g, function (_, prefix, letter) {
        return prefix + letter.toUpperCase();
      });
  }

  function buildStarIcons(ratingValue) {
    var count = Math.max(1, Math.min(5, Number(ratingValue || 5)));
    var icon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.8l2.48 5.03 5.56.81-4.02 3.91.95 5.54L12 16.49l-4.97 2.58.95-5.54-4.02-3.91 5.56-.81L12 3.8z"></path></svg>';
    return new Array(count + 1).join(icon);
  }

  function detectLeadSource() {
    var explicitSource = String(URL_PARAMS.get('source') || '').toLowerCase().trim();
    if (explicitSource) return explicitSource;

    var utmSource = String(URL_PARAMS.get('utm_source') || '').toLowerCase().trim();
    var utmMedium = String(URL_PARAMS.get('utm_medium') || '').toLowerCase().trim();
    var hasGclid = URL_PARAMS.has('gclid');
    var referrer = String(document.referrer || '').toLowerCase();

    if (hasGclid || /cpc|ppc|paid|ads/.test(utmMedium) || /ads|googleads|adwords/.test(utmSource)) {
      return 'ads';
    }
    if (/gbp|google-business|googlebusiness|maps/.test(utmSource)) {
      return 'gbp';
    }
    if (referrer.includes('google.') || utmSource.includes('google')) {
      return 'google';
    }
    return 'website';
  }

  function applyTrackedPhone() {
    var source = detectLeadSource();
    var sourceMap = PHONE_TRACKING.sources || {};
    var defaultTracking = PHONE_TRACKING.default || {};
    var sourceConfig = sourceMap[source] || defaultTracking || PHONE || {};
    var resolvedRaw = normalizePhone(sourceConfig.raw || PHONE.raw || '4809229497');
    var resolvedDisplay = sourceConfig.display || PHONE.display || '(480) 922-9497';

    SITE_PHONE_RAW = resolvedRaw || SITE_PHONE_RAW;
    SITE_PHONE_DISPLAY = resolvedDisplay || SITE_PHONE_DISPLAY;
    DETECTED_LEAD_SOURCE = source || 'website';
  }

  function applyBrandTokens() {
    var root = document.documentElement;
    if (BRAND.primary) root.style.setProperty('--green', BRAND.primary);
    if (BRAND.primaryMid) root.style.setProperty('--green-mid', BRAND.primaryMid);
    if (BRAND.paper) root.style.setProperty('--paper', BRAND.paper);
  }

  function toRootAssetPath(path) {
    var value = String(path || '').trim();
    if (!value) return value;
    if (/^(https?:)?\/\//i.test(value) || value.indexOf('data:') === 0) return value;
    if (value.charAt(0) === '/') return value;
    return '/' + value.replace(/^\.?\//, '');
  }

  function applySiteBranding() {
    applyBrandTokens();

    if (BRAND.logoPath) {
      var resolvedLogoPath = toRootAssetPath(BRAND.logoPath);
      document.querySelectorAll('[data-site-logo]').forEach(function (logo) {
        logo.setAttribute('src', resolvedLogoPath);
      });
    }

    document.querySelectorAll('[data-site-phone-link]').forEach(function (el) {
      el.setAttribute('href', 'tel:' + SITE_PHONE_RAW);
    });
    setText('[data-site-phone-display]', SITE_PHONE_DISPLAY);

    document.querySelectorAll('[data-site-email-link]').forEach(function (el) {
      el.setAttribute('href', 'mailto:' + SITE_EMAIL);
    });
    setText('[data-site-email-display]', SITE_EMAIL);

    setText('[data-site-address-line1]', SITE_ADDRESS_LINE1);
    setText('[data-site-city]', SITE_CITY);
    setText('[data-site-state]', SITE_STATE);
    setText('[data-site-zip]', SITE_ZIP);
    setText('[data-site-name]', SITE_NAME);
    setText('[data-site-year]', String(new Date().getFullYear()));

    var cityField = document.getElementById('city');
    if (cityField && !cityField.value) {
      cityField.setAttribute('placeholder', SITE_CITY);
    }
  }

  function applyContactFormServices() {
    var select = document.querySelector('[data-service-select]');
    var configuredServices = SITE_CONFIG.contactFormServices;
    if (!select || !Array.isArray(configuredServices) || !configuredServices.length) return;

    select.innerHTML = '';

    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select a project type…';
    select.appendChild(placeholder);

    configuredServices.forEach(function (service) {
      var option = document.createElement('option');
      option.value = String(service);
      option.textContent = String(service);
      select.appendChild(option);
    });
  }

  function applyProjectFitCards() {
    var fitGrid = document.querySelector('.project-fit__grid');
    var configuredFit = SITE_CONFIG.projectFit;
    if (!fitGrid || !Array.isArray(configuredFit) || !configuredFit.length) return;

    fitGrid.innerHTML = '';

    configuredFit.forEach(function (item) {
      var article = document.createElement('article');
      article.className = 'fit-card reveal';

      var label = document.createElement('p');
      label.className = 'fit-card__label';
      label.textContent = item.label || 'Project Type';

      var title = document.createElement('h3');
      title.textContent = item.title || 'Landscape Project';

      var description = document.createElement('p');
      description.textContent = item.description || 'Tell us what you want to build and we will route your ticket.';

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'fit-card__action';
      button.setAttribute('data-service-choice', item.ctaService || item.title || 'Not sure yet');
      button.textContent = 'I Need This';

      article.appendChild(label);
      article.appendChild(title);
      article.appendChild(description);
      article.appendChild(button);
      fitGrid.appendChild(article);
    });
  }

  function applyBeforeAfterContent() {
    var data = SITE_CONFIG.beforeAfter || {};
    var afterImage = document.querySelector('[data-before-after-after-image]');
    var beforeImage = document.querySelector('[data-before-after-before-image]');
    var note = document.querySelector('[data-before-after-note]');

    if (afterImage && data.afterImage) {
      afterImage.setAttribute('src', data.afterImage);
      if (data.afterAlt) afterImage.setAttribute('alt', data.afterAlt);
    }

    if (beforeImage && data.beforeImage) {
      beforeImage.setAttribute('src', data.beforeImage);
      if (data.beforeAlt) beforeImage.setAttribute('alt', data.beforeAlt);
    }

    if (note && data.note) {
      note.textContent = data.note;
    }
  }

  function renderReviewCards() {
    var grid = document.getElementById('reviews-grid');
    var reviews = SITE_CONFIG.reviews;
    if (!grid || !Array.isArray(reviews) || !reviews.length) return;

    grid.innerHTML = '';

    reviews.forEach(function (review) {
      var article = document.createElement('article');
      article.className = 'review-card reveal reveal--tilt';

      var stars = document.createElement('div');
      stars.className = 'review-card__stars';
      var rating = Number(review.rating || 5);
      stars.innerHTML = buildStarIcons(rating);
      stars.setAttribute('data-rating', String(Math.max(1, Math.min(5, rating)).toFixed(1)));
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', 'Rated ' + stars.getAttribute('data-rating') + ' out of 5');

      var text = document.createElement('p');
      text.className = 'review-card__text';
      text.textContent = review.text || 'Think Green delivered a clean, professional result and excellent communication from start to finish.';

      var meta = document.createElement('p');
      meta.className = 'review-card__meta';

      var author = document.createElement('strong');
      author.textContent = review.author || 'Verified Google Review';

      var location = document.createElement('span');
      var baseLocation = review.location || (SITE_CITY + ', ' + SITE_STATE);
      location.textContent = baseLocation + ' · Google Review';

      meta.appendChild(author);
      meta.appendChild(location);

      article.appendChild(stars);
      article.appendChild(text);
      article.appendChild(meta);
      grid.appendChild(article);
    });
  }

  function applyGoogleReviewSnapshot() {
    var rating = String(GOOGLE_REVIEWS.rating || '').trim();
    var count = String(GOOGLE_REVIEWS.count || '').trim();
    var platform = String(GOOGLE_REVIEWS.platform || 'Google Reviews').trim();
    var summary = '';

    if (rating && count) {
      summary = rating + ' rating from ' + count + ' ' + platform;
    } else if (rating) {
      summary = rating + ' verified rating';
    } else if (count) {
      summary = count + ' verified reviews';
    }

    if (summary) {
      setText('[data-google-reviews-summary]', summary);
    }

    var dateText = String(GOOGLE_REVIEWS.snapshotDate || '').trim();
    if (dateText) {
      setText('[data-google-reviews-date]', dateText);
    }

    var profileUrl = String(GOOGLE_REVIEWS.profileUrl || '').trim();
    if (profileUrl) {
      document.querySelectorAll('[data-google-reviews-link]').forEach(function (link) {
        link.setAttribute('href', profileUrl);
      });
    }
  }

  function applyTrustAssets() {
    var licenseUrl = String(TRUST_ASSETS.licenseVerifyUrl || '').trim();
    var bondUrl = String(TRUST_ASSETS.bondVerifyUrl || '').trim();
    var insuranceCopy = String(TRUST_ASSETS.insuranceStatement || '').trim();

    if (licenseUrl) {
      document.querySelectorAll('[data-license-verify-link]').forEach(function (link) {
        link.setAttribute('href', licenseUrl);
      });
    }

    if (bondUrl) {
      document.querySelectorAll('[data-bond-verify-link]').forEach(function (link) {
        link.setAttribute('href', bondUrl);
      });
    }

    if (insuranceCopy) {
      setText('[data-insurance-statement]', insuranceCopy);
    }
  }

  function applyFinancingNote() {
    var financingNote = document.getElementById('financing-note');
    if (!financingNote) return;

    var enabled = FINANCING.enabled !== false;
    var copy = String(FINANCING.copy || '').trim();

    if (!enabled) {
      financingNote.style.display = 'none';
      return;
    }

    if (copy) {
      financingNote.textContent = copy;
    }
  }

  function buildProjectThumbSourceSet(imagePath) {
    var cleanPath = String(imagePath || '').trim();
    if (!cleanPath) return '';
    var normalized = cleanPath.replace(/^\.\//, '').replace(/^\//, '');
    var extMatch = normalized.match(/\.([a-z0-9]+)$/i);
    if (!extMatch) return '';
    var ext = extMatch[1].toLowerCase();
    var base = normalized.slice(0, -1 * (ext.length + 1));
    var sources = [];

    sources.push('/' + base + '-640.avif 640w');

    if (ext === 'webp') {
      sources.push('/' + normalized + ' 1200w');
    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
      sources.push('/' + normalized + ' 1200w');
    }

    return sources.join(', ');
  }

  function renderRecentProjects() {
    var list = Array.isArray(window.RECENT_PROJECTS) ? window.RECENT_PROJECTS : [];
    var grid = document.getElementById('recent-projects-grid');
    if (!grid || !list.length) return;

    grid.innerHTML = list.map(function (project, index) {
      var title = String(project.title || 'Recent Project').trim();
      var location = String(project.location || SITE_CITY + ', ' + SITE_STATE).trim();
      var styleSlug = String(project.styleSlug || 'all').trim();
      var serviceSlug = String(project.serviceSlug || '').trim();
      var src = String(project.image || '').trim();
      var srcset = buildProjectThumbSourceSet(src);
      var alt = String(project.imageAlt || title + ' in ' + location).trim();
      var width = Number(project.width || 1600);
      var height = Number(project.height || 900);
      var requestQuery = new URLSearchParams({
        source: 'recent_projects',
        service: serviceSlug || '',
        selected_style: styleSlug,
        selected_image: src || ('recent-project-' + (index + 1)),
        selected_project_label: title
      });

      return '' +
        '<article class="recent-project reveal reveal--scale">' +
        '  <figure class="recent-project__media">' +
        '    <img src="' + src + '" alt="' + alt + '" title="' + alt + '" loading="lazy" decoding="async" width="' + width + '" height="' + height + '"' +
        (srcset ? ' srcset="' + srcset + '" sizes="(max-width: 768px) 100vw, 33vw"' : '') +
        ' />' +
        '    <span class="recent-project__chip">' + (project.type || 'Project') + '</span>' +
        '  </figure>' +
        '  <div class="recent-project__body">' +
        '    <h3>' + title + '</h3>' +
        '    <p>' + location + '</p>' +
        '    <a href="index.html?' + requestQuery.toString() + '#contact" class="text-link">Request This Style &rarr;</a>' +
        '  </div>' +
        '</article>';
    }).join('');
  }

  function applyImageTitleFallbacks() {
    document.querySelectorAll('img').forEach(function (img) {
      var alt = String(img.getAttribute('alt') || '').trim();
      if (alt && !img.getAttribute('title')) {
        img.setAttribute('title', alt);
      }
    });
  }

  function installAnalytics() {
    var measurementId = String(ANALYTICS.ga4MeasurementId || '').trim();
    var trackingContext = {
      lead_source: DETECTED_LEAD_SOURCE || 'website',
      utm_source: String(URL_PARAMS.get('utm_source') || '').trim(),
      utm_medium: String(URL_PARAMS.get('utm_medium') || '').trim(),
      utm_campaign: String(URL_PARAMS.get('utm_campaign') || '').trim(),
      utm_content: String(URL_PARAMS.get('utm_content') || '').trim(),
      referrer: String(document.referrer || '').trim(),
      landing_path: String(window.location.pathname || '/')
    };

    window.trackLeadEvent = function trackLeadEvent(name, params) {
      if (typeof window.gtag !== 'function') return;
      window.gtag('event', name, Object.assign({}, trackingContext, params || {}));
    };

    if (measurementId) {
      var gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        anonymize_ip: true
      });
    }

    var callClickMap = new WeakSet();
    document.querySelectorAll('[data-site-phone-link], a[href^="tel:"]').forEach(function (link) {
      if (callClickMap.has(link)) return;
      callClickMap.add(link);
      link.addEventListener('click', function () {
        var payload = {
          method: 'tel_link',
          source: DETECTED_LEAD_SOURCE,
          page_location: window.location.href
        };
        window.trackLeadEvent('call_click', payload);
        window.trackLeadEvent('click_call', payload);
      });
    });

    var trackedDepths = {};
    var depthThresholds = [25, 50, 75, 90];
    function trackScrollDepth() {
      var body = document.body;
      var html = document.documentElement;
      var scrollTop = window.scrollY || html.scrollTop || body.scrollTop || 0;
      var scrollHeight = Math.max(body.scrollHeight, html.scrollHeight, body.offsetHeight, html.offsetHeight);
      var windowHeight = window.innerHeight || html.clientHeight || 0;
      var maxScrollable = Math.max(1, scrollHeight - windowHeight);
      var depth = Math.min(100, Math.round((scrollTop / maxScrollable) * 100));

      depthThresholds.forEach(function (threshold) {
        if (depth >= threshold && !trackedDepths[threshold]) {
          trackedDepths[threshold] = true;
          window.trackLeadEvent('scroll_depth', {
            depth_percent: threshold,
            page_location: window.location.href
          });
        }
      });
    }

    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    trackScrollDepth();

    document.addEventListener('click', function (event) {
      var trigger = event.target && event.target.closest
        ? event.target.closest('a, button')
        : null;
      if (!trigger) return;

      var isCta = trigger.classList.contains('btn') ||
        trigger.classList.contains('nav__cta') ||
        trigger.classList.contains('fit-card__action') ||
        trigger.classList.contains('lead-tier__btn') ||
        trigger.classList.contains('text-link');

      if (!isCta) return;

      var ctaLabel = String(trigger.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
      var ctaTarget = trigger.getAttribute('href') || trigger.id || 'button';
      window.trackLeadEvent('cta_click', {
        cta_label: ctaLabel,
        cta_target: ctaTarget,
        page_location: window.location.href
      });

      var normalizedLabel = ctaLabel.toLowerCase();
      var normalizedTarget = String(ctaTarget).toLowerCase();
      if (normalizedLabel.indexOf('consultation') >= 0 || normalizedTarget.indexOf('#contact') >= 0) {
        window.trackLeadEvent('click_get_consultation', {
          cta_label: ctaLabel,
          cta_target: ctaTarget,
          page_location: window.location.href
        });
      }
      if (normalizedLabel.indexOf('portfolio') >= 0 || normalizedTarget.indexOf('portfolio') >= 0) {
        window.trackLeadEvent('click_portfolio', {
          cta_label: ctaLabel,
          cta_target: ctaTarget,
          page_location: window.location.href
        });
      }
    });

    if (window.location.pathname.indexOf('thank-you.html') !== -1) {
      window.trackLeadEvent('thank_you_view', {
        page_location: window.location.href,
        source: String(URL_PARAMS.get('source') || DETECTED_LEAD_SOURCE || 'website')
      });
    }
  }

  applyTrackedPhone();
  applySiteBranding();
  applyContactFormServices();
  applyProjectFitCards();
  applyBeforeAfterContent();
  renderReviewCards();
  applyGoogleReviewSnapshot();
  applyTrustAssets();
  applyFinancingNote();
  renderRecentProjects();
  applyImageTitleFallbacks();
  installAnalytics();

  /* ---- NAV SCROLL STATE ---- */
  var nav = document.getElementById('nav');
  function updateNav() {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  /* ---- MOBILE MENU ---- */
  var burger = document.getElementById('nav-burger');
  var overlay = document.getElementById('nav-overlay');
  var close = document.getElementById('nav-close');
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
  if (close) close.addEventListener('click', closeMenu);
  if (overlay) {
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  if ('IntersectionObserver' in window && contactSection) {
    var contactObs = new IntersectionObserver(function (entries) {
      isContactInView = entries.some(function (entry) {
        return entry.isIntersecting;
      });
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
  var dots = document.querySelectorAll('.hero__dot');
  var current = 0;
  var heroTimer;

  function goToSlide(n) {
    if (!slides.length || !dots.length) return;
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

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
    var activePointerId = null;

    function updateBeforeAfter() {
      var value = Number(range.value || 50);
      var insetRight = Math.max(0, Math.min(100, 100 - value));
      overlayPanel.style.clipPath = 'inset(0 ' + insetRight + '% 0 0)';
      overlayPanel.style.webkitClipPath = 'inset(0 ' + insetRight + '% 0 0)';
      divider.style.left = value + '%';
    }

    function updateFromClientX(clientX) {
      var rect = slider.getBoundingClientRect();
      if (!rect.width) return;
      var value = ((clientX - rect.left) / rect.width) * 100;
      value = Math.max(0, Math.min(100, value));
      range.value = String(value);
      updateBeforeAfter();
    }

    function startDrag(event) {
      activePointerId = event.pointerId;
      slider.classList.add('is-dragging');
      if (typeof slider.setPointerCapture === 'function' && event.pointerId !== undefined) {
        slider.setPointerCapture(event.pointerId);
      }
      updateFromClientX(event.clientX);
    }

    function moveDrag(event) {
      if (activePointerId === null) return;
      if (event.pointerId !== undefined && event.pointerId !== activePointerId) return;
      event.preventDefault();
      updateFromClientX(event.clientX);
    }

    function endDrag(event) {
      if (activePointerId === null) return;
      if (event && event.pointerId !== undefined && event.pointerId !== activePointerId) return;
      slider.classList.remove('is-dragging');
      if (event && typeof slider.releasePointerCapture === 'function' && event.pointerId !== undefined) {
        try { slider.releasePointerCapture(event.pointerId); } catch (err) {}
      }
      activePointerId = null;
    }

    range.addEventListener('input', updateBeforeAfter);
    range.addEventListener('change', updateBeforeAfter);
    slider.addEventListener('pointerdown', startDrag);
    slider.addEventListener('pointermove', moveDrag);
    slider.addEventListener('pointerup', endDrag);
    slider.addEventListener('pointercancel', endDrag);
    slider.addEventListener('pointerleave', endDrag);
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

    /* Per-section stagger: elements in the same section get incrementing delays */
    var sectionCounters = new Map();
    document.querySelectorAll('.reveal').forEach(function (el) {
      /* Skip JS delay for elements that have explicit delay class */
      if (/reveal--d[1-8]/.test(el.className)) {
        revealObs.observe(el);
        return;
      }
      var section = el.closest('section') || el.closest('main') || document.body;
      var idx = sectionCounters.get(section) || 0;
      el.style.transitionDelay = Math.min(idx * 0.1, 0.5) + 's';
      sectionCounters.set(section, idx + 1);
      revealObs.observe(el);
    });

    /* Process connector draw animation */
    var connectorObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-drawn');
          connectorObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.process__connector').forEach(function (c) {
      connectorObs.observe(c);
    });

    /* Number counter animation for hero stats */
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        counterObserver.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var isFloat = String(target).indexOf('.') !== -1;
        var duration = 1200;
        var start = performance.now();
        function step(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          /* ease-out cubic */
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = eased * target;
          el.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
    document.querySelectorAll('.process__connector').forEach(function (c) {
      c.classList.add('is-drawn');
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
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var errorMessage = document.getElementById('form-error');
  var ticketInput = document.getElementById('ticket-id');
  var submittedLocal = document.getElementById('submitted-local');
  var ownerSummary = document.getElementById('owner-summary');
  var ownerPriority = document.getElementById('owner-priority');
  var ownerContact = document.getElementById('owner-contact-card');
  var ownerProject = document.getElementById('owner-project-snapshot');
  var ownerTracking = document.getElementById('owner-tracking');
  var serviceInput = document.getElementById('service');
  var fullNameInput = document.getElementById('full_name');
  var firstNameInput = document.getElementById('fname');
  var lastNameInput = document.getElementById('lname');
  var emailVisibleInput = document.getElementById('email_visible');
  var emailInput = document.getElementById('email');
  var phoneInput = document.getElementById('phone');
  var cityInput = document.getElementById('city');
  var addressInput = document.getElementById('property_address');
  var budgetInput = document.getElementById('budget');
  var consultationTierInput = document.getElementById('consultation_tier');
  var timelineInput = document.getElementById('timeline');
  var startTimelineInput = document.getElementById('start_timeline');
  var estimatedTimelineInput = document.getElementById('estimated_timeline');
  var contactMethod = document.getElementById('contact_method');
  var contactMethodValueInput = document.getElementById('contact_method_value');
  var leadTierInput = document.getElementById('lead_tier');
  var leadSourceInput = document.getElementById('lead_source');
  var utmSourceInput = document.getElementById('utm_source');
  var utmMediumInput = document.getElementById('utm_medium');
  var utmCampaignInput = document.getElementById('utm_campaign');
  var utmContentInput = document.getElementById('utm_content');
  var referrerInput = document.getElementById('referrer');
  var landingPathInput = document.getElementById('landing_path');
  var selectedServiceInput = document.getElementById('selected_service');
  var selectedStyleInput = document.getElementById('selected_style');
  var selectedImageInput = document.getElementById('selected_image');
  var selectedProjectLabelInput = document.getElementById('selected_project_label');
  var messageInput = document.getElementById('message');
  var ticketReference = document.getElementById('ticket-reference');
  var progressBar = document.querySelector('.ticket-progress__bar');
  var progressFill = document.getElementById('ticket-progress-fill');
  var progressText = document.getElementById('ticket-progress-text');

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

  function normalizeTierText(value) {
    return String(value || '')
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function getBudgetRangeFromTier(tierLabel) {
    var tier = normalizeTierText(tierLabel);
    if (!tier) return 'Not provided';
    if (tier.indexOf('10k') >= 0 && tier.indexOf('25k') >= 0) return '$10,000 - $25,000';
    if (tier.indexOf('25k') >= 0 && tier.indexOf('60k') >= 0) return '$25,000 - $60,000';
    if (tier.indexOf('60k') >= 0) return '$60,000 - $150,000';
    return 'Not provided';
  }

  function updateFormProgress() {
    if (!form || !progressFill || !progressText || !progressBar) return;
    var required = Array.from(form.querySelectorAll('[required]'));
    var filled = required.filter(function (field) {
      return field.value.trim() !== '';
    }).length;

    var percent = required.length ? Math.round((filled / required.length) * 100) : 0;
    progressFill.style.width = percent + '%';
    progressText.textContent = percent + '% complete';
    progressBar.setAttribute('aria-valuenow', String(percent));
  }

  function bindFitButtons() {
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
        if (typeof window.trackLeadEvent === 'function') {
          window.trackLeadEvent('project_fit_click', {
            service_interest: choice || 'not_set',
            page_location: window.location.href
          });
        }

        var section = document.getElementById('contact');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  bindFitButtons();

  function bindLeadTierButtons() {
    var tierButtons = document.querySelectorAll('[data-lead-tier]');
    if (!tierButtons.length) return;

    tierButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tier = String(this.getAttribute('data-lead-tier') || '').trim();
        if (!tier) return;

        tierButtons.forEach(function (other) { other.classList.remove('is-selected'); });
        this.classList.add('is-selected');

        if (leadTierInput) leadTierInput.value = tier;
        if (consultationTierInput) consultationTierInput.value = tier;
        if (budgetInput) budgetInput.value = getBudgetRangeFromTier(tier);

        if (messageInput) {
          var tierLine = 'Interested in the ' + tier + ' tier.';
          var current = String(messageInput.value || '').trim();
          if (!current) {
            messageInput.value = tierLine;
          } else if (!current.includes(tierLine)) {
            messageInput.value = current + '\n' + tierLine;
          }
          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        if (typeof window.trackLeadEvent === 'function') {
          window.trackLeadEvent('lead_tier_select', {
            lead_tier: tier,
            page_location: window.location.href
          });
        }

        var section = document.getElementById('contact');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  bindLeadTierButtons();

  if (form) {
    var params = URL_PARAMS;
    var utmSource = params.get('utm_source') || '';
    var utmMedium = params.get('utm_medium') || '';
    var utmCampaign = params.get('utm_campaign') || '';
    var utmContent = params.get('utm_content') || '';
    var requestedService = params.get('service') || '';
    var requestedStyle = params.get('selected_style') || '';
    var requestedImage = params.get('selected_image') || '';
    var requestedProjectLabel = params.get('selected_project_label') || '';
    var requestedSource = params.get('source') || '';
    var requestedTimeline = params.get('estimated_timeline') || params.get('timeline') || '';
    var referrerValue = String(document.referrer || '');
    var landingPathValue = String(window.location.pathname || '/');
    var hasTrackedFormStarted = false;

    function normalizeServiceSlug(value) {
      return String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    function mapStyleToService(styleValue) {
      var slug = normalizeServiceSlug(styleValue);
      if (!slug) return '';
      if (slug.indexOf('hardscape') >= 0) return 'Hardscaping';
      if (slug.indexOf('water') >= 0) return 'Water Feature';
      if (slug.indexOf('fire') >= 0) return 'Fire Feature / Outdoor Kitchen';
      if (slug.indexOf('outdoor') >= 0) return 'Fire Feature / Outdoor Kitchen';
      if (slug.indexOf('desert') >= 0 || slug.indexOf('xeriscape') >= 0 || slug.indexOf('turf') >= 0) {
        return 'Desert / Drought-Tolerant Design';
      }
      if (slug.indexOf('irrigation') >= 0) return 'Irrigation';
      if (slug.indexOf('frontyard') >= 0 || slug.indexOf('backyard') >= 0 || slug.indexOf('curb') >= 0) {
        return 'Landscape Design & Build';
      }
      return '';
    }

    function resolveServicePrefill(value) {
      if (!value || !serviceInput) return '';
      var cleanValue = String(value).trim();
      if (!cleanValue) return '';
      var requestedSlug = normalizeServiceSlug(cleanValue);

      var catalog = Array.isArray(window.SERVICES_DATA) ? window.SERVICES_DATA : [];
      var serviceFromCatalog = catalog.find(function (item) {
        return normalizeServiceSlug(item.slug) === requestedSlug;
      });
      if (serviceFromCatalog) {
        return String(serviceFromCatalog.formValue || serviceFromCatalog.title || '');
      }

      var options = Array.from(serviceInput.options).map(function (option) {
        return String(option.value || '').trim();
      }).filter(Boolean);

      var directMatch = options.find(function (option) {
        return option.toLowerCase() === cleanValue.toLowerCase();
      });
      if (directMatch) return directMatch;

      var slugMatch = options.find(function (option) {
        return normalizeServiceSlug(option) === requestedSlug;
      });
      if (slugMatch) return slugMatch;

      return '';
    }

    function applyServicePrefillFromQuery() {
      if (!serviceInput) return;
      if (serviceInput.value && serviceInput.value.trim()) return;

      var styleMappedService = mapStyleToService(requestedStyle);
      var resolvedService = resolveServicePrefill(requestedService) || resolveServicePrefill(styleMappedService);
      if (!resolvedService) return;

      serviceInput.value = resolvedService;
      serviceInput.dispatchEvent(new Event('input', { bubbles: true }));
      serviceInput.dispatchEvent(new Event('change', { bubbles: true }));

      if (selectedServiceInput) selectedServiceInput.value = resolvedService;

      var prefillLines = [];
      prefillLines.push('Interested in ' + resolvedService + '.');
      if (requestedStyle) prefillLines.push('Preferred style: ' + toTitleCase(String(requestedStyle).replace(/[-_]/g, ' ')) + '.');
      if (requestedProjectLabel) prefillLines.push('Project reference: ' + requestedProjectLabel + '.');
      var prefill = prefillLines.join(' ');

      if (messageInput && !messageInput.value.trim()) {
        messageInput.value = prefill + ' Please contact me about next steps.';
      } else if (messageInput && prefill && !messageInput.value.includes(prefill)) {
        messageInput.value = String(messageInput.value).trim() + '\n' + prefill;
      }

      if (typeof window.trackLeadEvent === 'function') {
        window.trackLeadEvent('service_prefill', {
          service: resolvedService,
          source: requestedSource || DETECTED_LEAD_SOURCE || 'url_param',
          page_location: window.location.href
        });
      }
    }

    if (leadSourceInput) {
      leadSourceInput.value = requestedSource || utmSource || DETECTED_LEAD_SOURCE || 'website';
    }
    if (utmSourceInput) utmSourceInput.value = utmSource;
    if (utmMediumInput) utmMediumInput.value = utmMedium;
    if (utmCampaignInput) utmCampaignInput.value = utmCampaign;
    if (utmContentInput) utmContentInput.value = utmContent;
    if (referrerInput) referrerInput.value = referrerValue || 'direct';
    if (landingPathInput) landingPathInput.value = landingPathValue || '/';

    if (selectedStyleInput && requestedStyle) selectedStyleInput.value = requestedStyle;
    if (selectedImageInput && requestedImage) selectedImageInput.value = requestedImage;
    if (selectedProjectLabelInput && requestedProjectLabel) selectedProjectLabelInput.value = requestedProjectLabel;

    if (estimatedTimelineInput && requestedTimeline) {
      Array.from(estimatedTimelineInput.options).some(function (option) {
        var sameValue = option.value.toLowerCase() === String(requestedTimeline).toLowerCase();
        if (sameValue) estimatedTimelineInput.value = option.value;
        return sameValue;
      });
    }
    if (estimatedTimelineInput) {
      var syncTimeline = function syncTimeline(value) {
        var next = value || 'Planning for later';
        if (timelineInput) timelineInput.value = next;
        if (startTimelineInput) startTimelineInput.value = next;
      };
      syncTimeline(estimatedTimelineInput.value || (timelineInput && timelineInput.value));
      estimatedTimelineInput.addEventListener('change', function () {
        syncTimeline(this.value);
      });
    }
    if (contactMethodValueInput) {
      contactMethodValueInput.value = contactMethod && contactMethod.value ? contactMethod.value : 'Phone call';
    }

    applyServicePrefillFromQuery();

    if (messageInput && !messageInput.value.trim() && (requestedStyle || requestedProjectLabel)) {
      var styleLine = requestedStyle ? ('Interested in a ' + toTitleCase(String(requestedStyle).replace(/[-_]/g, ' ')) + ' project.') : '';
      var projectLine = requestedProjectLabel ? (' Project reference: ' + requestedProjectLabel + '.') : '';
      messageInput.value = (styleLine + projectLine).trim();
    }

    if (serviceInput && selectedServiceInput) {
      serviceInput.addEventListener('change', function () {
        selectedServiceInput.value = this.value || '';
      });
      serviceInput.addEventListener('input', function () {
        selectedServiceInput.value = this.value || '';
      });
      if (serviceInput.value) selectedServiceInput.value = serviceInput.value;
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var v = this.value.replace(/\D/g, '');
        if (v.length >= 10) v = '(' + v.slice(0, 3) + ') ' + v.slice(3, 6) + '-' + v.slice(6, 10);
        this.value = v;
      });
    }

    function trackFormStarted() {
      if (hasTrackedFormStarted) return;
      hasTrackedFormStarted = true;
      if (typeof window.trackLeadEvent === 'function') {
        window.trackLeadEvent('form_started', {
          form_id: 'contact-form',
          page_location: window.location.href
        });
      }
    }

    form.querySelectorAll('input, select, textarea, button').forEach(function (field) {
      field.addEventListener('focus', trackFormStarted, { once: true });
      field.addEventListener('input', trackFormStarted, { once: true });
      field.addEventListener('change', trackFormStarted, { once: true });
    });

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
      var leadTier = valueOrFallback(leadTierInput, 'Not selected');
      var consultationTier = valueOrFallback(consultationTierInput, 'Not selected');
      if (consultationTier === 'Not selected' && leadTier !== 'Not selected') {
        consultationTier = leadTier;
      }
      var budget = valueOrFallback(budgetInput, 'Not provided');
      if (!budget || budget === 'Not provided' || budget === 'Not discussed yet') {
        budget = getBudgetRangeFromTier(consultationTier || leadTier);
      }
      var timeline = valueOrFallback(startTimelineInput || timelineInput, 'Not selected');
      var leadSource = valueOrFallback(leadSourceInput, DETECTED_LEAD_SOURCE || 'website');
      var selectedStyle = valueOrFallback(selectedStyleInput, 'Not selected');
      var selectedImage = valueOrFallback(selectedImageInput, 'Not selected');
      var selectedProjectLabel = valueOrFallback(selectedProjectLabelInput, 'Not selected');
      var priority = getPriority(budget, timeline);
      var preferredContact = valueOrFallback(contactMethodValueInput || contactMethod, 'Phone call');
      var projectCity = valueOrFallback(cityInput, 'Not provided');
      var projectAddress = valueOrFallback(addressInput, 'Not provided');
      var vision = valueOrFallback(messageInput, 'No project details provided.');
      var email = valueOrFallback(emailInput, 'Not provided');
      var phone = valueOrFallback(phoneInput, 'Not provided');

      if (ticketInput) ticketInput.value = ticketId;
      if (consultationTierInput) consultationTierInput.value = consultationTier;
      if (budgetInput) budgetInput.value = budget;
      if (submittedLocal) submittedLocal.value = submittedLocalTime;
      if (timelineInput) timelineInput.value = timeline;
      if (startTimelineInput) startTimelineInput.value = timeline;
      if (contactMethod) contactMethod.value = preferredContact;
      if (contactMethodValueInput) contactMethodValueInput.value = preferredContact;
      if (ownerPriority) ownerPriority.value = priority;

      if (ownerSummary) {
        ownerSummary.value = [
          'New project ticket submitted.',
          'Priority: ' + priority,
          'Requested service: ' + service,
          'Budget / Timeline: ' + budget + ' / ' + timeline,
          'Consultation tier: ' + consultationTier,
          'Source: ' + leadSource,
          'Style reference: ' + selectedStyle,
          'Project reference: ' + selectedProjectLabel
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
          'Consultation tier: ' + consultationTier,
          'Budget range: ' + budget,
          'Estimated timeline: ' + timeline,
          'Selected style: ' + selectedStyle,
          'Selected image: ' + selectedImage,
          'Selected project label: ' + selectedProjectLabel,
          'Project vision:',
          vision
        ].join('\n');
      }

      if (ownerTracking) {
        ownerTracking.value = [
          'Lead source: ' + leadSource,
          'Page URL: ' + window.location.href,
          'UTM source: ' + (utmSource || 'n/a'),
          'UTM medium: ' + (utmMedium || 'n/a'),
          'UTM campaign: ' + (utmCampaign || 'n/a'),
          'UTM content: ' + (utmContent || 'n/a'),
          'Referrer: ' + (referrerValue || 'direct'),
          'Landing path: ' + (landingPathValue || '/'),
          'Selected style: ' + selectedStyle,
          'Selected image: ' + selectedImage,
          'Selected project label: ' + selectedProjectLabel
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
        if (typeof window.trackLeadEvent === 'function') {
          var submitPayload = {
            ticket_id: ticketId,
            service: service,
            consultation_tier: consultationTier,
            lead_tier: leadTier,
            budget_range: budget,
            lead_source: leadSource,
            selected_style: selectedStyle,
            city: projectCity,
            page_location: window.location.href
          };
          window.trackLeadEvent('form_submit', submitPayload);
          window.trackLeadEvent('form_submitted', submitPayload);
        } else if (typeof window.gtag === 'function') {
          window.gtag('event', 'form_submit', {
            event_category: 'lead',
            event_label: service,
            value: 1
          });
        }

        var thankYouParams = new URLSearchParams({
          ticket_id: ticketId,
          service: service,
          city: projectCity,
          source: leadSource,
          selected_style: selectedStyle,
          selected_project_label: selectedProjectLabel
        });
        window.location.href = 'thank-you.html?' + thankYouParams.toString();
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
