<template>
  <div class="cart" :class="{ visible: isOpen }" ref="cartRef" v-trap="isOpen ? closeCartDrawer : null" role="dialog"
    aria-modal="true" aria-labelledby="cart-heading">
    <div class="cart__inner">
      <!-- Loading indicator -->
      <div v-if="store.isLoading" class="cart__loading">
        <div class="cart__loading-spinner"></div>
      </div>

      <CartUrgencyTimer v-if="configuration.enableUrgencyTimer" />

      <div class="cart__header">
        <h3 class="cart__heading" id="cart-heading">
          Your Cart <span class="cart__heading-count">{{ cartLabel }}</span>
          <button class="cart__heading-trigger" @click="closeCartDrawer" aria-label="Close cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"
                fill="black" />
            </svg>
          </button>
        </h3>

        <CartProgressBar v-if="!configuration.enableThresholds" :itemsSubtotalPrice="itemsSubtotalPrice" />
        <CartProgressBarV2 v-if="configuration.enableThresholds" :itemsSubtotalPrice="itemsSubtotalPrice" />
      </div>

      <DiscountCodeBanner />
      <CartAnnouncementBanner />

      <!-- SMS Subscription -->
      <SmsSubscription />
      <!-- Line Items -->
      <div class="line-items-list">
        <BfcmGift :added="false" v-if="!isFreeGiftInCart() && configuration.saleActive" />
        <template v-if="sortedItems.length !== 0">
          <LineItem v-for="item in sortedItems" :key="`line-item-${item.key}`" :item="item"
            :isOperationActive="isOperationActive" :currencyCode="currencyCode" :totalItems="sortedItems.length"
            :isOperationTarget="isOperationTarget(item.key)" :operation="getItemOperation(item.key)"
            @changeQuantityAction="onChangeLineItemQuantityEvent" @changeLineItem="changeLineItem"
            @discountCalculated="discountCalculated" :isLoading="store.isLoading" />
        </template>

        <div v-else class="line-items-list__empty-state">
          <h4 class="line-items-list__empty-state-heading">{{ configuration.emptyCartText }}</h4>
          <a class="line-items-list__empty-state-link" :href="configuration.emptyStateShopNowCollectionUrl">
            {{ configuration.emptyCartButtonText }}
          </a>
        </div>
      </div>
      <!-- Upsell Products -->
      <Upsell v-if="items.length === 0" :items="recommendations.items" :showRecommendedStack="showRecommendedStack"
        :onTouch="onTouch" @addProductAction="onAddProductEvent" />
      <UpsellsCompact v-if="showCompactUpsells && items.length > 0" :items="recommendations.items"
        @addProductAction="onAddProductEvent" />
      <!-- Cart Footer -->
      <form v-if="items.length !== 0" class="cart__footer" method="post" :action="getCheckoutUrl()">
        <div class="cart__footer-message">
          <img src="https://cdn.shopify.com/s/files/1/1103/4864/files/Stars.png?v=1762795753" />
          <p>
            <i>Trusted by 530k+ Customers</i>
          </p>
        </div>
        <h4 class="cart__footer-heading">
          SUBTOTAL <span>{{ getFormattedPrice(itemsSubtotalPrice, configuration.currencySymbol) }}</span>
        </h4>

        <button type="button" class="cart__footer-submit" :disabled="isDisabledSubmit || isOperationActive"
          @click="onCheckoutClick">
          <span style="display:none">Checkout</span>
          <span class="secure-cheackout__label">Secure Checkout
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M9.33333 9.55422V8.20482C9.33333 6.43485 10.7511 5 12.5 5C14.2489 5 15.6667 6.43485 15.6667 8.20482V9.55422H15.8333C17.3061 9.55422 18.5 10.7625 18.5 12.253V16.3012C18.5 17.7917 17.3061 19 15.8333 19H9.16667C7.69391 19 6.5 17.7917 6.5 16.3012V12.253C6.5 10.7625 7.69391 9.55422 9.16667 9.55422H9.33333ZM10.3333 8.20482C10.3333 6.99379 11.3034 6.01205 12.5 6.01205C13.6966 6.01205 14.6667 6.99379 14.6667 8.20482V9.55422H10.3333V8.20482Z"
                fill="white" />
            </svg>
          </span>
        </button>
        <p class="cart__footer-text">
          {{ configuration.footerText }}
        </p>
      </form>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, reactive, computed, watch, onUnmounted } from 'vue';
