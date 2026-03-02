/* Portfolio page filter logic */
(function () {
  'use strict';

  var filters = document.querySelectorAll('.pf-filter');
  var items   = document.querySelectorAll('.pf-item');

  if (!filters.length) return;

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = this.dataset.filter;

      /* Update active button */
      filters.forEach(function (b) { b.classList.remove('is-active'); });
      this.classList.add('is-active');

      /* Show / hide items */
      items.forEach(function (item) {
        var match = cat === 'all' || item.dataset.cat === cat;
        item.classList.toggle('is-hidden', !match);

        /* Re-trigger reveal animation */
        if (match) {
          item.classList.remove('is-visible');
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              item.classList.add('is-visible');
            });
          });
        }
      });
    });
  });
})();
