<template>
  <div class="quiz-product-card" :class="{[`${alignment}-product-card`]: true }">
    <div v-if="selectable" class="quiz-product-card__checkbox" @click="onSelectClick">
      <svg v-if="selected" class="icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
           viewBox="0 0 20 20"
           fill="none">
        <rect width="20" height="20" rx="3" fill="#EB1000" />
        <path d="M8.58351 12.6464L15.2038 5L16.2222 6.17637L8.58351 15L4 9.70549L5.0184 8.52912L8.58351 12.6464Z"
              fill="white" />
      </svg>
    </div>

    <div class="quiz-product-card__left">
      <div class="quiz-product-card__gallery-icon" @click.stop.prevent="onOpenGalleryClick">
        <CustomIcon name="gallery" />
      </div>

      <p class="quiz-product-card__badge" v-if="productData.has_badge">
        {{ productData.badge_title }}
      </p>

      <swiper
        @swiper="setFirstSwiper"
        class="quiz-product-card__gallery"
        :modules="[Lazy,Controller]"
        slides-per-view="1"
        :space-between="16"
        lazy
        preventClicks
        direction="horizontal"
        @slideChange="onSlideChange"
      >
        <swiper-slide
          v-for="(item, index) in images"
          :key="`product-card-${index}`"
        >
          <img class="quiz-product-card__image" :src="item.src" :alt="item.alt" />
        </swiper-slide>
        <button class="quiz-product-card__gallery-navigation prev" @click.prevent.stop="slideSlider('prev')"
                v-show="galleryIndex !== 0">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="27.0385" y="27.0385" width="26.0769" height="26.0769" rx="13.0385"
                  transform="rotate(180 27.0385 27.0385)" fill="white" stroke="#CCCCCC" stroke-width="1.92308" />
            <path d="M15.75 8.75L9.625 14L15.75 19.25" stroke="#333333" stroke-width="1.92308" stroke-linecap="square"
                  stroke-linejoin="round" />
          </svg>
        </button>
        <button class="quiz-product-card__gallery-navigation next" @click.prevent.stop="slideSlider('next')"
                v-show="galleryIndex !== images.length - 1">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="0.961539" y="0.961538" width="26.0769" height="26.0769" rx="13.0385" fill="white" stroke="#CCCCCC"
                  stroke-width="1.92308" />
            <path d="M12.25 19.25L18.375 14L12.25 8.75" stroke="#333333" stroke-width="1.92308" stroke-linecap="square"
                  stroke-linejoin="round" />
          </svg>
        </button>
      </swiper>
    </div>

    <div class="quiz-product-card__right">
      <div data-oke-star-rating class="quiz-product-card__rating"
           :data-oke-reviews-product-id="'shopify-' + productData.id"
           v-html="productData?.reviews_markup"
      />
      <div class="quiz-product-card__heading">
        <h3 class="quiz-product-card__title" v-text="title" />
        <h3 class="quiz-product-card__price" v-text="priceFormatted" />
      </div>
      <p class="quiz-product-card__description" v-text="description" />

      <div v-if="Array.isArray(productData.variants)" class="selector">
        <button class="selector__trigger" @click.stop.prevent="toggleDropdown(true)">
          <div class="label">
            <span v-if="activeVariant.variant_icon" v-html="activeVariant.variant_icon" class="icon-container" />
            <span class="selector__trigger-label">{{ activeVariant.title }}</span>
          </div>
          <svg
            @click.capture.stop="toggleDropdown(!isDropdownOpen)"
            class="icon"
            :class="{'active':  isDropdownOpen }"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path d="M8 9.28736L12.6669 4.53928L14 5.8956L8 12L2 5.8956L3.33312 4.53928L8 9.28736Z" fill="black" />
          </svg>
        </button>
        <div class="selector__dropdown" ref="dropdownRef" :class="{active: isDropdownOpen}"
             v-click-outside="closeDropdown">
          <p class="selector__dropdown-item"
             :class="{'active-item':  variant.id === activeVariant.id }"
             v-for="(variant, valueIndex) in productData.variants"
             :key="valueIndex"
             @click="onDropdownItemClick(variant)"
          >
            <span v-if="variant.variant_icon" v-html="variant.variant_icon" class="icon-container" />
            {{ variant.title }}</p>
        </div>
      </div>

      <button class="quiz-product-card__button" @click="onAddProductClick">Add to cart</button>
    </div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Lazy, Controller } from 'swiper';
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { fetchProductDetails } from '../../client/product';
import { getHandleFromUrl } from './helpers';
import { getFormattedPrice } from '../cart/helpers';
import { ACTIONS, EVENTS } from './constatns';
import cartMethods from '../../../bundles/utils/helpers/cart-helper';
import { openCartDrawerDelayed } from '../../components/product-drawer/cart-actions';
import CustomIcon from '../components/Icon/custom-icon.vue';

