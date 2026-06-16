<template>
  <div class="cartLoader" :class="{ wrap: hasSectionTitle }">
    <div
      class="cartLoader__title--section animate"
      v-if="hasSectionTitle"
    ></div>
    <div class="cartLoader__left animate"></div>
    <div class="cartLoader__right">
      <div class="cartLoader__title animate"></div>
      <div class="cartLoader__color animate"></div>
      <div class="cartLoader__counter"></div>
      <div class="cartLoader__action animate"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CartShimmer',
  props: {
    hasSectionTitle: {
      default: false,
      type: Boolean,
    },
  },
};
</script>
