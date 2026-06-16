export default {
  props: {
    options: {
      type: Object,
      default: () => ({}),
    },
  },

  mounted() {
    const args = [
      (entries) => {
        entries.forEach((entry) => {
          this.$emit(
            entry.isIntersecting ? 'enter' : 'leave',
            this.$options.observer,
            entry,
          );
        });
      },
    ];

    if (Object.keys(this.options).length) {
      args.push(this.options);
    }

    this.$options.observer = new IntersectionObserver(...args);

    this.$nextTick(() => {
      if (this.$slots.default[0] !== undefined) {
        this.$options.observer.observe(this.$slots.default[0].elm);
      }
    });
  },

  destroyed() {
    this.$options.observer.disconnect();
  },

  render() {
    return this.$slots.default ? this.$slots.default[0] : null;
  },
};
