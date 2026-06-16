(function () {
  var MOBILE_BP = 768;

  function initSection(section) {
    var panels = Array.prototype.slice.call(section.querySelectorAll('[data-ia-panel]'));
    if (!panels.length || section.dataset.iaReady) return;
    section.dataset.iaReady = '1';

    function activate(panel) {
      panels.forEach(function (p) {
        var isTarget = p === panel;
        p.classList.toggle('is-active', isTarget);
        var trigger = p.querySelector('[data-ia-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
      });
    }

    panels.forEach(function (panel) {
      var trigger = panel.querySelector('[data-ia-trigger]');

      // Desktop: expand on hover
      panel.addEventListener('mouseenter', function () {
        if (window.innerWidth >= MOBILE_BP) activate(panel);
      });

      // Desktop: expand on keyboard focus of the trigger button
      if (trigger) {
        trigger.addEventListener('focus', function () {
          if (window.innerWidth >= MOBILE_BP) activate(panel);
        });

        // Mobile: trigger button click toggles
        trigger.addEventListener('click', function (e) {
          if (window.innerWidth < MOBILE_BP) {
            e.stopPropagation();
            if (panel.classList.contains('is-active')) {
              panel.classList.remove('is-active');
              trigger.setAttribute('aria-expanded', 'false');
            } else {
              activate(panel);
            }
          }
        });
      }

      // Keyboard: Enter or Space on panel div (covers edge cases)
      panel.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (panel.classList.contains('is-active')) {
          if (window.innerWidth < MOBILE_BP) {
            panel.classList.remove('is-active');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
          }
        } else {
          activate(panel);
        }
      });
    });
  }

  function bootAll() {
    document.querySelectorAll('.img-acc').forEach(initSection);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootAll);
  } else {
    bootAll();
  }
})();
