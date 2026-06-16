<template>
  <div class="bpn-product-content__purchase-options" v-if="!props.product.enableStackAndSave">
    <h3 class="bpn-product-content__purchase-options-title">Purchase Type</h3>

    <!-- Subscription options - moved to be first -->
    <div v-if="hasSubscription" class="bpn-product-content__purchase-option"
      :class="{ 'is-active': purchaseTypeModel === 'subscription' }" @click="onOptionClick('subscription')"
      :data-click-id="clickIdPrefix ? `${clickIdPrefix}_drawer_subscribe` : ''">
      <label class="bpn-product-content__purchase-radio-label">
        <input type="radio" name="purchase-type" value="subscription" v-model="purchaseTypeModel"
          class="bpn-product-content__purchase-radio">
        <span class="bpn-product-content__purchase-radio-text">
          <span class="bpn-product-content__purchase-radio-title">
            <span v-html="subscriptionLabel" />
            <span class="bpn-product-content__purchase-radio-subtitle">Pause, Skip or Cancel anytime.</span>
          </span>
          <span class="bpn-product-content__purchase-price bpn-product-content__purchase-price--subscription">
            {{
              formatDiscountedPrice(selectedVariant.price, hasDiscountTag ? tagDiscount : currentDiscount,
                selectedVariant.currencyCode)
            }}
            <span v-if="hasDiscountTag" class="bpn-product-content__purchase-discount">
              Save {{ tagDiscount }}%
            </span>
            <span v-else-if="currentDiscount > 0" class="bpn-product-content__purchase-discount">
              Save {{ calculateSavings(selectedVariant.price, currentDiscount, selectedVariant.currencyCode) }}
            </span>
          </span>
        </span>
      </label>

      <SmsSubscription :click-id-prefix="clickIdPrefix" />
      <!-- Subscription delivery frequency -->
      <div v-if="purchaseTypeModel === 'subscription'" class="bpn-product-content__subscription-frequency">
        <label for="subscription-frequency" class="bpn-product-content__subscription-frequency-label">
          Delivery Every:
        </label>
        <div class="bpn-product-content__custom-dropdown bpn-product-content__dropdown-extra-small">
          <div class="bpn-product-content__dropdown-selected" :class="{ 'active': openDropdown === 'frequency' }"
            @click="toggleDropdown('frequency')">
            <span>{{ getSelectedPlanName() }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          <div v-show="openDropdown === 'frequency'" class="bpn-product-content__dropdown-options high-z-index">
            <div v-for="plan in subscriptionPlans" :key="plan.id" class="bpn-product-content__dropdown-option"
              :class="{ 'bpn-product-content__dropdown-option--selected': subscriptionOptionModel === plan.id }"
              @click="selectSubscriptionPlan(plan.id)"
              :data-click-id="clickIdPrefix ? `${clickIdPrefix}_drawer_sub_frequency_${formatPlanWeeks(plan.name).toLowerCase().replace(/\s+/g, '-')}` : ''">
              <span v-if="props.selectedVariant.variationIcon" v-html="props.selectedVariant.variationIcon"
                class="bpn-product-content__variation-icon">
              </span>
              {{ formatPlanWeeks(plan.name) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- One-time purchase option -->
    <div class="bpn-product-content__purchase-option" :class="{ 'is-active': purchaseTypeModel === 'onetime' }"
      @click="onOptionClick('onetime')" :data-click-id="clickIdPrefix ? `${clickIdPrefix}_drawer_one-time` : ''">
      <label class="bpn-product-content__purchase-radio-label">
        <input type="radio" name="purchase-type" value="onetime" v-model="purchaseTypeModel"
          class="bpn-product-content__purchase-radio">
        <span class="bpn-product-content__purchase-radio-text">
          <span class="bpn-product-content__purchase-radio-title">One-time purchase</span>
          <span v-if="hasDiscountTag" class="bpn-product-content__purchase-price">
            {{
              formatDiscountedPrice(selectedVariant.price, hasDiscountTag ? tagDiscount : currentDiscount,
                selectedVariant.currencyCode)
            }}
            <span class="bpn-product-content__purchase-discount">
              Save {{ tagDiscount }}%
            </span>
          </span>
          <span v-else class="bpn-product-content__purchase-price">
            {{ formatPrice(selectedVariant.price, selectedVariant.currencyCode) }}
          </span>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue';
import SmsSubscription from '../../../vue/cart/sms-subscription.vue';
import { EVENTS } from '../../constatns';
import { getCustomerIsSMSSubscribed } from '../../../helpers/customer';
import { getSMSConfig } from '../../../helpers/sms';
import { formatDiscountedPrice, formatPrice } from './utils';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  selectedVariant: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: String,
    default: 'subscription',
  },
  subscriptionOption: {
    type: String,
    default: '',
  },
  hasDiscountTag: {
    type: Boolean,
    default: false,
  },
  tagDiscount: {
    type: Number,
    default: 0,
  },
  clickIdPrefix: {
    type: String,
    default: '',
  },
});

const openDropdown = ref(null);
const smsConfig = ref(getSMSConfig());
const hasSMSSubscription = ref(getCustomerIsSMSSubscribed());

const emit = defineEmits(['update:modelValue', 'update:subscriptionOption']);

const hasSubscription = computed(() => {
  return props.product.sellingPlanGroups &&
    props.product.sellingPlanGroups.length > 0 &&
    props.product.sellingPlanGroups[0].sellingPlans &&
    props.product.sellingPlanGroups[0].sellingPlans.length > 0;
});

