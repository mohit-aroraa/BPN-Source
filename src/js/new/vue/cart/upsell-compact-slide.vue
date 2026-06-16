<template>
  <div class="upsells-compact__item">
    <div class="upsells-compact__item-image-wrapper">
      <img class="upsells-compact__item-image" :src="item.images[0] || item.images[0].src" />
    </div>
    <div class="upsells-compact__item-info">
      <div class="upsells-compact__item-title">{{ item.title }}</div>
      <VariantSelector v-if="item.variants.length > 1" :variants="item.variants" :options="item.options"
        :variationsMeta="item.variants" v-model="item.selectedVariantId" @update:modelValue="onVariantChange" />
      <button :disabled="!item.selectedVariant?.available" @click="addUpsellToCart()" class="upsells-compact__item-add">
        Add to Cart | {{ price(item.selectedVariant) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted } from 'vue';
import { ACTIONS } from '../cart/constants';
import { getFormattedPrice } from '../cart/helpers';
import VariantSelector from '../../components/product-drawer/vue/variant-selector.vue';
const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  }
});

onMounted(() => {
  if (props.item.variants && props.item.variants.length > 0 && !props.item.selectedVariant) {
    props.item.selectedVariant = props.item.variants[0];
    props.item.selectedVariantId = props.item.selectedVariant.id;
  }
});
watch(() => props.item, (newItem) => {
  if (newItem && newItem.variants && newItem.variants.length > 0 && !newItem.selectedVariant) {
    newItem.selectedVariant = newItem.variants[0];
    newItem.selectedVariantId = newItem.selectedVariant.id;
  }
}, { deep: true });

const emit = defineEmits([ACTIONS.ADD_PRODUCT]);

const addUpsellToCart = () => {
  emit(ACTIONS.ADD_PRODUCT, props.item.selectedVariantId);
}

const price = (product) => {
  if (product?.price) {
    if (typeof product.price === 'number') {
      return getFormattedPrice(product.price, window.BPN?.cart?.currencySymbol);
    } else {
      const priceInCents = Math.round(parseFloat(product?.price) * 100);
      return getFormattedPrice(priceInCents, window.BPN?.cart?.currencySymbol);
    }
  }

  return '';
};

const onVariantChange = (variantId) => {
  const newVariant = props.item.variants.find(v => v.id === variantId);
  if (newVariant) {
    props.item.selectedVariant = newVariant
    props.item.selectedVariantId = newVariant.id
  }
};


</script>