import cartMethods from '../../../bundles/utils/helpers/cart-helper';
import { fetchCollection, fetchProductRecommendations } from '../../client/cart';
import { syncFacebookPromotion, shouldRunSyncFacebookPromotion } from '../../utils/sms';
import { EVENTS } from './constants';
import { getFormattedPrice, isFreeGiftItem } from './helpers';

// Components
import LineItem from './line-item.vue';
import Upsell from './up-sell.vue';
import CartProgressBar from './cart-progress-bar.vue';
import CartProgressBarV2 from './cart-progress-bar-v2.vue';
import SmsSubscription from './sms-subscription.vue';
import { lockBodyScroll, unlockBodyScroll } from '../../helpers/common';
import { safeGet } from '../utils/vue-safety';
import { shouldShowInterstitial } from '../interstitial/interstitial-helper';
import { PRODUCT_WITH_META_FIELDS_QUERY } from '../interstitial/interstitial-api-service';
import { transformProductResponse, productRecommendations } from '../interstitial/interstitial-helper';
import { getPopupInstance } from '../interstitial'
import UpsellsCompact from './upsells-compact.vue';
import CartUrgencyTimer from './urgency-callout.vue';
import DiscountCodeBanner from './discount-code-banner.vue';
import CartAnnouncementBanner from './cart-announcement-banner.vue';
import BfcmGift from './bfcm-gift.vue';
// Configuration options
const configuration = ref({
  currencySymbol: window.BPN?.cart?.currencySymbol || '',
  cartCheckoutUrl: window.BPN?.cart?.cartCheckoutUrl || '',
  footerText: window.BPN?.cart?.footerText || '',
  emptyCartText: window.BPN?.cart?.emptyCartText || 'Your cart is empty',
  emptyStateShopNowCollectionUrl: window.BPN?.cart?.emptyStateShopNowCollectionUrl || '/collections/all',
  emptyCartButtonText: window.BPN?.cart?.emptyCartButtonText || 'Shop Now',
  upsellCollectionHandle: window.BPN?.cart?.upsellCollectionHandle || '',
  enableThresholds: window.BPN?.cart?.enableThresholds || false,
  enableUrgencyTimer: window.BPN?.cart?.enableUrgencyTimer || false,
  enableGwp: window.theme?.bfcm?.enableGwp || false,
  enableTimer: window.theme?.bfcm?.enableTimer || false,
  saleActive: window.theme?.bfcm?.saleActive || false,
});

// Refs & reactive state
const cartRef = ref(null);
const isTouchable = ref(false);
const isOpen = ref(false);
const showCompactUpsells = ref(false);
const discounts = ref({});
const operation = ref({
  isPerforming: false,
  key: undefined,
  operation: undefined,
});

const store = reactive({
  isLoading: false,
  cart: {},
});

const recommendations = reactive({
  isLoading: false,
  items: [],
});

const popupRef = getPopupInstance()

// Debounced cart refresh to prevent thundering herd of API calls
let loadCartTimer = null;
let skipNextSync = false;

function queueLoadCart(skipSync = false, delayMs = 300) {
  skipNextSync = skipNextSync || !!skipSync;
  if (loadCartTimer) clearTimeout(loadCartTimer);
  return new Promise((resolve) => {
    loadCartTimer = setTimeout(async () => {
      const skip = skipNextSync;
      skipNextSync = false;
      loadCartTimer = null;
      try {
        store.isLoading = true;
        store.cart = await cartMethods.get();
        if (store.cart.items.length > 0 && store.cart.items.length < 3) {
          await checkLineItemRecommendations(store.cart.items[store.cart.items.length - 1]);
        } else if (store.cart.items.length >= 3) {
          showCompactUpsells.value = true;
        }
        // Only sync if not explicitly skipped
        if (!skip) {
          await syncFreeGift();
        }
      } finally {
        store.isLoading = false;
        resolve();
      }
    }, delayMs);
  });
}