const subscriptionPlans = computed(() => {
  if (!hasSubscription.value) return [];
  return props.product.sellingPlanGroups[0].sellingPlans;
});

const originDiscount = computed(() => {
  if (!hasSubscription.value || !subscriptionOptionModel.value) {
    return 0;
  }

  const selectedPlan = subscriptionPlans.value.find(plan => plan.id === subscriptionOptionModel.value);

  if (selectedPlan) {
    return selectedPlan.discount;
  }

  return 0;
});

const currentDiscount = computed(() => {
  if (!hasSubscription.value || !subscriptionOptionModel.value) {
    return 0;
  }

  const selectedPlan = subscriptionPlans.value.find(plan => plan.id === subscriptionOptionModel.value);

  if (selectedPlan) {
    if (smsConfig.value.isEnabled && hasSMSSubscription.value) {
      return selectedPlan.discount + smsConfig.value.subscriptionDiscountedAmount;
    }

    return selectedPlan.discount;
  }

  return 0;
});

const purchaseTypeModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const subscriptionOptionModel = computed({
  get: () => props.subscriptionOption,
  set: (value) => emit('update:subscriptionOption', value),
});

const onOptionClick = (option) => {
  emit('update:modelValue', option);
};


// Calculate the actual savings amount in currency format
const calculateSavings = (price, discountPercentage, currencyCode) => {
  // Return zero if no discount
  if (discountPercentage <= 0) {
    return formatPrice(0, currencyCode);
  }

  // Calculate the actual amount saved
  const discountAmount = price * (discountPercentage / 100);

  // Let formatPrice handle the currency conversion
  return formatPrice(discountAmount, currencyCode);
};

// Function to format the plan name for display in the dropdown
const formatPlanWeeks = (planName) => {
  // Extract the number of days from plans like "Delivered every 30 days"
  const daysMatch = planName.match(/(\d+)\s+days/i);
  if (daysMatch && daysMatch[1]) {
    const days = parseInt(daysMatch[1]);
    return `${days} Days`;
  }

  // Check for weeks pattern and convert to days as fallback
  const weekMatch = planName.match(/(\d+)\s+weeks?/i);
  if (weekMatch && weekMatch[1]) {
    const weeks = parseInt(weekMatch[1]);
    const days = weeks * 7;
    return `${days} Days`;
  }

  // If can't extract a specific pattern, try to get any number
  const numberMatch = planName.match(/(\d+)/);
  if (numberMatch && numberMatch[1]) {
    return `${numberMatch[1]} Days`;
  }

  return 'Select';
};

// Function to get the selected plan name
const getSelectedPlanName = () => {
  const plan = subscriptionPlans.value.find(p => p.id === subscriptionOptionModel.value);
  if (!plan) return 'Select';

  // Use the same formatting as formatPlanWeeks
  return formatPlanWeeks(plan.name);
};

// Function to toggle the dropdown
const toggleDropdown = (dropdown) => {
  openDropdown.value = openDropdown.value === dropdown ? null : dropdown;
};

// Function to select a subscription plan
const selectSubscriptionPlan = (planId) => {
  subscriptionOptionModel.value = planId;
  toggleDropdown(null);
};

// Click outside handler for dropdown
const handleClickOutside = (event) => {
  if (openDropdown.value !== null) {
    const dropdowns = document.querySelectorAll('.bpn-product-content__custom-dropdown');
    let clickedInside = false;

    dropdowns.forEach(dropdown => {
      if (dropdown.contains(event.target)) {
        clickedInside = true;
      }
    });

    if (!clickedInside) {
      openDropdown.value = null;
    }
  }
};

function smsSubscriptionUpdateListener(event) {
  hasSMSSubscription.value = event.detail.hasSubscription;
}

// Initialize with subscription option on component mount
onMounted(() => {
  if (hasSubscription.value) {
    emit('update:modelValue', 'subscription');

    if (subscriptionPlans.value.length > 0 && !props.subscriptionOption) {
      emit('update:subscriptionOption', subscriptionPlans.value[0].id);
    }
  }

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
  document.addEventListener(EVENTS.SUBSCRIPTION_UPDATED, smsSubscriptionUpdateListener);
});

// Set default purchase type to subscription if available
watch(() => hasSubscription.value, (hasSubscription) => {
  if (hasSubscription) {
    emit('update:modelValue', 'subscription');
  }
}, { immediate: true });

// Set default subscription option
watch(() => subscriptionPlans.value, (newPlans) => {
  if (newPlans.length > 0 && !subscriptionOptionModel.value) {
    emit('update:subscriptionOption', newPlans[0].id);
  }
}, { immediate: true });

// Watch for purchase type changes
watch(() => purchaseTypeModel.value, (newType) => {
}, { immediate: true });

// Display text for subscription label
const subscriptionLabel = computed(() => {
  if (currentDiscount.value > 0) {
    if (props.hasDiscountTag) {
      return `Subscribe & Save <span class="line-through">${originDiscount.value}%</span> <span class="sale">${props.tagDiscount}%</span>`;
    }

    if (smsConfig.value.isEnabled && hasSMSSubscription.value) {
      return `Subscribe & Save <span class="line-through">${originDiscount.value}%</span> ${currentDiscount.value}%`;
    }

    return `Subscribe & Save ${currentDiscount.value}%`;
  }

  return 'Subscribe';
});

onBeforeUnmount(() => {
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener(EVENTS.SUBSCRIPTION_UPDATED, smsSubscriptionUpdateListener);
});
</script>
