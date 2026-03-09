(function () {
  'use strict';

  var services = Array.isArray(window.SERVICES_DATA) ? window.SERVICES_DATA : [];
  if (!services.length) return;
  var root = document.body;
  var isNestedServicePage = !!(root && root.classList.contains('service-page'));

  function byId(id) {
    return document.getElementById(id);
  }

  function withBase(path) {
    if (isNestedServicePage) {
      return '../' + String(path || '').replace(/^\//, '');
    }
    return String(path || '');
  }

  function iconMarkup(type) {
    if (type === 'shield') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3l8 4v6c0 5-3.2 7.8-8 9-4.8-1.2-8-4-8-9V7l8-4z"></path><path d="M9 12l2 2 4-4"></path></svg>';
    }
    if (type === 'projects') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 19h16"></path><path d="M5 19V7l7-4 7 4v12"></path><path d="M9 12h6"></path></svg>';
    }
    if (type === 'plan') {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h10"></path><path d="M17 17l2 2 3-3"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>';
  }

  function serviceConsultationHref(service) {
    return withBase('index.html?service=' + encodeURIComponent(service.slug) + '&source=service_page#contact');
  }

  function servicePortfolioHref(service) {
    return withBase('portfolio.html?service=' + encodeURIComponent(service.slug));
  }

  function normalizePath(path) {
    if (!path) return '';
    return path.replace(/^\.\//, '').replace(/^\//, '');
  }

  function buildProofMarkup() {
    var items = Array.isArray(window.SERVICE_PROOF_ITEMS) ? window.SERVICE_PROOF_ITEMS : [];
    return items.map(function (item) {
      return '' +
        '<article class="service-proof__item">' +
        '  <span class="service-proof__icon">' + iconMarkup(item.icon) + '</span>' +
        '  <p>' + item.label + '</p>' +
        '</article>';
    }).join('');
  }

  function sourceSetForImage(path) {
    var normalized = String(path || '').replace(/^\.\//, '').replace(/^\//, '');
    var match = normalized.match(/\.([a-z0-9]+)$/i);
    if (!match) return { avif: '', fallback: '' };
    var ext = match[1].toLowerCase();
    var base = normalized.slice(0, -1 * (ext.length + 1));
    return {
      avif: withBase(base + '-640.avif'),
      fallback: withBase(normalized)
    };
  }

  function injectFaqSchema(service) {
    if (!service || !Array.isArray(service.faqs) || !service.faqs.length) return;

    var schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: service.faqs.map(function (item) {
        return {
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a
          }
        };
      })
    };

    var existing = document.getElementById('service-faq-schema');
    if (existing) existing.remove();
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'service-faq-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  function applyReviewSnapshot(selector) {
    var reviewConfig = window.SITE_CONFIG && window.SITE_CONFIG.googleReviews
      ? window.SITE_CONFIG.googleReviews
      : {};
    var target = selector ? document.querySelector(selector) : null;
    if (!target) return;

    var rating = String(reviewConfig.rating || '').trim();
    var count = String(reviewConfig.count || '').trim();
    var platform = String(reviewConfig.platform || 'Homeowner review profile').trim();
    var link = String(reviewConfig.profileUrl || '').trim();
    if (!rating && !count) return;

    var text = rating + ' rating';
    if (count) text += ' from ' + count + ' on the ' + platform;

    target.innerHTML = link
      ? '<a href="' + link + '" target="_blank" rel="noopener noreferrer">' + text + '</a>'
      : text;
  }

  function renderHub() {
    var hubGrid = byId('services-hub-grid');
    var hubProof = byId('service-proof');
    var hubReviewProof = byId('services-hub-proof');
    if (!hubGrid) return;
    if (hubProof) {
      hubProof.innerHTML = buildProofMarkup();
    }
    if (hubReviewProof) {
      applyReviewSnapshot('#services-hub-proof');
    }

    hubGrid.innerHTML = services.map(function (service) {
      return '' +
        '<article class="service-card reveal reveal--scale">' +
        '  <p class="service-card__eyebrow">Scottsdale &amp; Phoenix</p>' +
        '  <h3>' + service.title + '</h3>' +
        '  <p>' + service.heroSubtext + '</p>' +
        '  <ul class="service-card__list">' +
        service.whatYouGet.slice(0, 3).map(function (item) {
          return '<li>' + item + '</li>';
        }).join('') +
        '  </ul>' +
        '  <div class="service-card__actions">' +
        '    <a class="btn btn--dark" href="' + serviceConsultationHref(service) + '">Get Free Design Consultation</a>' +
        '    <a class="text-link" href="' + service.path + '">View Service Details &rarr;</a>' +
        '  </div>' +
        '</article>';
    }).join('');
  }

  function renderServicePage() {
    if (!root || !root.dataset.serviceSlug) return;

    var service = (window.getServiceBySlug && window.getServiceBySlug(root.dataset.serviceSlug)) || null;
    if (!service) return;

    var heroBackground = document.querySelector('.service-hero__bg');
    var heading = byId('service-heading');
    var subtext = byId('service-subtext');
    var breadcrumbCurrent = byId('service-breadcrumb-current');
    var ctaPrimaryAll = document.querySelectorAll('[data-service-consultation-link]');
    var proof = byId('service-proof');
    var whatYouGet = byId('service-what-you-get');
    var process = byId('service-process');
    var gallery = byId('service-gallery');
    var area = byId('service-area-text');
    var faq = byId('service-faq');
    var related = byId('related-services-list');
    var reviewProof = byId('service-review-proof');
    var faqHeading = faq && faq.closest('.service-block')
      ? faq.closest('.service-block').querySelector('.section-title')
      : null;

    if (heading) heading.textContent = service.heroHeadline;
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = service.title;
    if (subtext) subtext.textContent = service.heroSubtext;
    if (heroBackground && Array.isArray(service.gallery) && service.gallery.length) {
      heroBackground.style.backgroundImage = 'url(\"../' + service.gallery[0].src + '\")';
    }

    ctaPrimaryAll.forEach(function (link) {
      link.setAttribute('href', serviceConsultationHref(service));
    });

    if (proof) {
      proof.innerHTML = buildProofMarkup();
    }

    if (whatYouGet) {
      whatYouGet.innerHTML = service.whatYouGet.map(function (item) {
        return '<li>' + item + '</li>';
      }).join('');

      var existingRange = document.getElementById('service-typical-range');
      if (existingRange) existingRange.remove();
      if (service.typicalRange) {
        var rangeCard = document.createElement('div');
        rangeCard.className = 'service-range reveal';
        rangeCard.id = 'service-typical-range';
        rangeCard.innerHTML = '' +
          '<div class="service-range__intro">' +
          '  <p class="eyebrow">Planning Range</p>' +
          '  <h3>Typical Project Range</h3>' +
          '</div>' +
          '<div class="service-range__content">' +
          '  <p class="service-range__value">' + service.typicalRange + '</p>' +
          '  <p class="service-range__note">Final pricing depends on scope and site conditions.</p>' +
          '</div>';
        whatYouGet.insertAdjacentElement('afterend', rangeCard);
        if (Array.isArray(service.proofBlurbs) && service.proofBlurbs.length) {
          var proofStrip = document.createElement('div');
          proofStrip.className = 'service-proof-blurbs reveal';
          proofStrip.innerHTML = service.proofBlurbs.map(function (item) {
            return '' +
              '<article class="service-proof-blurbs__item">' +
              '  <p>' + item + '</p>' +
              '</article>';
          }).join('');
          rangeCard.insertAdjacentElement('afterend', proofStrip);
        }
      }
    }

    if (process) {
      process.innerHTML = service.process.map(function (step, index) {
        var displayIndex = String(index + 1).padStart(2, '0');
        return '' +
          '<article class="service-step">' +
          '  <span class="service-step__num">' + displayIndex + '</span>' +
          '  <p>' + step + '</p>' +
          '</article>';
      }).join('');
    }

    if (gallery) {
      gallery.innerHTML = service.gallery.map(function (item) {
        var sourceSet = sourceSetForImage(item.src);
        return '' +
          '<a class="service-gallery__item" href="' + servicePortfolioHref(service) + '">' +
          '  <picture>' +
          '    <source type="image/avif" srcset="' + sourceSet.avif + '" />' +
          '    <img src="' + sourceSet.fallback + '" alt="' + item.alt + '" title="' + item.alt + '" loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 33vw" width="' + item.width + '" height="' + item.height + '" />' +
          '  </picture>' +
          '  <span class="service-gallery__chip">' + item.chip + '</span>' +
          '  <span class="service-gallery__label">' + item.label + '</span>' +
          '</a>';
      }).join('');
    }

    if (area) {
      area.textContent = service.serviceAreaText;
    }

    if (faq) {
      faq.innerHTML = service.faqs.map(function (item, index) {
        var openClass = index === 0 ? ' is-open' : '';
        var expanded = index === 0 ? 'true' : 'false';
        return '' +
          '<article class="faq-item service-faq__item' + openClass + '">' +
          '  <button class="faq__question service-faq__question" type="button" aria-expanded="' + expanded + '">' +
          '    <span>' + item.q + '</span><span class="faq__icon" aria-hidden="true">+</span>' +
          '  </button>' +
          '  <div class="faq__answer"><p>' + item.a + '</p></div>' +
          '</article>';
      }).join('');
    }

    if (faqHeading) {
      faqHeading.textContent = 'Questions Homeowners Ask About ' + service.title;
    }

    if (related) {
      var currentPath = normalizePath(service.path);
      var relatedServices = services.filter(function (item) {
        return normalizePath(item.path) !== currentPath;
      }).slice(0, 3);

      related.innerHTML = relatedServices.map(function (item) {
        return '<li><a href=\"' + withBase(item.path) + '\">' + item.title + '</a></li>';
      }).join('');
    }

    if (reviewProof) {
      applyReviewSnapshot('#service-review-proof');
    }

    injectFaqSchema(service);
  }

  renderHub();
  renderServicePage();
})();
