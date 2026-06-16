<template>
  <section class="special-announcement-banner cart-banner" v-if="configuration.showInCart && configuration.bannerText">
    <div v-html="configuration.bannerText"></div>
  </section>
</template>

<script setup>
import { ref } from 'vue';

const getInitialConfiguration = () => {
  if (typeof window === 'undefined') {
    return { bannerText: null, showInCart: false };
  }
  const config = window.theme?.announcementBanner;
  return {
    bannerText: config?.bannerText ?? null,
    showInCart: config?.showInCart ?? false,
  };
};

const configuration = ref(getInitialConfiguration());
</script>
