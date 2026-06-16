<template>
  <div class="line-item-recommendations">
    <div class="line-item-recommendations__title">
      {{ title }}
      <svg v-if="totalItems > 1" @click="toggleRecommendations()" aria-hidden="true" focusable="false"
        role="presentation" class="icon icon-chevron-down line-item-recommendations__toggle"
        :class="{ 'rotated': state.isOpen }" viewBox="0 0 9 9">
        <path
          d="M8.542 2.558a.625.625 0 0 1 0 .884l-3.6 3.6a.626.626 0 0 1-.884 0l-3.6-3.6a.625.625 0 1 1 .884-.884L4.5 5.716l3.158-3.158a.625.625 0 0 1 .884 0z"
          fill="#000" />
      </svg>
    </div>
    <div class="line-item-recommendations__list" :class="{ 'hidden': !state.isOpen }">
      <div class="line-item-recommendations__list-item" v-for="recommendation in item.recommendations"
        :key="recommendation.id">
        <div class="line-item-recommendations__category">
          <img v-if="recommendation?.category?.icon" class="line-item-recommendations__category-icon"
            :src="recommendation?.category?.icon" alt="Product Category Image" />
          {{ recommendation?.category?.name }}
        </div>
        <div class="line-item-recommendations__product">
          <img class="line-item-recommendations__product-image" :src="recommendation.image" alt="Product Image" />
          <div class="line-item-recommendations__product-details">
            <div class="line-item-recommendations__product-info">
              <div class="line-item-recommendations__product-title">{{ recommendation.title }}</div>
              <div class="line-item-recommendations__product-servings" v-if="recommendation.selectedVariant.servings">
                Servings: {{ recommendation.selectedVariant.servings }}
              </div>
              <VariantSelector v-if="recommendation.variants.length > 1" :variants="recommendation.variants"
                :options="recommendation.options" :variationsMeta="recommendation.variants"
                v-model="recommendation.selectedVariantId"
                @update:modelValue="onVariantChange($event, recommendation)" />
            </div>
            <div class="line-item-recommendations__product-action">
              <div class="line-item-recommendations__product-price discounted-price"
                v-if="!!item.selling_plan_allocation && recommendation.selectedVariant.sellingPlans.length && recommendation.allowSubscriptions !== 'false'">
                {{ currencySymbol }}{{ recommendation.selectedVariant.sellingPlans[0]?.adjustedPrice }}</div>
              <div class="line-item-recommendations__product-price"
                :class="{ 'line-through': !!item.selling_plan_allocation && recommendation.selectedVariant.sellingPlans.length && recommendation.allowSubscriptions !== 'false' }">
                {{ currencySymbol }}{{ recommendation.selectedVariant.price }}</div>
              <button :disabled="state.loading" @click="addRecommendationToCart(recommendation)"
                class="line-item-recommendations__add-button">Add
                to Cart</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import VariantSelector from '../../components/product-drawer/vue/variant-selector.vue';
import cartMethods from '../../../bundles/utils/helpers/cart-helper';
import { reactive, onMounted, ref, watch } from 'vue';
import { EVENTS } from '../cart/constants'

const currencySymbol = window.BPN?.cart?.currencySymbol;

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  totalItems: {
    type: Number,
    default: () => 0,
  }
});

const state = reactive({
  loading: false,
  isOpen: true
});

const title = ref('');

onMounted(() => {
  if (props.totalItems > 1) {
    state.isOpen = true;
  }
  title.value = props?.item?.interStitialData?.interstitialTitle || window.BPN?.interstitial?.popup_title;
})

async function addRecommendationToCart(product) {
  state.loading = true;
  const normalizeId = (id) => (id || '').toString().replace('gid://shopify/ProductVariant/', '');
  const itemToAdd = {
    id: normalizeId(product.selectedVariantId),
    quantity: 1
  };
  if (props.item.selling_plan_allocation && product.allowSubscriptions !== 'false') {
    const platform = (window.BPN?.subscriptionPlatform || '').toLowerCase();
    const sellingPlans = product.sellingPlans || [];
    const matchedPlan = sellingPlans.find(plan => {
      const isSkio = (plan.appName || '').toUpperCase() === 'SKIO';
      return platform === 'skio' ? isSkio : !isSkio;
    }) || sellingPlans[0];
    itemToAdd.selling_plan = matchedPlan?.id?.replace('gid://shopify/SellingPlan/', '') || null;
  }
  await cartMethods.post('add', itemToAdd);
  document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, { detail: { id: itemToAdd.id } }));
  state.loading = false;
}

const toggleRecommendations = () => {
  state.isOpen = !state.isOpen;
}

watch(() => props.item, (newVal) => {
  if (newVal.recommendations?.length >= 1) {
    state.isOpen = true;
  } else {
    state.isOpen = false;
  }
}, { deep: true });

const onVariantChange = (e, item) => {
  item.selectedVariant = item.variants.find(v => v.id === e);
};
</script>