// Computed properties
const items = computed(() => store.cart?.items || []);
const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => {
    const aIsGift = isAnyFreeGift(a);
    const bIsGift = isAnyFreeGift(b);
    return bIsGift - aIsGift;
  });
})
const itemsSubtotalPrice = computed(() => {
  const cartItems = safeGet(store, 'cart.items', []);

  return cartItems
    .filter(item => !item.properties || !isFreeGiftItem(item))
    .reduce((total, item) => {
      const discount = safeGet(discounts, item.key, 0);

      let discountedPrice = item.discounted_price;

      if (discount) {
        discountedPrice = Math.round(safeGet(item, 'selling_plan_allocation.compare_at_price', item.price) * (1 - discount / 100));
      }

      return total + discountedPrice * item.quantity;
    }, 0);
});

const currencyCode = computed(() => safeGet(store, 'cart.currency', 'USD'));
const showRecommendedStack = computed(() => itemsSubtotalPrice.value > 0);
const totalItemCount = computed(() => store.cart?.item_count || 0);
const isDisabledSubmit = computed(() => items.value.length === 0);
const cartLabel = computed(() => `(${totalItemCount.value} ${totalItemCount.value === 1 ? 'item' : 'items'})`);
const isOperationActive = computed(() => operation.value.key !== undefined);

// Helper methods
const isOperationTarget = (key) => operation.value.key === key;
const getItemOperation = (key) => operation.value.key === key ? operation.value.operation : undefined;

// Last active element before opening the cart drawer
const lastActiveElement = ref(null);

// Add reference to backdrop element
const backdropElement = ref(null);

// Cart data loading - simplified, called by queueLoadCart
const loadCart = async () => {
  try {
    store.isLoading = true;
    store.cart = await cartMethods.get();
    if (store.cart.items.length > 0 && store.cart.items.length < 3) {
      await checkLineItemRecommendations(store.cart.items[store.cart.items.length - 1]);
    } else if (store.cart.items.length >= 3) {
      showCompactUpsells.value = true;
    }
    await syncFreeGift();
  } catch (error) {
    console.error('Error loading cart:', error);
  } finally {
    store.isLoading = false;
  }
};

// Recommendations loading
const loadRecommendations = async () => {
  const RECOMMENDATIONS_LIMIT = 10;
  const items = store.cart?.items || [];
  const uniqueIds = [...new Set(items.map(item => item.product_id))];

  try {
    let results = [];

    if (items.length === 0) {
      results = await fetchCollection(configuration.value.upsellCollectionHandle);
    } else {
      const responses = await Promise.all(
        uniqueIds.map(id => fetchProductRecommendations(id)),
      );

      // Flatten and deduplicate results
      results = Array.from(
        new Map(
          responses
            .flatMap(result => result.products)
            .map(product => [product.id, product]),
        ).values(),
      );
    }

    // Filter out products already in cart
    recommendations.items = results
      .filter(product => !uniqueIds.includes(product.product_id))
      .slice(0, RECOMMENDATIONS_LIMIT);

  } catch (error) {
    console.error('Error loading recommendations:', error);
  }
};

// Event handlers
const closeCartDrawer = () => {
  if (isTouchable.value) return;

  isOpen.value = false;

  // Remove visible class from backdrop
  if (backdropElement.value) {
    backdropElement.value.classList.remove('visible');
  }

  unlockBodyScroll();

  // Return focus to the element that was active before opening the drawer
  if (lastActiveElement.value) {
    setTimeout(() => {
      lastActiveElement.value.focus();
      lastActiveElement.value = null;
    }, 300); // Match the transition duration
  }
};

const onTouch = (flag) => {
  isTouchable.value = flag;
};

