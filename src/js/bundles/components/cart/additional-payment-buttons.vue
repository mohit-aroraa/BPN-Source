<template>
  <div
    class="additional-checkout-buttons-container"
    :class="{ 'additional-checkout-buttons-container--padding': loaded }"
  >
    <div class="additional-checkout-buttons-text" v-if="loaded">
      Express Checkout
    </div>
    <div
      class="
        additional-checkout-buttons additional-checkout-buttons--horizontal
      "
      v-html="content"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'additionalPaymentButtons',
  data() {
    return {
      container: '',
      content: null,
      show: [],
      loaded: false,
      observer: null,
    };
  },
  methods: {
    displayButtons() {
      document
        .querySelectorAll('[data-shopify-buttoncontainer] li')
        .forEach((t) => {
          const setActive = this.show.some((item) => {
            const isActive = t.innerHTML.toLowerCase().includes(item);
            return isActive;
          });
          setActive && t.classList.add('active');
        });
    },
    isLoaded() {
      if (this.content && this.show.length) {
        const targetNode = document.querySelector('#dynamic-checkout-cart');
        const config = { childList: true, subtree: true };
        const callback = (mutationList, observer) => {
          for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
              this.displayButtons();
              this.loaded = true;
              this.$emit('payment-buttons-loaded', true);
            }
          }
        };
        this.observer = new MutationObserver(callback);
        this.observer.observe(targetNode, config);
      }
    },
  },
  created() {
    window.BPN &&
      window.BPN.additionalCheckoutButtons &&
      window.BPN.additionalCheckoutButtons.enable &&
      ((this.content = window.BPN.additionalCheckoutButtons?.content),
      (this.show = window.BPN.additionalCheckoutButtons?.show));
  },
  mounted() {
    this.isLoaded();
  },
  beforeDestroy() {
    this.observer.disconnect();
  },
};
</script>
