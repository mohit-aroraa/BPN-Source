<template>
  <!-- Main drawer container -->
  <div class="bpn-product-content">
    <!-- Loading state -->
    <div v-if="isLoading" class="bpn-product-content__loading">
      <div class="bpn-product-content__loading-spinner"></div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="bpn-product-content__error">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="bpn-product-content__error-icon">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ error }}</p>
      <button @click="retryFetchProduct" class="bpn-product-content__retry-button">
        Try Again
      </button>
    </div>

    <!-- Product content -->
    <template v-else-if="product">

      <!-- Product title and vendor -->
      <h2 class="bpn-product-content__title">{{ product.title }}</h2>

      <!-- Product images carousel -->
      <ProductImages :images="product.images" :title="product.title" :show-thumbnails="false"
        :click-id-prefix="clickIdPrefix" class="bpn-product-content__images" />

      <!-- Product details section -->
      <div class="bpn-product-content__details">

        <!-- Variant selector component -->
        <VariantSelector :variants="product.variants" :options="product.options" :variationsMeta="variationsMeta"
          :click-id-prefix="clickIdPrefix" v-model="selectedVariantId" />

        <!-- Purchase options component -->
        <PurchaseOptions v-if="hasSubscriptionSellingPlan && !product.enableStackAndSave" :product="product"
          :selectedVariant="selectedVariant" :hasDiscountTag="hasDiscountTag" :tagDiscount="tagDiscount"
          :click-id-prefix="clickIdPrefix" v-model="purchaseType"
          v-model:subscriptionOption="selectedSubscriptionOption" :defaultToOtp="defaultToOtp"
          :otpOnlySale="otpOnlySale" />

      </div>
      <div class="bpn-product-content__actions">
        <!-- Add to cart button -->
        <button class="bpn-product-content__add-button button" v-if="!product.enableStackAndSave"
          :class="{ 'sold-out': availability === 'oos' }" :disabled="isAddingToCart" @click="onAddButtonClick"
          :data-click-id="clickIdPrefix ? `${clickIdPrefix}_drawer_atc` : ''" v-html="addButtonLabel">
        </button>

        <!-- View product details link -->
        <a :href="`/products/${product.handle}`" class="bpn-product-content__view-details"
          :data-click-id="clickIdPrefix ? `${clickIdPrefix}_drawer_view-details` : ''">
          View Product Details
        </a>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, toRaw } from 'vue';
import { fetchProductByHandle, fetchProductVariantsMetaApi } from '../../../api/product.js';
import { addToCart, openCartDrawer } from '../cart-actions.js';
import ProductImages from './product-images.vue';
import VariantSelector from './variant-selector.vue';
import PurchaseOptions from './purchase-options.vue';
import { extractShopifyId, openPage } from '../../../helpers/common';
import { openBackInStackModal } from '../../../../bundles/utils/bis';
import { getSMSConfig } from '../../../helpers/sms';
import { getCustomerIsSMSSubscribed } from '../../../helpers/customer';
import { EVENTS } from '../../constatns';
import { formatDiscountedPrice, formatPrice } from './utils';
import { EVENTS as CARTEVENTS } from '../../.../../../vue/cart/constants.js'

