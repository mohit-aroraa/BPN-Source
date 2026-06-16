<template>
  <div class="progress-bar-v2">
    <div class="progress-bar-v2__body">
      <div class="progress-bar-v2__thresholds">
        <template v-for="(threshold, idx) in thresholds" :key="'label-' + threshold.amount">
          <div class="progress-bar-v2__threshold" :style="{ left: bullets[idx + 1].position + '%' }">
            {{ getFormattedPrice(threshold.amount, currencySymbol).replace('.00', '') }}
          </div>
        </template>
      </div>
      <div class="progress-bar-v2__wrapper">
        <div class="progress-bar-v2__container">
          <div class="progress-bar-v2__pointer" :style="{ width: progressPercent + '%' }"></div>
          <div v-for="(bullet, idx) in bullets" :key="'bullet-' + idx" class="progress-bar-v2__bullet"
            :class="{ 'progress-bar-v2__bullet--active': subtotal >= bullet.amount }"
            :style="{ left: bullet.position + '%' }"></div>
        </div>
      </div>
      <div class="progress-bar-v2__thresholds">
        <template v-for="(threshold, idx) in thresholds" :key="'label-' + threshold.amount">
          <div class="progress-bar-v2__threshold" :style="{ left: bullets[idx + 1].position + '%' }">
            {{ threshold.label }}
          </div>
        </template>
      </div>
    </div>
    <div class="progress-bar-v2__message" v-html="progressMessage"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getFormattedPrice } from './helpers';

const props = defineProps({
  itemsSubtotalPrice: {
    type: Number,
    default: 0,
  },
});

// Hardcoded thresholds in cents
const thresholds = window.BPN?.cart?.thresholds.sort((a, b) => a.amount - b.amount)
const currencySymbol = window.BPN?.cart?.currencySymbol || '$';
const subtotal = computed(() => props.itemsSubtotalPrice);
const maxThreshold = thresholds[thresholds.length - 1]?.amount || 0;

const progressPercent = computed(() => {
  if (!subtotal.value || !thresholds.length) return 0;
  // If subtotal is below the first threshold
  if (subtotal.value <= thresholds[0].amount) {
    return (subtotal.value / thresholds[0].amount) * (100 / thresholds.length);
  }
  // If subtotal is above or equal to the last threshold
  if (subtotal.value >= thresholds[thresholds.length - 1].amount) {
    return 100;
  }
  // Find which segment the subtotal is in
  for (let i = 1; i < thresholds.length; i++) {
    if (subtotal.value <= thresholds[i].amount) {
      const prevAmount = thresholds[i - 1].amount;
      const segmentWidth = 100 / thresholds.length;
      const segmentProgress = (subtotal.value - prevAmount) / (thresholds[i].amount - prevAmount);
      return (i * segmentWidth) + segmentProgress * segmentWidth;
    }
  }
  return 100;
});

// Bullets: always thresholds.length + 1, spaced equally
const bullets = computed(() => {
  const count = thresholds.length + 1;
  return Array.from({ length: count }, (_, idx) => {
    const position = (idx / (count - 1)) * 100;
    // For amount, 0 for first, then each threshold amount
    let amount = idx === 0 ? 0 : thresholds[idx - 1]?.amount || maxThreshold;
    return { position, amount };
  });
});

const progressMessage = computed(() => {
  // Find the highest threshold reached
  let reachedIdx = -1;
  for (let i = 0; i < thresholds.length; i++) {
    if (subtotal.value >= thresholds[i].amount) reachedIdx = i;
  }
  // If at or above last threshold
  if (reachedIdx === thresholds.length - 1) {
    return `<b>Congrats!</b> You\'ve unlocked <b>${thresholds[reachedIdx]?.label}</b>!`;
  }
  // If below first threshold
  if (reachedIdx === -1) {
    const next = thresholds[0];
    const diff = next.amount - subtotal.value;
    return `You\'re <b>${getFormattedPrice(diff, currencySymbol)}</b> away from <b>${next.label}</b>!`;
  }
  // Between thresholds
  const next = thresholds[reachedIdx + 1];
  const diff = next.amount - subtotal.value;
  // Use custom message if available, else default
  if (next.message.includes('$X')) {
    return next.message.replace('$X', getFormattedPrice(diff, currencySymbol));
  }
  return `You\'re <b>${getFormattedPrice(diff, currencySymbol)}</b> away from <b>${next.label}</b>!`;
});
</script>