<template>
  <div class="line-item bfcm-gift">
    <div class="line-item__left">
      <a class="line-item__link" data-click-id="cart_thumbnail_clicks">
        <img class="line-item__image" :src="imageUrl || freeGift.image" :alt="freeGift?.title"
          data-click-id="cart_thumbnail_clicks" />
      </a>
    </div>
    <div class="line-item__right">
      <div class="line-item__details">
        <div>
          <h4 v-html="`<span class='free-tag'>FREE </span>` + freeGift.title" class="line-item__heading" />
          <div class="line-item__info">
            <span v-if="props.added">
              {{ gwpConfig.lineItemMessageWhenAdded }}
            </span>
            <span v-else>
              {{ gwpConfig.lineItemMessageWhenNotAdded }}
            </span>
            <!-- <span class="bfcm-countdown"></span> -->
          </div>
          <VariantSelector v-if="freeGift.variants?.length > 1 && added && !restrictVariantSelection"
            :variants="freeGift.variants" :options="freeGift.options" :variationsMeta="freeGift.variants"
            v-model="selectedVariantId" @update:modelValue="onVariantChange($event, freeGift)" />
        </div>


        <div class="line-item__price">
          <span class="sale">FREE</span>
          <span class="compare" v-text="getFormattedPrice(freeGift?.price, currencySymbol)"></span>
          <button v-if="props.itemsSubtotalPrice > 9900" @click="addGiftToCart()" class="line-item__add">
            Add <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M7.33398 8.66683H3.33398V7.3335H7.33398V3.3335H8.66732V7.3335H12.6673V8.66683H8.66732V12.6668H7.33398V8.66683Z"
                fill="white" />
            </svg>
          </button>
          <div v-if="props.added" class="line-item__added">
            Added <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M4.77578 8.9998L1.92578 6.1498L2.63828 5.4373L4.77578 7.5748L9.36328 2.9873L10.0758 3.6998L4.77578 8.9998Z"
                fill="black" />
            </svg>
          </div>
          <!--
            <button @click="removeGift()" v-if="props.added" class="line-item__remove">
              Remove
            </button>
             -->
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import cartMethods from '../../../bundles/utils/helpers/cart-helper';
import { EVENTS } from '../cart/constants'
import { getFormattedPrice } from './helpers';
import VariantSelector from '../../components/product-drawer/vue/variant-selector.vue';

const props = defineProps({
  itemsSubtotalPrice: {
    type: Number,
    default: () => 0,
  },
  added: {
    type: Boolean,
    default: () => false,
  },
  itemId: {
    type: String,
    default: () => '',
  },
  item: {
    type: Object,
    default: () => ({})
  }
});

const freeGift = ref(window.theme?.bfcm?.freeGift);
const restrictVariantSelection = ref(window.theme?.bfcm?.restrictVariantSelection);
const gwpConfig = window.theme?.bfcm || {};
const currencySymbol = window.BPN?.cart?.currencySymbol;
const selectedVariantId = ref(props.item?.variant_id || null);
const imageUrl = ref(null)
const addGiftToCart = async () => {
  await cartMethods.post('add', {
    id: freeGift.value.variantId,
    quantity: 1,
    properties: { _isFreeGift: true }
  })
  document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, {
    detail: { id: freeGift.value.variantId },
  }));
}


const onVariantChange = (variantId, product) => {
  updateCartVariant(props.itemId, variantId, 1);
}

onMounted(() => {
  if (!freeGift.value?.variants) return;
  const variant = freeGift.value.variants.find(v => v.id === freeGift.value.id)
  if (variant) {
    imageUrl.value = variant?.featured_image?.src || null
  } else {
    imageUrl.value = props.item?.featured_image?.url || null
  }
})
// When variant selector changes
const updateCartVariant = async (lineItemKey, newVariantId, quantity) => {
  try {
    if (window.theme?.bfcm?.freeGift) {
      window.theme.bfcm.freeGift.id = newVariantId;
      window.theme.bfcm.freeGift.variantId = newVariantId;
    }

    sessionStorage.setItem('themeVariables', JSON.stringify({ value: window.theme, timestamp: Date.now() }));

    document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED));


  } catch (error) {
    console.error('Error updating variant:', error);
  }
}

</script>
