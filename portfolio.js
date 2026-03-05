/* Portfolio page filter + lightbox logic */
(function () {
  'use strict';

  var filters = Array.prototype.slice.call(document.querySelectorAll('.pf-filter'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.pf-item'));

  if (!filters.length || !items.length) return;

  var currentFilter = 'all';
  var currentLightboxIndex = -1;
  var touchStartX = 0;
  var touchEndX = 0;

  var lightbox = document.getElementById('pf-lightbox');
  var lightboxImg = document.getElementById('pf-lightbox-img');
  var lightboxType = document.getElementById('pf-lightbox-type');
  var lightboxLocation = document.getElementById('pf-lightbox-location');
  var lightboxDetail = document.getElementById('pf-lightbox-detail');
  var lightboxClose = document.getElementById('pf-lightbox-close');
  var lightboxPrev = document.getElementById('pf-lightbox-prev');
  var lightboxNext = document.getElementById('pf-lightbox-next');
  var lightboxBackdrop = lightbox ? lightbox.querySelector('[data-lightbox-close]') : null;
  var lightboxFigure = lightbox ? lightbox.querySelector('.pf-lightbox__figure') : null;

  function visibleItems() {
    return items.filter(function (item) { return !item.classList.contains('is-hidden'); });
  }

  function updateFilterCounts() {
    filters.forEach(function (btn) {
      var cat = btn.dataset.filter || 'all';
      var count = cat === 'all'
        ? items.length
        : items.filter(function (item) { return item.dataset.cat === cat; }).length;
      var badge = btn.querySelector('.pf-filter__count');
      if (badge) badge.textContent = String(count);
    });
  }

  function applyFilter(cat) {
    currentFilter = cat;
    filters.forEach(function (btn) {
      var isActive = (btn.dataset.filter || 'all') === cat;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    items.forEach(function (item) {
      var match = cat === 'all' || item.dataset.cat === cat;
      item.classList.toggle('is-hidden', !match);
      item.setAttribute('aria-hidden', match ? 'false' : 'true');

      if (match) {
        item.classList.remove('is-visible');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            item.classList.add('is-visible');
          });
        });
      }
    });
  }

  function updateLightboxFrame(item) {
    if (!lightbox || !lightboxImg || !item) return;
    var image = item.querySelector('img');
    if (!image) return;

    lightboxImg.src = image.currentSrc || image.src;
    lightboxImg.alt = image.alt || 'Project image preview';
    lightboxType.textContent = item.dataset.type || 'Landscape Project';
    lightboxLocation.textContent = item.dataset.location || 'Scottsdale, AZ';
    lightboxDetail.textContent = item.dataset.detail || 'Design-build landscape project by Think Green.';
  }

  function openLightboxByItem(item) {
    var visible = visibleItems();
    var index = visible.indexOf(item);
    if (index === -1 || !lightbox) return;

    currentLightboxIndex = index;
    updateLightboxFrame(visible[currentLightboxIndex]);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentLightboxIndex = -1;
  }

  function moveLightbox(step) {
    var visible = visibleItems();
    if (!visible.length || currentLightboxIndex < 0) return;
    currentLightboxIndex = (currentLightboxIndex + step + visible.length) % visible.length;
    updateLightboxFrame(visible[currentLightboxIndex]);
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFilter(this.dataset.filter || 'all');
    });
  });

  items.forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Open project preview');

    item.addEventListener('click', function () {
      openLightboxByItem(item);
    });

    item.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightboxByItem(item);
      }
    });
  });

  if (lightbox) {
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () { moveLightbox(-1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function () { moveLightbox(1); });

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    if (lightboxFigure) {
      lightboxFigure.addEventListener('touchstart', function (event) {
        touchStartX = event.changedTouches[0].clientX;
      }, { passive: true });

      lightboxFigure.addEventListener('touchend', function (event) {
        touchEndX = event.changedTouches[0].clientX;
        var delta = touchEndX - touchStartX;
        if (Math.abs(delta) < 40) return;
        if (delta > 0) moveLightbox(-1);
        else moveLightbox(1);
      }, { passive: true });
    }
  }

  window.addEventListener('keydown', function (event) {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });

  updateFilterCounts();
  applyFilter(currentFilter);
})();
