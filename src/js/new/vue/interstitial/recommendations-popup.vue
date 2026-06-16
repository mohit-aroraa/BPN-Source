<template>
  <div v-if="state.isVisible" class="interstitial-overlay" @click="close">
    <!-- Modal Container -->
    <div class="interstitial" @click.stop>
      <!-- Close Button -->
      <button class="interstitial__close" @click="close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>

      <!-- Modal Content -->
      <div class="interstitial__content">
        <!-- Header -->
        <div class="interstitial__header">
          <h2 class="interstitial__title">
            {{ popupTitle }}
          </h2>
        </div>

        <!-- Body Content Placeholder -->
        <div class="interstitial__body">
          <!-- Product sections will go here -->
          <div class="interstitial__products-grid">

            <interstitialProductCard :ctaOptions="ctaOptions" :productInCart="state.productInCart"
              :recommendation="recommendation" v-for="recommendation in state.recommendations" :key="recommendation.id"
              :currencySymbol="currencySymbol" />
          </div>

        </div>

        <!-- Footer -->
        <div class="interstitial__footer">

          <button v-if="ctaOptions !== 'OTP Only'"
            :class="{ 'loading': state.loading && state.atcType === 'subscribe' }"
            :disabled="!selectedProducts.length || state.loading" class="interstitial__footer-action-primary"
            @click="addRecommendationsToCart('subscribe')">
            {{ interstitialConfig.subscription_cta_label }}
            <span v-if="selectedProductsTotal > 0">
              |
              <span class="original-total line-through">
                {{ currencySymbol }}{{ selectedProductsTotal.toFixed(2) }}
              </span>
            </span>
            <span class="discounted-total">
              {{ currencySymbol }}{{ selectedProductsSubscriptionTotal.toFixed(2) }}
            </span>
          </button>
          <div v-if="ctaOptions !== 'OTP Only'" class="interstitial__footer-subscription-note">
            {{
              interstitialConfig.subscription_note.replace(
                '${percentage}',
                `${state.currentProduct?.sellingPlans?.[0]?.priceAdjustments?.[0]?.adjustmentValue?.adjustmentPercentage
                ?? 0}%`
              )
            }}
          </div>
          <button v-if="ctaOptions !== 'Subscription Only'" :class="{
            'interstitial__footer-action-primary': ctaOptions === 'OTP Only',
            'interstitial__footer-action-secondary': ctaOptions !== 'OTP Only',
            'loading': state.loading && state.atcType === 'otp'
          }" :disabled="!selectedProducts.length || state.loading" @click="addRecommendationsToCart('otp')">
            {{ interstitialConfig.otp_cta_label }} - {{ currencySymbol }}{{ selectedProductsTotal.toFixed(2) }}
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, computed, ref, defineAsyncComponent } from 'vue';
import { PRODUCT_WITH_META_FIELDS_QUERY } from './interstitial-api-service';
import { transformProductResponse, productRecommendations, sortProductsByCategories } from './interstitial-helper';
import cartMethods from '../../../bundles/utils/helpers/cart-helper';
import { getCustomerIsSMSSubscribed } from '../../helpers/customer';
import { EVENTS } from '../cart/constants'
// Lazy load components and dependencies
const interstitialProductCard = defineAsyncComponent(() => import('./interstitial-product-card.vue'));

const state = reactive({
  isVisible: false,
  productInCart: null,
  currentProduct: null,
  recommendations: [],
  loading: false,
  atcType: ''
})

const selectedProducts = computed(() => {
  return state.recommendations.filter(recommendation => recommendation.isSelected);
});

const selectedProductsTotal = computed(() => {
  return selectedProducts.value.reduce((total, recommendation) => {
    if (!recommendation.isCurrentProduct) {
      return total + (recommendation.selectedVariant ? recommendation.selectedVariant.price : 0);
    } else {
      return total
    }
  }, 0);
});

const selectedProductsSubscriptionTotal = computed(() => {
  return selectedProducts.value.reduce((total, recommendation) => {
    if (!recommendation.isCurrentProduct) {
      return total + (recommendation.selectedVariant?.sellingPlans?.[0]?.adjustedPrice || 0);
    } else {
      return total
    }
  }, 0);
});

const open = (product) => {
  state.productInCart = product
  document.body.classList.add('interstitial-open');
  fetchProductMetaData();
}

const close = () => {
  state.isVisible = false
  state.loading = false
  state.atcType = null
  document.body.classList.remove('interstitial-open');
}

