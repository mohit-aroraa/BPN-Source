<template>
  <div class="progress-bar">
    <p class="progress-bar__text" v-html="freeDeliveryLabel" />
    <div class="progress-bar__wrapper">
      <div class="progress-bar__threshold">{{ configuration.currencySymbol }}0</div>
      <div class="progress-bar__container">
        <div class="progress-bar__pointer" :style="{ width: freeShippingProgressPercentage + '%' }"></div>
      </div>
      <div class="progress-bar__threshold">
        {{ getFormattedPrice(configuration.freeDeliveryThreshold, configuration.currencySymbol) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

import { getFormattedPrice } from './helpers';

const props = defineProps({
  itemsSubtotalPrice: {
    type: Number,
    default: () => 0,
  },
});

const configuration = ref({
  currencySymbol: window.BPN?.cart?.currencySymbol || '',
  freeDeliveryThreshold: window.BPN.cart.freeDeliveryThreshold,
});

const shippingLabel = ref({
  before: `You're <b>${getFormattedPrice(configuration.value.freeDeliveryThreshold - props.itemsSubtotalPrice, configuration.value.currencySymbol)}</b> away from <b>FREE SHIPPING</b> (US Only)`,
  after: `🎉 Congrats! You've unlocked <b> FREE</b> shipping!`,
});

const freeShippingProgressPercentage = computed(() => {
  return (props.itemsSubtotalPrice / configuration.value.freeDeliveryThreshold) * 100;
});

const freeDeliveryLabel = computed(() => {
  const enableGwp = window?.theme?.bfcm?.enableGwp || false;
  const enableTimer = window?.theme?.bfcm?.enableTimer || false;
  const shippingLabelAfter = window?.theme?.bfcm?.shippingLabelAfter || shippingLabel.value.after;
  const shippingLabelBefore = window?.theme?.bfcm?.shippingLabelBefore || shippingLabel.value.before;
  // Sale is active for GWP only if enableGwp is true AND (timer disabled OR sale active)
  const showGwp = enableGwp && (
    enableTimer
      ? (window?.theme?.bfcm?.saleActive || false)
      : true
  );

  if (freeShippingProgressPercentage.value >= 100) {
    if (showGwp) {
      return shippingLabelAfter;
    } else {
      return shippingLabel.value.after
    }
  }

  if (showGwp) {
    return shippingLabelBefore.replace('%X%', getFormattedPrice(configuration.value.freeDeliveryThreshold - props.itemsSubtotalPrice, configuration.value.currencySymbol));
  } else {
    return shippingLabel.value.before
  }
});

</script>
