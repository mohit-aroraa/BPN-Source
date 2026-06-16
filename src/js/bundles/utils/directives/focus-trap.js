const focusTrapDirective = {
  beforeMount(el, binding) {
    if (!el) {
      return;
    }

    const focusElements = el.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
    );

    if (!focusElements.length) {
      console.warn('[focus-trap] No focusable elements found inside the target element.');
      return;
    }

    const firstItem = focusElements[0];
    const lastItem = focusElements[focusElements.length - 1];

    el.__focusTrapHandlers__ = {
      handleTabKey: (e) => {
        if (e.key === 'Tab') {
          if (!e.shiftKey && document.activeElement === lastItem) {
            e.preventDefault();
            firstItem.focus();
          } else if (e.shiftKey && document.activeElement === firstItem) {
            e.preventDefault();
            lastItem.focus();
          }
        }
      },
      handleEscapeKey: (e) => {
        if (e.key === 'Escape' && binding.value) {
          binding.value(el);
        }
      },
    };

    firstItem.focus();

    document.addEventListener('keydown', el.__focusTrapHandlers__.handleTabKey);
    document.addEventListener('keyup', el.__focusTrapHandlers__.handleEscapeKey);
  },

  unmounted(el) {
    if (el?.__focusTrapHandlers__) {
      document.removeEventListener('keydown', el.__focusTrapHandlers__.handleTabKey);
      document.removeEventListener('keyup', el.__focusTrapHandlers__.handleEscapeKey);
      delete el.__focusTrapHandlers__;
    }
  },
};

export default focusTrapDirective;
