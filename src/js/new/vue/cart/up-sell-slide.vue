<template>
  <div class="up-sell__list-item">
    <p class="up-sell__list-item-badge" v-if="productData.has_badge">
      {{ productData.badge_title }}
    </p>
    <a class="up-sell__list-item-url" :href="productData.url" data-click-id="cart_upsells_thumbnail_clicks">
      <img class="up-sell__list-item-image" :src="getImageSrc(item)" :alt="item.title"
        data-click-id="cart_upsells_thumbnail_clicks" />
    </a>
    <div data-oke-star-rating class="up-sell__list-item-rating"
      :data-oke-reviews-product-id="'shopify-' + productData.id" v-html="productData?.reviews_markup"></div>

    <div class="up-sell__list-item-heading">
      <h4 class="up-sell__list-item-title">{{ item.title }}</h4>
      <span class="up-sell__list-item-price">{{ price }}</span>
    </div>

    <p class="up-sell__list-item-label">{{ productData.product_card_description }}</p>

    <div v-if="Array.isArray(item.options)" v-for="(option, optionIndex) in item.options" :key="item.name">
      <div class="selector" v-click-outside="closeSelector">
        <button class="selector__trigger" @click="onTriggerClick(optionIndex)"
          :class="{ active: optionIndex === activeSelector }">
          <span>{{ getActive(optionIndex + 1) }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 9.28736L12.6669 4.53928L14 5.8956L8 12L2 5.8956L3.33312 4.53928L8 9.28736Z" fill="black" />
          </svg>
        </button>
        <div class="selector__dropdown" :class="{ active: activeSelector === optionIndex }">
          <p class="selector__dropdown-item" :class="{ 'active-item': isActiveOption(optionIndex + 1, value) }"
            v-for="(value, valueIndex) in option.values" :key="valueIndex"
            @click="onDropdownItemClick(optionIndex + 1, value)">{{ value }}</p>
        </div>
      </div>
    </div>

    <button class="up-sell__list-item-button" @click.prevent="onAddProductClick()"
      data-click-id="cart_upsells_product_added">
      ADD TO CART
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ACTIONS } from './constants';
import { getFormattedPrice } from './helpers';
import { fetchProductDetails } from '../../client/product';

const emit = defineEmits([ACTIONS.ADD_PRODUCT]);

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  showRecommendedStack: {
    type: Boolean,
    default: () => false,
  },
});

const productData = ref({});

const activeSelector = ref(-1);

const activeVariant = ref(props.item.variants.find(item => {
  return item.available === true;
}));

onMounted(() => {
  fetchProductDetails(props.item.handle).then((data) => {
    productData.value = data;
  });
});

const closeSelector = () => {
  activeSelector.value = -1;
};

const getActive = (index) => {
  return activeVariant.value[`option${index}`];
};

const getImageSrc = (item) => {
  if (typeof item.images[0] === 'string') {
    return item.images[0];
  }

  return item.images[0].src;
};

const onAddProductClick = () => {
  emit(ACTIONS.ADD_PRODUCT, activeVariant.value.id);
};

const isActiveOption = (index, value) => {
  return activeVariant[`option${index}`] === value;
};

function isSubObject(target, sub) {
  return Object.entries(sub).every(([key, value]) => target[key] === value);
}

const onDropdownItemClick = (index, value) => {
  const sub = {
    option1: activeVariant.option1 || null,
    option2: activeVariant.option2 || null,
    option3: activeVariant.option3 || null,
  };

  sub[`option${index}`] = value;

  activeVariant.value = props.item.variants.find(item => isSubObject(item, sub));
  activeSelector.value = -1;
};

const onTriggerClick = (index) => {
  activeSelector.value = activeSelector.value === -1 ? index : -1;
};

const price = computed(() => {
  if (activeVariant.value.price) {
    if (typeof activeVariant.value.price === 'number') {
      return getFormattedPrice(activeVariant.value.price, window.BPN?.cart?.currencySymbol);
    } else {
      const priceInCents = Math.round(parseFloat(activeVariant.value.price) * 100);
      return getFormattedPrice(priceInCents, window.BPN?.cart?.currencySymbol);
    }
  }

  return '';
});

</script>
