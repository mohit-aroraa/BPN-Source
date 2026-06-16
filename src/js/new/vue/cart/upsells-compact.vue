<template>
  <div class="upsells-compact">
    <div class="upsells-compact__title">
      Our Recommended Quick adds
    </div>
    <div class="upsells-compact__items">
      <Swiper :modules="[Lazy, FreeMode]" :slides-per-view="'auto'" :centered-slides-bounds="true" :space-between="8"
        free-mode mousewheel lazy preventClicks direction="horizontal" :a11y="false">
        <swiper-slide v-for="item in items" :key="`up-sell-compact-slide-${item.id}`">
          <UpsellCompactSlide :item="item" @addProductAction="addUpsellToCart" />
        </swiper-slide>
      </Swiper>
    </div>
  </div>
</template>

<script setup>
import { ACTIONS } from '../cart/constants';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Lazy, FreeMode } from 'swiper';
import UpsellCompactSlide from './upsell-compact-slide.vue';


const emit = defineEmits([ACTIONS.ADD_PRODUCT]);

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  }
});

const addUpsellToCart = (productId) => {
  emit(ACTIONS.ADD_PRODUCT, productId);
}
</script>
