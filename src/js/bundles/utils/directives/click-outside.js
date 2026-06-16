const clickOutsideDirective = {
  beforeMount(el, binding) {
    if (typeof binding.value !== 'function') {
      console.warn(`[Vue-click-outside:] provided expression '${binding.expression}' is not a function.`);
      return;
    }

    const bubble = binding.modifiers.bubble;
    const handler = (event) => {
      if (bubble || (!el.contains(event.target) && el !== event.target)) {
        binding.value(event);
      }
    };

    el.__vueClickOutside__ = handler;
    document.addEventListener('click', handler);
  },

  unmounted(el) {
    document.removeEventListener('click', el.__vueClickOutside__);
    delete el.__vueClickOutside__;
  },
};

export default clickOutsideDirective;
