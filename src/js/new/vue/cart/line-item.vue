<template>
  <div v-if="!isFreeGiftItem(item)" class="line-item">
    <div class="line-item__left">
      <a class="line-item__link" :href="item.url" data-click-id="cart_thumbnail_clicks">
        <img class="line-item__image" :src="item.image" :alt="item.title" data-click-id="cart_thumbnail_clicks" />
      </a>

      <div class="quantity-selector" v-if="!isFreeGiftItem(item)">
        <button v-if="!isSMSGWPProduct && !isFreeGiftItem(item)" class="quantity-selector__button"
          @click.prevent="emitChangeLineItemQuantity(item.key, 'minus')" :class="{ loading: operation === 'minus' }"
          :disabled="isOperationTarget || isOperationActive || isLoading" data-click-id="cart_quantity_decrease">
          <CustomIcon :name="operation === 'minus' ? 'loader' : 'decrease'" click-id="cart_quantity_decrease" />
        </button>
        <p class="quantity-selector__quantity" v-html="item.quantity" />
        <button v-if="!isSMSGWPProduct && !isFreeGiftItem(item)" class="quantity-selector__button"
          :class="{ loading: operation === 'plus' }" @click.prevent="emitChangeLineItemQuantity(item.key, 'plus')"
          :disabled="isOperationTarget || isOperationActive || isLoading" data-click-id="cart_quantity_increase">
          <CustomIcon :name="operation === 'plus' ? 'loader' : 'increase'" click-id="cart_quantity_increase" />
        </button>
      </div>
    </div>
    <div class="line-item__right">
      <div class="line-item__details">
        <div>
          <h4 v-html="item.product_title" class="line-item__heading" />
        </div>

        <div v-if="hasSubscription || hasDiscount || hasDiscountTag" class="line-item__price">
          <span class="sale" v-text="price"></span>
          <span class="compare" v-text="comparePrice"></span>
        </div>
        <div class="line-item__price" v-else-if="isFreeGiftItem(item)">
          <span class="sale">$0.00</span>
          <span class="compare" v-text="comparePrice"></span>
        </div>
        <div v-else class="line-item__price">
          <span v-text="price"></span>
        </div>
      </div>
      <template v-if="!isFreeGiftItem(item)">
        <p v-if="hasDiscountTag" class="line-item__discount sale">
          Save {{ tagDiscount }}%
        </p>
        <p v-else v-for="discount in item.discounts" class="line-item__discount">
          {{ discount.title }}
        </p>
      </template>

      <p v-for="(option, index) in visibleOptions" class="line-item__text" :key="index">
        {{ option.name }}: {{ option.value }}
      </p>
      <p v-if="isFreeGiftItem(item)">
        <span class="line-item__free-gift">Free Gift</span>
      </p>

      <LineItemSubscription
        v-if="hasSellingPlanGroups && !isFreeGiftItem(item) && !isGoGelProduct && variantHasSellingPlans"
        :sellingPlanGroup="sellingPlanGroup" :hasSubscription="hasSubscription"
        :actualSellingPlanId="actualSellingPlanId" :actualSellingPlanPriceAdjustment="actualSellingPlanPriceAdjustment"
        :isOperationTarget="isOperationTarget" @updateLineItemSubscription="updateLineItemSubscription"
        :isOperationActive="isOperationActive" :isLoading="isLoading" />
    </div>
  </div>
  <BfcmGift :added="true" :itemId="item.key" :item="item" v-if="isFreeGiftItem(item)" />
  <LineItemRecommendations v-if="item.recommendations && item.recommendations.length > 0" :totalItems="totalItems"
    :item="item" />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { isSMSGWPProperty } from '../../../bundles/utils/helpers/cart-helper';
import { safeGet, exists } from '../utils/vue-safety';

import { fetchProductSubscriptions } from '../../client/product';
import { ACTIONS } from './constants';
import { getFormattedPrice } from './helpers';
import { formatDiscountedPrice } from '../../components/product-drawer/vue/utils';
import LineItemSubscription from './line-item-subscription.vue';
import LineItemRecommendations from './line-item-recommendations.vue';
import CustomIcon from '../components/Icon/custom-icon.vue';
import { isFreeGiftItem } from './helpers';
import BfcmGift from './bfcm-gift.vue';

const props = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
  currencyCode: {
    type: String,
    default: () => 'USD',
  },
  operation: {
    type: String,
    default: () => undefined,
  },
  isOperationTarget: {
    type: Boolean,
    default: () => false,
  },
  isOperationActive: {
    type: Boolean,
    default: () => false,
  },
  totalItems: {
    type: Number,
    default: () => 0,
  },
  isLoading: {
    type: Boolean,
    default: () => false,
  },
});