const onAddProductEvent = async (productId) => {
  try {
    await cartMethods.post('add', { id: parseInt(productId), quantity: 1 });
    await queueLoadCart(false); // Will sync free gift
    // Scroll to top when adding a product
    if (cartRef.value) {
      cartRef.value.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (error) {
    console.error('Error adding product:', error);
  }
};

const onChangeLineItemQuantityEvent = async ({ key, operation: operationType, quantity }) => {
  operation.value = {
    isPerforming: true,
    key,
    operation: operationType,
  };

  try {
    await cartMethods.change({
      id: key,
      quantity: quantity,
    });
    await queueLoadCart(false); // Will sync free gift
  } catch (error) {
    console.error('Error changing item quantity:', error);
  } finally {
    operation.value = {
      isPerforming: false,
      key: undefined,
      operation: undefined,
    };
  }
};

const discountCalculated = (payload) => {
  discounts[payload.key] = payload.discount;
};

const changeLineItem = async (payload) => {
  operation.value = {
    isPerforming: true,
    key: payload.id,
    operation: 'change-line-item',
  };
  try {
    await cartMethods.change(payload);
    await queueLoadCart(false); // Will sync free gift
  } catch (error) {
    console.error('Error changing line item:', error);
  } finally {
    operation.value = {
      isPerforming: false,
      key: undefined,
      operation: undefined,
    };
  }
};

// Helper functions for modularity
const shouldShowInterstitialPopup = (e, cartItemCount) => {
  return shouldShowInterstitial(e, cartItemCount) &&
    !popupRef.state.isVisible &&
    !isOpen.value &&
    (cartItemCount <= (window.BPN?.interstitial?.max_products || 3));
};

const showInterstitialPopup = async (product) => {
  popupRef.open(product);
};

const showBackdrop = () => {
  if (backdropElement.value) {
    backdropElement.value.classList.add('visible');
  } else {
    console.error('Cannot show backdrop - element not found');
  }
};

const focusCloseButton = () => {
  setTimeout(() => {
    const closeButton = cartRef.value?.querySelector('.cart__heading-trigger');
    if (closeButton) {
      closeButton.focus();
    }
  }, 100);
};

const openCartDrawer = async (fetchCart = true) => {
  // Store focused element and show drawer
  lastActiveElement.value = document.activeElement;
  isOpen.value = true;

  // Setup UI elements
  showBackdrop();
  lockBodyScroll();
  focusCloseButton();

  // Load cart data with gift sync
  if (fetchCart) {
    await loadCart();
  }
};

const cartEventListener = async (e) => {
  if (popupRef.state.isVisible) {
    popupRef.close()
  }
  try {
    // Use queued load with gift sync (debounced to prevent API spam)
    await queueLoadCart(false);
    const cartItemCount = store.cart.items.length;

    // Check if we should show interstitial popup
    if (shouldShowInterstitialPopup(e, cartItemCount)) {
      const product = store.cart.items[0];
      await showInterstitialPopup(product);
      return;
    }

    // Otherwise, open cart drawer
    await openCartDrawer();

  } catch (error) {
    console.error('Error in cart event listener:', error);
    if (!isOpen.value) {
      await openCartDrawer();
    }
  }
};

const onCartUpdateEvent = async (event) => {
  if (event.detail) {
    store.cart = event.detail;
  } else {
    await queueLoadCart(false);
  }
};

const handleEscKey = (event) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeCartDrawer();
  }
};

onMounted(async () => {
  backdropElement.value = document.getElementById('cart-backdrop');
  if (backdropElement.value) {
    backdropElement.value.addEventListener('click', closeCartDrawer);
  } else {
    console.error('Backdrop element not found with ID "cart-backdrop"');
  }

  document.addEventListener(EVENTS.OPEN, () => {
    openCartDrawer();
  });

  document.addEventListener(EVENTS.ITEM_ADDED, cartEventListener);

  document.addEventListener(EVENTS.UPDATED, onCartUpdateEvent);
  // document.addEventListener(EVENTS.REBUY_CART_ADD, cartEventListener);
  document.addEventListener('keydown', handleEscKey);

  // Check for openCart param in URL
  const params = new URLSearchParams(window.location.search);
  if (params.get('openCart') === 'true') {
    openCartDrawer();
  }

  window.addEventListener('saleActiveChanged', (e) => {
    configuration.value.saleActive = e.detail.saleActive;
  });

});

onUnmounted(() => {
  // Remove click event from backdrop
  if (backdropElement.value) {
    backdropElement.value.removeEventListener('click', closeCartDrawer);
  }

  // Remove event listeners
  document.removeEventListener(EVENTS.OPEN, cartEventListener);
  document.removeEventListener(EVENTS.UPDATED, onCartUpdateEvent);
  // document.removeEventListener(EVENTS.REBUY_CART_ADD, cartEventListener);
  document.addEventListener(EVENTS.ITEM_ADDED, onCartUpdateEvent);
  document.removeEventListener('keydown', handleEscKey);

  // Ensure body scroll is restored if component unmounts while drawer is open
  if (isOpen.value) {
    unlockBodyScroll();
  }
});

