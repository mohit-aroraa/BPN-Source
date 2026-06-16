<template>
  <div class="productGallery">
    <div
      class="productGallery__thumbnailWrapper swiper"
      ref="js-product-gallery-thumb"
    >
      <div class="productGallery__thumbnailList swiper-wrapper">
        <template v-for="image in media">
          <div
            class="swiper-slide"
            v-if="image.media_type === 'image'"
            :key="image.id"
          >
            <img
              :src="image.src + '&width=132'"
              :alt="title || image.alt"
              width="64"
              height="64"
              loading="lazy"
            />
          </div>
        </template>
      </div>
    </div>
    <div class="productGallery__swiper swiper" ref="js-product-gallery-slider">
      <div class="swiper-wrapper productGallery__swiperWrapper">
        <template v-for="(image, index) in media">
          <div
            class="swiper-slide productGallery__slide"
            v-if="image.media_type === 'image'"
            :key="image.id + 'gallery'"
          >
            <picture class="picture">
              <source
                media="(min-width: 0)"
                :srcset="`${image.src}&width=400 400w,${image.src}&width=600 800w,${image.src}&width=600 1200w,${image.src}&width=750 1600w,${image.src}&width=800 2400w`"
              />
              <img
                :src="`${image.src}&width=1080`"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :alt="title || image.alt"
                width="1080"
                height="1080"
                style="object-fit: cover"
              />
            </picture>
          </div>
        </template>
      </div>
      <!-- If we need pagination -->
      <div class="swiper-pagination swiper-pagination-pdp"></div>
      <!-- If we need navigation buttons -->
      <div class="swiper-button-pdp swiper-button-pdp-prev">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 19">
          <path
            d="M9 1 1.192 8.808a.61.61 0 0 0 0 .888L9 17.504"
            stroke="#1E1B1C"
            stroke-width="2"
            fill="none"
            fill-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div class="swiper-button-pdp swiper-button-pdp-next">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 19">
          <path
            d="m1 1 7.808 7.808a.61.61 0 0 1 0 .888L1 17.504"
            stroke="#1E1B1C"
            stroke-width="2"
            fill="none"
            fill-rule="evenodd"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
    <span
      class="productGallery__badge"
      v-if="badgeData.has_badge"
      :style="{
        '--badgeBgClr': badgeData.badge_background_color
          ? badgeData.badge_background_color
          : '#D9C79C',
        '--badgeTxtClr': badgeData.badge_text_color
          ? badgeData.badge_text_color
          : '#ffffff',
      }"
    >{{ badgeData.badge_title }}</span>
  </div>
</template>

<script>
import Swiper, {
  Navigation,
  Pagination,
  A11y,
  Thumbs,
  FreeMode,
  Mousewheel,
} from 'swiper';

export default  {
  name: 'PDPSlider',
  props: {
    media: {
      type: Array,
      required: true,
      default: [],
    },
    badgeData: {
      type: Object,
      required: false,
      default: {},
    },
    title: String,
  },
  data() {
    return {
      swiperThumbInstance: null,
      swiperGalleryInstance: null,
      swiperThumbWrapper: null,
      swiperGalleryWrapper: null,
    };
  },
  watch: {
    media: {
      handler() {
        this.$nextTick(() => {
          this.swiperThumbInstance.updateSize();
          this.swiperThumbInstance.updateSlides();
          this.swiperThumbInstance.updateSlidesClasses();
        });
      },
    },
  },
  mounted() {
    this.swiperThumbWrapper = this.$refs['js-product-gallery-thumb'];
    this.swiperGalleryWrapper = this.$refs['js-product-gallery-slider'];
    this.swiperThumbInstance = new Swiper(this.swiperThumbWrapper, {
      // Install modules
      modules: [A11y, FreeMode, Mousewheel],
      slidesPerView: 4.4,
      spaceBetween: 8,
      freeMode: true,
      watchSlidesProgress: true,
      threshold: 10,
      a11y: true,
      mousewheel: {
        releaseOnEdges: true,
      },
      breakpoints: {
        1365: {
          direction: 'vertical',
          slidesPerView: 7.4,
          spaceBetween: 12,
        },
      },
    });
    this.swiperGalleryInstance = new Swiper(this.swiperGalleryWrapper, {
      // Install modules
      modules: [Navigation, Pagination, A11y, Thumbs],
      thumbs: {
        swiper: this.swiperThumbInstance,
      },
      a11y: true,
      navigation: {
        nextEl: '.swiper-button-pdp-next',
        prevEl: '.swiper-button-pdp-prev',
      },
      pagination: {
        el: '.swiper-pagination-pdp',
        type: 'bullets',
        clickable: true,
      },
      breakpoints: {
        1365: {
          spaceBetween: 1,
        },
        1920: {
          spaceBetween: 2,
        },
      },
    });
  },
  methods: {
    onEnter(observer) {
      observer.disconnect();
    },
  },
};
</script>