const handleKeydown = (event) => {
  if (event.key === 'Escape' && state.isVisible) {
    close();
  }
}

const currencySymbol = window.BPN?.cart?.currencySymbol || '$'
const popupTitle = ref('');
const ctaOptions = ref('');
const interstitialConfig = window.BPN?.interstitial || {};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  document.body.classList.remove('interstitial-open');
  document.removeEventListener('keydown', handleKeydown);
});

const fetchProductMetaData = async () => {

  try {
    const { graphqlClient } = await import('../../utils/graphql-client');
    const data = await graphqlClient.query(PRODUCT_WITH_META_FIELDS_QUERY,
      {
        handle: state.productInCart.handle,
        country: window.Shopify.country || 'US',

      }
    )
    let transformedData = transformProductResponse(data)
    state.recommendations = productRecommendations(transformedData)
    state.currentProduct = state.recommendations.find(p => p.isCurrentProduct);

    if (!state.currentProduct.interstitialEnabled || state.recommendations.length < 3) {
      setTimeout(() => {
        close(); // ensure body class removed and UI hidden
        window.openCartDrawer()
      }, 1000);
      return;
    }

    selectDefaultVariants();
    popupTitle.value = state.currentProduct.interstitialTitle || window.BPN?.interstitial?.popup_title || 'Subscribe to the BPN 3 Stack Routine'
    ctaOptions.value = state.currentProduct?.interstitialCTAOptions || window.BPN?.interstitial?.cta_options;
    const categories = state.currentProduct.interstitialCategories || [];
    state.recommendations = sortProductsByCategories(state.recommendations, categories);
    state.isVisible = true;

    const interstitial_open_count = parseInt(sessionStorage.getItem('interstitial_open_count') || '0');
    sessionStorage.setItem('interstitial_open_count', `${interstitial_open_count + 1}`)
  } catch (e) {
    console.error('Failed to fetch interstitial data ', e);
    close();
    setTimeout(() => {
      window.openCartDrawer()
    }, 1000);
  }
}

const selectDefaultVariants = () => {
  const normalizeId = (id) => (id || '').toString().replace('gid://shopify/ProductVariant/', '');

  state.recommendations.forEach(recommendation => {
    if (recommendation.isCurrentProduct) {
      const selectedVariant = recommendation.variants.find(variant => normalizeId(variant.id) === normalizeId(state.productInCart.id));
      recommendation.selectedVariant = selectedVariant || recommendation.variants[0];
      recommendation.selectedVariantId = recommendation.selectedVariant.id;
    } else {
      recommendation.selectedVariant = recommendation.variants[0];
      recommendation.selectedVariantId = recommendation.selectedVariant.id;
      recommendation.isSelected = true;
    }
    recommendation.flavors = recommendation.options.find(option => option.name === 'Flavor')?.values || [];
  });
}

const addRecommendationsToCart = async (type) => {
  state.loading = true
  state.atcType = type
  const selectedItems = selectedProducts.value.map(product => {
    const item = {
      id: product.selectedVariantId,
      quantity: 1,
      properties: {
        '__SMS': getCustomerIsSMSSubscribed(),
      },
    };
    if (type === 'subscribe') {
      const sp = product.selectedVariant?.sellingPlans?.[0]?.id?.replace('gid://shopify/SellingPlan/', '');
      if (sp) item.selling_plan = sp;
    }

    return item;
  });

  selectedItems.forEach(item => {
    if (item.id.includes('gid://shopify/ProductVariant/')) {
      item.id = item.id.replace('gid://shopify/ProductVariant/', '');
    }
  });

  if (type === 'subscribe' && ctaOptions !== 'OTP Only' && !state.productInCart.selling_plan_allocation) {
    await cartMethods.post('change', {
      id: state.productInCart.key,
      quantity: 0
    });
    selectedItems.unshift({
      id: state.productInCart.id,
      quantity: state.productInCart.quantity,
      selling_plan: state.recommendations.find(p => p.isCurrentProduct).selectedVariant?.sellingPlans?.[0]?.id?.replace('gid://shopify/SellingPlan/', '') || null,
      properties: {
        '__SMS': getCustomerIsSMSSubscribed(),
      },
    });
  }

  await cartMethods.post('add', { items: selectedItems });
  close();
  document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, {
    detail: { items: selectedItems, fromInterstitial: true },
  }));
}

defineExpose({ open, close, state })
</script>