// Watchers
watch(
  () => items.value,
  async () => {
    // Update Facebook promotion if needed
    if (shouldRunSyncFacebookPromotion()) {
      syncFacebookPromotion(items.value);
    }

    // Load product recommendations with a slight delay to prioritize cart display
    if (isOpen.value) {
      setTimeout(() => {
        loadRecommendations();
      }, 500);
    }
  },
  { deep: true },
);

// Update cart count in all header cart count elements
watch(() => totalItemCount.value, () => {
  const cartCountElements = document.querySelectorAll('.cart-count');

  cartCountElements.forEach(element => {
    element.textContent = totalItemCount.value;
  });
});

// Add getCheckoutUrl function
const getCheckoutUrl = () => {
  const baseUrl = configuration.value.cartCheckoutUrl;
  const athleteDiscountCode = window.BPN?.athleteDiscountCode;
  if (athleteDiscountCode) {
    return `${baseUrl}?discount=${athleteDiscountCode}`;
  }
  return baseUrl;
};

// Checks if a cart item is a free gift for a given variant
function isGiftItem(item, variantId) {
  return (
    item.variant_id === variantId &&
    item.properties && (item.properties._isFreeGift === true || item.properties._isFreeGift === 'true')
  );
}

// Simple helper to detect any free gift in cart
// Shopify returns line item properties as strings, so check both boolean and string 'true'
function isAnyFreeGift(item) {
  return item.properties && (item.properties._isFreeGift === true || item.properties._isFreeGift === 'true');
}

// Returns true if any free gift is in the cart
function isFreeGiftInCart() {
  return store.cart?.items?.some(item => isAnyFreeGift(item));
}

// Track pending gift operations to prevent duplicates
let isAddingGift = false;
let isSyncingBFCMGift = false;

// Sync free gift based on threshold and configuration
async function syncFreeGift() {
  if (isSyncingBFCMGift) return;
  if (isAddingGift) return;

  try {
    isSyncingBFCMGift = true;
    isAddingGift = true;

    const isGwpEnabled = configuration.value.enableGwp;
    const isSaleActive = configuration.value.saleActive;
    const giftVariantId = window?.theme?.bfcm?.freeGift?.variantId;
    const giftId = window?.theme?.bfcm?.freeGift?.id;
    const configuredGiftId = giftVariantId || giftId;
    const allGiftItems = store.cart?.items?.filter(item => isAnyFreeGift(item)) || [];

    // Case 1: GWP disabled, sale inactive, or threshold not met → Remove all free gifts
    if (!isGwpEnabled || !isSaleActive || itemsSubtotalPrice.value < 9900) {
      if (allGiftItems.length > 0) {
        for (const giftItem of allGiftItems) {
          await cartMethods.change({ id: giftItem.key, quantity: 0 });
        }
        store.cart = await cartMethods.get();
      }
      return;
    }

    // Case 2: GWP enabled, sale active, threshold met - validate gift configuration
    if (!configuredGiftId) {
      console.error('No gift configured in metaobject');
      return;
    }

    // Case 2a: No gifts in cart, add the configured one
    if (allGiftItems.length === 0) {
      await cartMethods.post('add', {
        id: configuredGiftId,
        quantity: 1,
        properties: { _isFreeGift: true }
      });
      store.cart = await cartMethods.get();
      return;
    }

    // Case 2b: Gift(s) exist - ensure only configured gift with quantity 1
    let hasChanges = false;
    let configuredGiftCount = 0;

    for (const giftItem of allGiftItems) {
      const isConfiguredGift = giftItem.variant_id === giftVariantId || giftItem.variant_id === giftId;

      if (!isConfiguredGift) {
        // Remove old/outdated gift (GWP product was changed)
        await cartMethods.change({ id: giftItem.key, quantity: 0 });
        hasChanges = true;
      } else if (giftItem.quantity !== 1) {
        // Adjust quantity to 1 if it's wrong
        await cartMethods.change({ id: giftItem.key, quantity: 1 });
        hasChanges = true;
      } else {
        configuredGiftCount++;
        // If we already have one valid gift, remove this duplicate
        if (configuredGiftCount > 1) {
          await cartMethods.change({ id: giftItem.key, quantity: 0 });
          hasChanges = true;
        }
      }
    }

    // Reload cart only if we made changes
    if (hasChanges) {
      store.cart = await cartMethods.get();
    }

  } finally {
    isSyncingBFCMGift = false;
    isAddingGift = false;
    if (store.cart.items.length > 0 && store.cart.items.length < 3) {
      await checkLineItemRecommendations(store.cart.items[store.cart.items.length - 1]);
    } else if (store.cart.items.length >= 3) {
      showCompactUpsells.value = true;
    }
  }
}

