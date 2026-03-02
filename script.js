/* =========================================================
   Think Green Design | Build Landscape — Script
   ========================================================= */

(function () {
  'use strict';

  /* ----- Navigation scroll state ----- */
  const header = document.getElementById('site-header');

  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ----- Mobile nav toggle ----- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- Smooth scroll for anchor links ----- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ----- Contact form handling ----- */
  const form = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      let valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#c62828';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      if (!valid) return;

      // Simulate submission — in production connect to Netlify Forms or a backend
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(function () {
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
      }, 800);
    });

    // Clear error state on input
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        this.style.borderColor = '';
      });
    });
  }

  /* ----- Intersection Observer: fade-in sections ----- */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll(
      '.service-card, .process-step, .testimonial-card, .area-item, .portfolio-item'
    ).forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease ' + (i * 0.06) + 's, transform 0.5s ease ' + (i * 0.06) + 's';
      el.classList.add('observe-me');
      observer.observe(el);
    });

    // Inject visible state styles
    const style = document.createElement('style');
    style.textContent = '.is-visible { opacity: 1 !important; transform: none !important; }';
    document.head.appendChild(style);
  }

  /* ----- Phone number formatting helper ----- */
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      let val = this.value.replace(/\D/g, '');
      if (val.length >= 10) {
        val = '(' + val.slice(0, 3) + ') ' + val.slice(3, 6) + '-' + val.slice(6, 10);
      }
      this.value = val;
    });
  }

})();
