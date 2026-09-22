/* ==========================================================
   Raquel Muzquiz Gil, portfolio
   Shared interaction layer: nav, page transitions,
   scroll reveal, magnetic elements, tilt cards, counters.
   ========================================================== */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarse = window.matchMedia('(pointer: coarse)').matches;

  /* ---------------- nav overlay ---------------- */
  (function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.nav-overlay a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  })();

  /* ---------------- page transition curtain ---------------- */
  (function initTransitions() {
    var curtain = document.createElement('div');
    curtain.className = 'transition-curtain';
    document.body.insertBefore(curtain, document.body.firstChild);

    requestAnimationFrame(function () {
      document.body.classList.add('is-revealed');
    });

    if (reducedMotion) return;

    document.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      var url;
      try { url = new URL(href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;

      var samePage = url.pathname === window.location.pathname;
      if (samePage && url.hash) return; // let smooth-scroll handle in-page anchors

      e.preventDefault();
      document.body.classList.remove('is-revealed');
      document.body.classList.add('is-leaving');
      setTimeout(function () {
        window.location.href = href;
      }, 650);
    });
  })();

  /* ---------------- scroll reveal: fade-in blocks ---------------- */
  (function initFadeIn() {
    var els = document.querySelectorAll('.fade-in:not(.visible)');
    if (!els.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    els.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------------- scroll reveal: split-text lines ---------------- */
  (function initSplitText() {
    var targets = document.querySelectorAll('[data-split]');
    if (!targets.length) return;

    targets.forEach(function (el) {
      var text = el.textContent;
      el.textContent = '';
      text.split(/(\s+)/).forEach(function (part) {
        if (part.trim() === '') {
          el.appendChild(document.createTextNode(part));
          return;
        }
        var outer = document.createElement('span');
        outer.className = 'split-word';
        var inner = document.createElement('span');
        inner.className = 'split-word-inner';
        inner.textContent = part;
        outer.appendChild(inner);
        el.appendChild(outer);
      });
      var i = 0;
      el.querySelectorAll('.split-word-inner').forEach(function (w) {
        w.style.setProperty('--i', i++);
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    targets.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------------- magnetic elements ---------------- */
  (function initMagnetic() {
    if (isCoarse || reducedMotion) return;
    document.querySelectorAll('.magnetic').forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic-strength')) || 0.35;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * strength;
        var y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0,0)';
      });
    });
  })();

  /* ---------------- tilt cards ---------------- */
  (function initTilt() {
    if (isCoarse || reducedMotion) return;
    document.querySelectorAll('.tilt-card').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(700px) rotateX(' + (-py * 8) + 'deg) rotateY(' + (px * 8) + 'deg) scale(1.02)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  })();

  /* ---------------- count-up numbers ---------------- */
  (function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var duration = 1300;
      var start = null;

      if (reducedMotion) {
        el.textContent = prefix + target.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        return;
      }

      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        var formatted = val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        el.textContent = prefix + formatted + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { observer.observe(el); });
  })();

  /* ---------------- grain overlay ---------------- */
  (function initGrain() {
    var grain = document.createElement('div');
    grain.className = 'grain';
    document.body.appendChild(grain);
  })();

})();