// Props
const props = defineProps({
  productHandle: {
    type: String,
    required: true,
  },
  onClose: {
    type: Function,
    default: null,
  },
  clickIdPrefix: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['close']);

// Helper function to close the drawer
const closeDrawer = () => {
  if (typeof props.onClose === 'function') {
    props.onClose();
  } else {
    emit('close');
  }
};

// State
const product = ref(null);
const isLoading = ref(true);
const error = ref(null);
const selectedVariantId = ref(null);
const selectedOptions = ref([]);
const hasSubscriptionSellingPlan = ref(true);
const purchaseType = ref('subscription');
const selectedSubscriptionOption = ref(null);
const isAddingToCart = ref(false);
const variationsMeta = ref([]);
const smsConfig = ref(getSMSConfig());
const hasSMSSubscription = ref(getCustomerIsSMSSubscribed());
const defaultToOtp = ref(false)
const otpOnlySale = computed(() => {
  return product.value && Array.isArray(product.value.tags) && product.value.tags.some(tag => (tag || '').toLowerCase().trim() === 'otp-only-sale');
});
// Expose methods to parent component
defineExpose({
  refetchProduct: () => {
    fetchProduct();
  },
});

// Computed
const selectedVariant = computed(() => {
  if (!product.value || !selectedVariantId.value) return {};

  return product.value.variants.find(v => v.id === selectedVariantId.value) || product.value.variants[0];
});

const selectedMetaVariant = computed(() => {
  const id = extractShopifyId(selectedVariantId.value);

  return variationsMeta.value.find(v => v.id === id) || variationsMeta.value[0];
});

const availability = computed(() => {
  return selectedMetaVariant.value?.availability || 'default';
});

const addButtonLabel = computed(() => {
  if (isAddingToCart.value) {
    return 'Adding...';
  }

  if (availability.value === 'external') {
    return selectedMetaVariant.value.external_link_text;
  }

  if (availability.value === 'oos' || !selectedVariant.value.available) {
    return 'Notify me via email';
  }

  return `${purchaseType.value === 'subscription' ? 'Add Subscription' : 'Add to Cart'} - ${currentPrice.value}`;
});


const activeDiscountTag = computed(() => {
  const pattern = /^ssale\d+$/;

  if (product.value) {
    const match = product.value.tags.find(item => pattern.test(item));

    if (match) {
      return {
        hasDiscountTag: true,
        discount: Number(match.replace('ssale', '')),
      };
    }
  }

  return {
    hasDiscountTag: false,
    discount: 0,
  };
});

const hasDiscountTag = computed(() => {
  return activeDiscountTag.value.hasDiscountTag;
});

const tagDiscount = computed(() => {
  return activeDiscountTag.value.discount;
});

// Calculate the current price based on purchase type
const currentPrice = computed(() => {
  if (!selectedVariant.value || !selectedVariant.value.price) return '';

  const isSubscription = purchaseType.value === 'subscription' && product.value &&
    product.value.sellingPlanGroups && product.value.sellingPlanGroups.length > 0 &&
    selectedSubscriptionOption.value;

  // For subscription
  if (isSubscription) {

    const sellingPlans = product.value.sellingPlanGroups[0].sellingPlans;
    const selectedPlan = sellingPlans.find(plan => plan.id === selectedSubscriptionOption.value);

    if (selectedPlan && selectedPlan.discount) {
      let discount = selectedPlan.discount;

      if (hasDiscountTag.value) {
        discount = tagDiscount.value;
      } else {
        if (smsConfig.value.isEnabled && hasSMSSubscription.value) {
          discount += smsConfig.value.subscriptionDiscountedAmount || 0;
        }
      }

      // Apply discount directly to the price without manual conversion
      const priceValue = selectedVariant.value.price;
      const discountAmount = priceValue * (discount / 100);
      const discountedPrice = priceValue - discountAmount;

      // Let formatPrice handle currency conversion
      return formatPrice(discountedPrice, selectedVariant.value.currencyCode);
    }
  }

  if (hasDiscountTag) {
    return formatDiscountedPrice(selectedVariant.value.price, tagDiscount.value, selectedVariant.value.currencyCode);
  }

  // For one-time purchase or when subscription has no discount
  return formatPrice(selectedVariant.value.price, selectedVariant.value.currencyCode);
});

const filterSellingPlanGroupsByPlatform = (groups) => {
  const platform = (window.BPN?.subscriptionPlatform || '').toLowerCase();
  return groups.filter(group => {
    const isSkio = (group.appId || '').toUpperCase() === 'SKIO';
    return platform === 'skio' ? isSkio : !isSkio;
  });
};

const fetchProduct = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    if (!props.productHandle) {
      throw new Error('Product handle is missing or empty');
    }

    const productData = await fetchProductByHandle(props.productHandle);
    if (!productData) {
      throw new Error('Received empty product data from API');
    }

    // Validate required product data
    if (!productData.variants || !Array.isArray(productData.variants) || productData.variants.length === 0) {
      throw new Error('Product data is missing variants array');
    }

    productData.sellingPlanGroups = filterSellingPlanGroupsByPlatform(productData.sellingPlanGroups);

    const stackAndSaveEnabled = productData.enableStackAndSave === true;

    if (productData.sellingPlanGroups.length === 0 || productData.allowsSubscriptions === 'false' || stackAndSaveEnabled) {
      hasSubscriptionSellingPlan.value = false;
      purchaseType.value = 'onetime';
    } else {
      hasSubscriptionSellingPlan.value = true;
      purchaseType.value = 'subscription';
    }

    if (Array.isArray(productData.tags) && productData.tags.some(tag => (tag || '').toLowerCase().trim() === 'pdp-default-to-otp')) {
      purchaseType.value = 'onetime';
      defaultToOtp.value = true;
    }


    product.value = productData;

    // Set initial options and variant
    if (productData.options && productData.options.length > 0) {
      selectedOptions.value = productData.options.map(option => option.values[0]);
    }

    updateVariantFromOptions();

    // Set default subscription option if available
    if (!stackAndSaveEnabled && productData.sellingPlanGroups &&
      productData.sellingPlanGroups.length > 0 &&
      productData.sellingPlanGroups[0].sellingPlans &&
      productData.sellingPlanGroups[0].sellingPlans.length > 0) {
      selectedSubscriptionOption.value = productData.sellingPlanGroups[0].sellingPlans[0].id;
    }

  } catch (err) {
    console.error('Product drawer error: Failed to fetch product data:', err);
    error.value = 'Could not load product. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const fetchProductVariants = async () => {
  variationsMeta.value = await fetchProductVariantsMetaApi(props.productHandle);
};

