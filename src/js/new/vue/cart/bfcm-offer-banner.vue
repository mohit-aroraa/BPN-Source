<template>
  <div class="bfcm-offer-banner-cart">
    <span class="bfcm-sale-text"></span>
    <span v-show="props.showTimer" class="bfcm-countdown"></span>
  </div>
</template>

<script setup>
const props = defineProps({
  showTimer: {
    type: Boolean,
    default: () => false,
  },
})
</script>
