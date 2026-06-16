<template>
  <div class="quiz-product-drawer-backdrop" :class="{visible: isOpen}"></div>
  <div class="quiz-product-drawer" :class="{visible: isOpen}" v-click-outside="closeDrawer">
    <div class="quiz-product-drawer__header">
      <button
        class="quiz-product-drawer__header-trigger"
        @click="closeDrawer"
        aria-label="Close cart"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.961539" y="0.961538" width="30.0769" height="30.0769" rx="15.0385" fill="white" stroke="#CCCCCC"
                stroke-width="1.92308" />
          <path
            d="M11.2 22L10 20.8L14.8 16L10 11.2L11.2 10L16 14.8L20.8 10L22 11.2L17.2 16L22 20.8L20.8 22L16 17.2L11.2 22Z"
            fill="black" stroke="black" stroke-width="0.5" />
        </svg>
      </button>
    </div>

    <div class="quiz-product-drawer__content">
      <swiper
        @swiper="setFirstSwiper"
        class="quiz-product-drawer__gallery"
        :modules="[Lazy,Controller]"
        slides-per-view="auto"
        :space-between="12"
        lazy
        preventClicks
        direction="horizontal"
        @slideChange="onSlideChange"
        @touchEnd="onTouchEnd"
      >
        <swiper-slide
          v-for="(item, index) in images"
          class="drawer-slide"
          :key="`product-card-${index}`"
        >
          <img class="quiz-product-drawer__image" :src="item.src" :alt="item.alt" />
        </swiper-slide>

        <div class="quiz-product-drawer__gallery-navigation-container">
          <button class="quiz-product-drawer__gallery-navigation prev" @click.prevent.stop="slideSlider('prev')"
                  v-show="galleryIndex !== 0">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="27.0385" y="27.0385" width="26.0769" height="26.0769" rx="13.0385"
                    transform="rotate(180 27.0385 27.0385)" fill="white" stroke="#CCCCCC" stroke-width="1.92308" />
              <path d="M15.75 8.75L9.625 14L15.75 19.25" stroke="#333333" stroke-width="1.92308" stroke-linecap="square"
                    stroke-linejoin="round" />
            </svg>
          </button>
          <button class="quiz-product-drawer__gallery-navigation next" @click.prevent.stop="slideSlider('next')"
                  v-show="galleryIndex !== images.length - 1">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="0.961539" y="0.961538" width="26.0769" height="26.0769" rx="13.0385" fill="white"
                    stroke="#CCCCCC"
                    stroke-width="1.92308" />
              <path d="M12.25 19.25L18.375 14L12.25 8.75" stroke="#333333" stroke-width="1.92308"
                    stroke-linecap="square"
                    stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </swiper>

      <Accordion
        v-show="accordionItems.length !== 0"
        :on-accordion-item-select="onAccordionItemSelect"
        :accordionIndex="accordionIndex"
        :activeVariantTitle="activeVariantTitle"
        :accordionItems="accordionItems"
      />
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { Controller, Lazy } from 'swiper';

import { EVENTS } from './constatns';

import { Swiper, SwiperSlide } from 'swiper/vue';
import { lockBodyScroll, unlockBodyScroll } from '../../helpers/common';
import Accordion from './Accordion.vue';

const isOpen = ref(false);
const swiperRef = ref(null);
const activeVariantTitle = ref('');
const productData = ref({});
const galleryIndex = ref(0);
const isTouchable = ref(false);
const accordionIndex = ref(0);

const setFirstSwiper = (swiper) => {
  swiperRef.value = swiper;
};

const resetSwiper = () => {
  if (swiperRef.value) {
    galleryIndex.value = 0;
    swiperRef.value.slideTo(galleryIndex.value);
  }
};

const onTouchEnd = () => {
  isTouchable.value = true;

  setTimeout(() => {
    isTouchable.value = false;
  }, 300);

  return false;
};

const openDrawer = (event) => {
  resetSwiper();

  productData.value = event.detail.productData;
  activeVariantTitle.value = event.detail.activeVariantTitle;

  isOpen.value = true;

  lockBodyScroll();
};

const closeDrawer = () => {
  if (isTouchable.value) return;

  if (isOpen.value === false) {
    return;
  }

  resetSwiper();

  isOpen.value = false;

  accordionIndex.value = 0;

  unlockBodyScroll();
};

onMounted(() => {
  document.addEventListener(EVENTS.QUIZ_PRODUCT_DRAWER_OPEN, openDrawer);
});

onUnmounted(() => {
  document.removeEventListener(EVENTS.QUIZ_PRODUCT_DRAWER_OPEN, openDrawer);
});

const shouldShowImage = originalAlt => {
  const title = productData.value.title.toLowerCase();
  const alt = originalAlt.toLowerCase();

  if (alt.includes('@exclude')) {
    return false;
  }

  return alt.includes('@common') || alt.includes(title) || alt.includes(activeVariantTitle.value);
};

const onAccordionItemSelect = (index) => {
  accordionIndex.value = index;
};

const onSlideChange = (swiper) => {
  galleryIndex.value = swiper.activeIndex;
};

const slideSlider = (navigation) => {
  galleryIndex.value = navigation === 'prev' ? galleryIndex.value - 1 : galleryIndex.value + 1;

  if (swiperRef.value) {
    swiperRef.value.slideTo(galleryIndex.value);
  }
};

const images = computed(() => {
  if (Array.isArray(productData.value.images)) {
    return productData.value.images.filter(image => shouldShowImage(image.alt || ''));
  }

  return [];
});

const accordionItems = computed(() => {
  if (Array.isArray(productData.value.information_list)) {
    return productData.value.information_list;
  }

  return [];
});

watch(() => productData.value, () => {
  resetSwiper();
});


</script>