const emit = defineEmits([ ACTIONS.SELECT, ACTIONS.DROPDOWN ]);
const props = defineProps({
  selectable: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  isDropdownOpen: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  tag: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  price: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '',
  },
  alignment: {
    type: String,
    default: 'vertical',
    validator: (value) => {
      return [ 'vertical', 'horizontal' ].includes(value);
    },
  },
});

const dropdownRef = ref(null);
const swiperRef = ref(null);
const galleryIndex = ref(0);
const productData = ref({});

const activeVariant = ref(undefined);

const toggleDropdown = (value = false) => {
  const payload = {
    id: value ? props.id : undefined,
    tag: value ? props.tag : undefined,
  };

  emit(ACTIONS.DROPDOWN, payload);
};

const closeDropdown = () => {
  toggleDropdown(false);
};

const onDropdownItemClick = (variant) => {
  activeVariant.value = variant;

  closeDropdown(false);
};

onMounted(() => {
  const handle = getHandleFromUrl(props.link);

  if (handle) {
    fetchProductDetails(handle).then((data) => {
      productData.value = data;
    });
  }
});

const title = computed(() => {
  if (productData.value.title) {
    return productData.value.title;
  }

  return props.title;
});

const priceFormatted = computed(() => {
  if (productData.value.price) {
    return getFormattedPrice(productData.value.price, window.BPN?.cart?.currencySymbol);
  }

  return props.price;
});

const description = computed(() => {
  return productData.value.product_card_description;
});

const shouldShowImage = originalAlt => {
  const title = productData.value.title.toLowerCase();
  const variantTitle = activeVariant.value.title.toLowerCase();
  const alt = originalAlt.toLowerCase();

  if (alt.includes('@exclude')) {
    return false;
  }

  return alt.includes('@common') || alt.includes(title) || alt.includes(variantTitle);
};

const images = computed(() => {
  if (Array.isArray(productData.value.images)) {
    return productData.value.images.filter(image => shouldShowImage(image.alt || ''));
  }

  return [
    {
      src: props.image,
      alt: props.title,
    },
  ];
});

watch(() => productData.value.variants, () => {
  activeVariant.value = productData.value.variants.find(item => {
    return item.available === true;
  });
});

watch(() => activeVariant.value, () => {
  if (props.selectable) {
    emit(ACTIONS.SELECT, {
      productId: productData.value.id,
      variantId: props.selected ? activeVariant.value.id : undefined,
      price: activeVariant.value.price,
    });
  }

  if (swiperRef.value) {
    galleryIndex.value = 0;
    swiperRef.value.slideTo(galleryIndex.value);
  }
});

const setFirstSwiper = (swiper) => {
  swiperRef.value = swiper;
};

const onSlideChange = (swiper) => {
  galleryIndex.value = swiper.activeIndex;
};

const onOpenGalleryClick = () => {
  document.dispatchEvent(new CustomEvent(EVENTS.QUIZ_PRODUCT_DRAWER_OPEN, {
    detail: {
      productData: toRaw(productData.value),
      activeVariantTitle: activeVariant.value.title.toLowerCase(),
    },
  }));
};

const slideSlider = (navigation) => {
  galleryIndex.value = navigation === 'prev' ? galleryIndex.value - 1 : galleryIndex.value + 1;

  if (swiperRef.value) {
    swiperRef.value.slideTo(galleryIndex.value);
  }
};

const onSelectClick = () => {
  emit(ACTIONS.SELECT, {
    productId: productData.value.id,
    variantId: props.selected ? undefined : activeVariant.value.id,
    price: activeVariant.value.price,
  });
};

const onAddProductClick = async () => {
  try {
    await cartMethods.post('add', {
      id: parseInt(activeVariant.value.id), quantity: 1, properties: {},
    });

    openCartDrawerDelayed();
  } catch (e) {
    console.log(e);
  }
};

watch(() => props.isDropdownOpen, () => {
  if (props.isDropdownOpen === false) {
    dropdownRef.value.scrollTop = 0;
  }
});
</script>

