<template>
  <div class="up-sell">
    <h3 class="up-sell__heading">{{ upsellTitle }}</h3>

    <swiper ref="swiperRef" class="up-sell__list" :modules="[Lazy, FreeMode]" slides-per-view="auto" :space-between="16"
      free-mode mousewheel lazy preventClicks direction="horizontal" @touchEnd="onTouchEnd">
      <swiper-slide v-for="item in items" :key="`up-sell-slide-${item.id}`">
        <UpSellSlide :item="item" @addProductAction="onAddProductClick" :showRecommendedStack="showRecommendedStack" />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Lazy, FreeMode } from 'swiper';

import UpSellSlide from './up-sell-slide.vue';

import { ACTIONS } from './constants';

const swiperRef = ref(null);

const emit = defineEmits([ACTIONS.ADD_PRODUCT]);

const onAddProductClick = (productId) => {
  emit(ACTIONS.ADD_PRODUCT, productId);
};

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  onTouch: {
    type: Function,
  },
  showRecommendedStack: {
    type: Boolean,
    default: false,
  },
});

watch(
  () => props.items,
  async () => {
    await nextTick();
    if (swiperRef.value?.swiper) {
      swiperRef.value.swiper.update();
    }
  },
  { deep: true },
);

const upsellTitle = computed(() => {
  if (props.showRecommendedStack) {
    return window.BPN.cart.recommendedStackTitle;
  }

  return window.BPN.cart.upsellTitle;
});

const onTouchEnd = () => {
  props.onTouch(true);

  setTimeout(() => {
    props.onTouch(false);
  }, 300);

  return false;
};

</script>