const updateVariantFromOptions = () => {
  if (!product.value || !product.value.variants) return;

  const matchingVariant = product.value.variants.find(variant => {
    return (
      (!product.value.options[0] || variant.option1 === selectedOptions.value[0]) &&
      (!product.value.options[1] || variant.option2 === selectedOptions.value[1]) &&
      (!product.value.options[2] || variant.option3 === selectedOptions.value[2])
    );
  });

  if (matchingVariant) {
    selectedVariantId.value = matchingVariant.id;
  } else {
    selectedVariantId.value = product.value.variants[0]?.id;
  }
};

const addItemToCart = async () => {
  if (!selectedVariant.value || isAddingToCart.value) return;

  isAddingToCart.value = true;

  try {
    const item = {
      id: selectedVariant.value.id,
      quantity: 1,
    };

    if (!product.value.enableStackAndSave && purchaseType.value === 'subscription' && selectedSubscriptionOption.value) {
      item.selling_plan = selectedSubscriptionOption.value;
    }

    await addToCart(item);

    if (window.enableToast) {
      window.enableToast('Item added to cart');
    }

    closeDrawer();

    document.dispatchEvent(new CustomEvent(CARTEVENTS.ITEM_ADDED, {
      detail: { id: item.id },
    }));
  } catch (error) {
    if (window.enableToast) {
      window.enableToast('Failed to add item to cart', true);
    }
  } finally {
    isAddingToCart.value = false;
  }
};

const getUnavailableVariations = () => {
  const variationIds = variationsMeta.value.filter((item => item.availability === 'oos')).map(item => toRaw(item).id);

  return product.value.variants.map(item => ({
    ...toRaw(item),
    id: extractShopifyId(item.id),
    available: false,
  })).filter(item => variationIds.includes(item.id));
};

const onAddButtonClick = () => {
  switch (availability.value) {
    case 'oos':
      const data = {
        productId: extractShopifyId(product.value.id),
        handle: product.value.productHandle,
        title: product.value.title,
        variantId: extractShopifyId(selectedVariantId.value),
        variantTitle: selectedVariant.value.title,
        variants: getUnavailableVariations(),
      };
      openBackInStackModal(data);
      return;
    case 'external':
      openPage(selectedMetaVariant.value.external_link_url);
      return;
    default:
      return addItemToCart();
  }
};

const retryFetchProduct = () => {
  fetchProduct();
  fetchProductVariants();
};


// Watchers
watch(() => props.productHandle, (newHandle) => {
  if (newHandle) {
    fetchProduct();
    fetchProductVariants();
  }
});

watch(selectedVariantId, () => {
  if (!product.value) return;

  const variant = selectedVariant.value;
  const productHasPlans = product.value.sellingPlanGroups && product.value.sellingPlanGroups.length > 0;
  const variantHasPlans = variant?.hasSellingPlan ?? true;
  const allowsSubscriptions = product.value.allowsSubscriptions !== 'false';

  const showSubscription = productHasPlans && variantHasPlans && allowsSubscriptions && !product.value.enableStackAndSave;

  hasSubscriptionSellingPlan.value = showSubscription;

  if (!showSubscription && purchaseType.value === 'subscription') {
    purchaseType.value = 'onetime';
  } else if (showSubscription && !defaultToOtp.value) {
    purchaseType.value = 'subscription';
  }
});

function smsSubscriptionUpdateListener(event) {
  hasSMSSubscription.value = event.detail.hasSubscription;
}


// Lifecycle
onMounted(() => {
  if (props.productHandle) {
    fetchProduct();
    fetchProductVariants();
  }

  document.addEventListener(EVENTS.SUBSCRIPTION_UPDATED, smsSubscriptionUpdateListener);
});

onBeforeUnmount(() => {
  // Cleanup if needed
  document.removeEventListener(EVENTS.SUBSCRIPTION_UPDATED, smsSubscriptionUpdateListener);
});
</script>