const onCheckoutClick = async (event) => {
  event.preventDefault();
  event.stopPropagation();

  try {
    // Reload cart fresh from server to catch any console manipulation
    store.isLoading = true;
    store.cart = await cartMethods.get();

    // Sync free gift to ensure cart is clean
    await syncFreeGift();

    // Validate: should have 0 or 1 free gifts, never more
    const freeGiftCount = (store.cart?.items || []).filter(item => isAnyFreeGift(item)).length;
    if (freeGiftCount > 1) {
      store.isLoading = false;
      await syncFreeGift();
      return;
    }

    // Validate: free gift can only exist if subtotal >= $99
    if (itemsSubtotalPrice.value < 9900 && isFreeGiftInCart()) {
      store.isLoading = false;
      const giftItems = store.cart.items.filter(item => isAnyFreeGift(item));
      for (const gift of giftItems) {
        await cartMethods.change({ id: gift.key, quantity: 0 });
      }
      return;
    }

    // All validations passed, submit form
    store.isLoading = false;
    const form = cartRef.value?.querySelector('form.cart__footer');
    if (form) {
      form.submit();
    } else {
      console.error('[Checkout] Form not found');
    }

  } catch (error) {
    console.error('[Checkout] Validation error:', error);
    store.isLoading = false;
  }
};

function prepareLineItemRecommendaitions(recommendationsList, cartItems) {
  const filtered = (recommendationsList || [])
    .filter(rec => !cartItems.some(cartItem => cartItem.product_title === rec.title))
    .map((rec) => {
      if (!rec.selectedVariant && Array.isArray(rec.variants) && rec.variants[0]) {
        rec.selectedVariant = rec.variants[0];
        rec.selectedVariantId = rec.selectedVariant.id;
      }
      return rec;
    });
  return filtered;
}

function applyRecommendations(product, recommendationsList, interstitialData) {
  const recommendations = prepareLineItemRecommendaitions(recommendationsList, store.cart.items);
  product.recommendations = [...recommendations];
  product.interStitialData = { ...interstitialData };
  showCompactUpsells.value = recommendations.length < 1;
}

const checkLineItemRecommendations = async (product) => {
  try {
    if (!window.BPN.interstitial?.cart_recommendations) {
      showCompactUpsells.value = true;
      return;
    }
    const cacheKey = `interstitial_data_v2_${product.product_id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      const cachedData = JSON.parse(cached);
      applyRecommendations(product, cachedData.recommendations, cachedData.interStitialData);
      return;
    }

    // Fetch new recommendations
    let recommendations = await loadInterstitialRecommendations(product)
    applyRecommendations(product, recommendations, recommendations.find(p => p.isCurrentProduct));
    // Cache the recommendations data
    const cacheData = {
      recommendations: recommendations,
      product_id: product.product_id,
      interStitialData: product.interStitialData
    };
    sessionStorage.setItem(`interstitial_data_v2_${product.product_id}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error loading interstitial data:', error);
  }
};

const loadInterstitialRecommendations = async (product) => {
  const { graphqlClient } = await import('../../utils/graphql-client');
  const data = await graphqlClient.query(PRODUCT_WITH_META_FIELDS_QUERY,
    { handle: product.handle, country: window.Shopify.country || 'US', }
  )
  let transformedData = transformProductResponse(data)
  let recommendations = productRecommendations(transformedData)
  return recommendations;
};


</script>
