<template>
  <div class="bpn-product-content__images">
    <!-- Main image with navigation arrows overlay -->
    <div class="bpn-product-content__images-main">
      <button
        v-if="images.length > 1"
        class="bpn-product-content__images-nav-btn bpn-product-content__images-nav-btn--prev"
        @click="prevImage"
        aria-label="Previous image"
        :data-click-id="clickIdPrefix ? `${clickIdPrefix}_drawer_image_navigation` : ''"
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 1L1 6L6 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button
        v-if="images.length > 1"
        class="bpn-product-content__images-nav-btn bpn-product-content__images-nav-btn--next"
        @click="nextImage"
        aria-label="Next image"
        :data-click-id="clickIdPrefix ? `${clickIdPrefix}_drawer_image_navigation` : ''"
      >
        <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L6 6L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <img
        :src="currentImage.src"
        :alt="currentImage.alt || title"
        class="bpn-product-content__images-main-img"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      />
    </div>

    <!-- Image thumbnails -->
    <div v-if="showThumbnails && images.length > 1" class="bpn-product-content__images-thumbnails">
      <button
        v-for="(image, index) in images"
        :key="index"
        class="bpn-product-content__images-thumbnail-btn"
        :class="{ 'bpn-product-content__images-thumbnail-btn--active': currentIndex === index }"
        @click="currentIndex = index"
        :aria-label="`View image ${index + 1}`"
      >
        <img
          :src="image.src"
          :alt="`Thumbnail ${index + 1}`"
          class="bpn-product-content__images-thumbnail-img"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  images: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
  showThumbnails: {
    type: Boolean,
    default: true
  },
  clickIdPrefix: {
    type: String,
    default: ''
  }
});

// State
const currentIndex = ref(0);
const touchStartX = ref(0);
const touchEndX = ref(0);

// Computed properties
const currentImage = computed(() => {
  return props.images[currentIndex.value] || { src: '', alt: '' };
});

// Methods
const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0;
  }
};

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = props.images.length - 1;
  }
};

// Touch swipe handlers
const handleTouchStart = (e) => {
  touchStartX.value = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
  touchEndX.value = e.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  // Detect swipe direction and navigate accordingly
  const swipeThreshold = 50; // Minimum swipe distance to trigger navigation
  const swipeDistance = touchEndX.value - touchStartX.value;

  if (Math.abs(swipeDistance) >= swipeThreshold) {
    if (swipeDistance > 0) {
      // Swipe right - go to previous image
      prevImage();
    } else {
      // Swipe left - go to next image
      nextImage();
    }
  }
};

// Reset current index when images change
watch(() => props.images, () => {
  currentIndex.value = 0;
}, { deep: true });
</script>
