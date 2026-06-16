<template>
  <div class="pdp-discount-code-banner" v-if="configuration.showCouponCodeBanner">
    {{ configuration.couponCodeInfo }}
    <button type="button" :aria-label="'Copy coupon code ' + configuration.couponCode" title="copy to clipboard"
      class="coupon-code" data-vue-coupon @click="copyCode">
      <span class="code-wrapper">
        <span class="code" :class="{ 'slide-out': copied }">{{ configuration.couponCode }}</span>
        <span class="copied" :class="{ 'slide-in': copied }">Code Copied!</span>
      </span>
      <svg aria-hidden="true" title="copy to clipboard" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path
          d="M384 336l-192 0c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l133.5 0c4.2 0 8.3 1.7 11.3 4.7l58.5 58.5c3 3 4.7 7.1 4.7 11.3L400 320c0 8.8-7.2 16-16 16zM192 384l192 0c35.3 0 64-28.7 64-64l0-197.5c0-17-6.7-33.3-18.7-45.3L370.7 18.7C358.7 6.7 342.5 0 325.5 0L192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-48 0 0 16c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16l0-256c0-8.8 7.2-16 16-16l16 0 0-48-16 0z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const copied = ref(false);

const configuration = ref({
  couponCode: null,
  showCouponCodeBanner: false,
  couponCodeInfo: null,
});

const copyCode = () => {
  if (copied.value) return;

  const code = configuration.value.couponCode?.trim();
  if (!code) return;

  if (!navigator.clipboard) {
    console.error('Clipboard API not available');
    return;
  }
  writeToClipboard(code, () => {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  });
};

const initNonVueCouponCodes = () => {
  const couponCodeElements = document.querySelectorAll('.coupon-code:not([data-vue-coupon])');

  if (!navigator.clipboard) {
    console.error('Clipboard API not available');
    return;
  }

  couponCodeElements.forEach((element) => {
    if (element.dataset.initialized) return;
    element.dataset.initialized = 'true';

    element.addEventListener('click', () => {
      const codeEl = element.querySelector('.code');
      const copiedEl = element.querySelector('.copied');
      if (!codeEl || codeEl.classList.contains('slide-out')) return;

      const code = codeEl.innerText.trim();

      writeToClipboard(code, () => {
        codeEl.classList.add('slide-out');
        copiedEl?.classList.add('slide-in');
        setTimeout(() => {
          codeEl.classList.remove('slide-out');
          copiedEl?.classList.remove('slide-in');
        }, 2000);
      });
    });
  });
};

const writeToClipboard = (code, onSuccess) => {
  return navigator.clipboard.writeText(code).then(() => {
    onSuccess();
    // Optionally return a cleanup function if needed
  }).catch((error) => {
    console.error('Failed to copy code:', error);
  });
};

onMounted(() => {
  initNonVueCouponCodes();
  configuration.value = {
    couponCode: window.theme.discountBanner?.couponCode || null,
    showCouponCodeBanner: window.theme.discountBanner?.showInCart || false,
    couponCodeInfo: window.theme.discountBanner?.couponCodeInfo || null,
  };
});
</script>