const currencySymbol = window.BPN?.cart?.currencySymbol;

const productSubscriptions = ref(undefined);

const emit = defineEmits([ACTIONS.CHANGE_QUANTITY, ACTIONS.CHANGE_LINE_ITEM, ACTIONS.DISCOUNT_CALCULATED]);

const emitChangeLineItemQuantity = (key, operation) => {
  const quantity = operation === 'plus' ? props.item.quantity + 1 : props.item.quantity - 1;

  emit(ACTIONS.CHANGE_QUANTITY, {
    key,
    quantity,
    operation,
  });
};

onMounted(() => {
  const handle = safeGet(props, 'item.handle');
  if (handle) {
    fetchProductSubscriptions(handle).then((data) => {
      productSubscriptions.value = data;
    }).catch(error => {
      console.warn('Error fetching product subscriptions:', error);
    });
  }
});

onUnmounted(() => {
  if (hasDiscountTag.value) {
    emit(ACTIONS.DISCOUNT_CALCULATED, {
      key: safeGet(props, 'item.key'),
      discount: 0,
    });
  }
});

const activeDiscountTag = computed(() => {
  const pattern = /^ssale\d+$/;

  const tags = safeGet(productSubscriptions, 'value.tags', []);

  const match = tags.find(item => pattern.test(item));

  if (match) {
    return {
      hasDiscountTag: true,
      discount: Number(match.replace('ssale', '')),
    };
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

watch(() => tagDiscount.value, () => {
  if (hasDiscountTag.value) {
    emit(ACTIONS.DISCOUNT_CALCULATED, {
      key: safeGet(props, 'item.key'),
      discount: tagDiscount.value,
    });
  }
});

const updateLineItemSubscription = (selling_plan) => {
  emit(ACTIONS.CHANGE_LINE_ITEM, {
    id: safeGet(props, 'item.key'),
    quantity: safeGet(props, 'item.quantity', 1),
    selling_plan,
  });
};

const isSMSGWPProduct = computed(() => {
  return isSMSGWPProperty(safeGet(props, 'item.properties', {}));
});

const isGoGelProduct = computed(() => {
  return safeGet(props, 'item.handle') === 'go-gel';
});

const hasSubscription = computed(() => {
  return exists(safeGet(props, 'item.selling_plan_allocation'));
});

const stackAndSaveEnabled = computed(() => {
  return window.BPN?.stackAndSaveProductHandles?.includes(props.item.handle) ?? false;
});

const hasDiscount = computed(() => {
  return safeGet(props, 'item.discounted_price') !== safeGet(props, 'item.price');
});

const comparePrice = computed(() => {
  if (hasSubscription && 'selling_plan_allocation' in props.item) {
    return getFormattedPrice(props.item.selling_plan_allocation.compare_at_price, currencySymbol);
  }

  return getFormattedPrice(props.item.price, currencySymbol);
});

const price = computed(() => {
  if (hasDiscountTag.value) {
    let value = props.item.price;

    if (hasSubscription && 'selling_plan_allocation' in props.item) {
      value = props.item.selling_plan_allocation.compare_at_price;
    }

    return formatDiscountedPrice(value / 100, tagDiscount.value, props.currencyCode);
  }

  return getFormattedPrice(props.item.discounted_price, currencySymbol);
});

const hasSellingPlanGroups = computed(() => {
  if (productSubscriptions.value && productSubscriptions.value.allow_subscriptions !== false) {
    return safeGet(productSubscriptions.value, 'selling_plan_groups', []).length !== 0;
  }

  return false;
});

const variantHasSellingPlans = computed(() => {
  const variantId = String(safeGet(props, 'item.variant_id'));
  const variants = safeGet(productSubscriptions.value, 'variants', {});
  const variantData = Object.values(variants).find(v => String(v.id) === variantId);

  // If we can't determine yet (data still loading), default to showing the toggle
  if (!variantData) return true;

  return safeGet(variantData, 'selling_plan_allocations', []).length > 0;
});

const sellingPlanGroup = computed(() => {
  if (productSubscriptions.value !== undefined) {
    return safeGet(productSubscriptions.value, 'selling_plan_groups.0', {});
  }

  return {};
});

const actualSellingPlanId = computed(() => {
  try {
    return safeGet(props, 'item.selling_plan_allocation.selling_plan.id');
  } catch (e) {
    return null;
  }
});

const actualSellingPlanPriceAdjustment = computed(() => {
  try {
    return safeGet(sellingPlanGroup.value, 'selling_plans.0.price_adjustments.0.value');
  } catch (e) {
    return 0;
  }
});

const visibleOptions = computed(() => {
  const options = safeGet(props, 'item.options_with_values', []);
  return options.filter(option => safeGet(option, 'value') !== 'Default Title');
});
</script>
