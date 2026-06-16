<template>
  <div class="line-item-subscription">
    <label class="switch" data-click-id="cart_subscription_toggle">
      <input type="checkbox" class="switch__input" :disabled="isOperationActive || isLoading" :checked="hasSubscription"
        @change="handleToggle" />
      <span class="switch__slider"></span>
    </label>

    <div class="details">
      <p class="details-title" v-html="detailsTitle" />
      <p class="details-text">Modify or cancel anytime</p>
      <div v-if="hasSubscription" class="details-options">
        <p class="details-options-name">{{ sellingPlanGroupOption.name }}</p>
        <div class="selector" v-click-outside="closeSelector">
          <button class="selector__trigger" :class="{ active: isActive }" @click.prevent.stop="toggleSelector">
            <span>{{ actualSellingPlanValue }}</span>
            <CustomIcon name="selector-icon" />
          </button>
          <div class="selector__dropdown" :class="{ active: isActive }">
            <p class="selector__dropdown-item" v-for="(value, valueIndex) in sellingPlanGroupOption.values"
              :key="valueIndex" @click="onDropdownItemClick(valueIndex)">{{ value }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { ACTIONS } from './constants';
import CustomIcon from '../components/Icon/custom-icon.vue';
import { getCustomerIsSMSSubscribed } from '../../helpers/customer';
import { EVENTS } from '../../components/constatns';
import { getSMSConfig } from '../../helpers/sms';

const isActive = ref(false);
const smsConfig = ref(getSMSConfig());
const hasSMSSubscription = ref(getCustomerIsSMSSubscribed());

const emits = defineEmits([ACTIONS.UPDATE_LINE_ITEM_SUBSCRIPTION]);

const closeSelector = () => {
  isActive.value = false;
};

const toggleSelector = () => {
  isActive.value = !isActive.value;
};

const props = defineProps({
  hasSubscription: {
    type: Boolean,
  },
  sellingPlanGroup: {
    type: Object,
    default: {
      name: 'Subscribe and Save',
      options: [],
    },
  },
  actualSellingPlanId: {
    type: Number,
  },
  actualSellingPlanPriceAdjustment: {
    type: Number,
  },
  isOperationTarget: {
    type: Boolean,
  },
  isOperationActive: {
    type: Boolean,
  },
  isLoading: {
    type: Boolean,
  },
});

function smsSubscriptionUpdateListener(event) {
  hasSMSSubscription.value = event.detail.hasSubscription;
}

onMounted(() => {
  document.addEventListener(EVENTS.SUBSCRIPTION_UPDATED, smsSubscriptionUpdateListener);
});

onBeforeUnmount(() => {
  document.removeEventListener(EVENTS.SUBSCRIPTION_UPDATED, smsSubscriptionUpdateListener);
});


const sellingPlanGroupName = computed(() => {
  return props.sellingPlanGroup.name;
});

const sellingPlanGroupOption = computed(() => {
  const [option = { name: 'Delivery every', values: [] }] = props.sellingPlanGroup.options;

  return {
    name: option.name,
    values: option.values,
  };
});

const actualSellingPlanValue = computed(() => {
  const plan = props.sellingPlanGroup.selling_plans?.find(item => item.id === props.actualSellingPlanId);
  const { options = [] } = plan || {};

  if (options.length === 0) {
    return props.actualSellingPlanId;
  }

  return options[0].value;
});

const detailsTitle = computed(() => {
  const { actualSellingPlanPriceAdjustment } = props;

  if (smsConfig.value.isEnabled && hasSMSSubscription.value) {
    const currentDiscount = actualSellingPlanPriceAdjustment + smsConfig.value.subscriptionDiscountedAmount;

    return `${sellingPlanGroupName.value} <span class="line-through">${actualSellingPlanPriceAdjustment}%</span> ${currentDiscount}%`;
  }

  return `${sellingPlanGroupName.value} ${actualSellingPlanPriceAdjustment}%`;
});


const handleToggle = () => {
  if (props.actualSellingPlanId) {
    emits(ACTIONS.UPDATE_LINE_ITEM_SUBSCRIPTION, null);
  } else {
    const firstSellingPlanId = props.sellingPlanGroup.selling_plans[0].id;

    emits(ACTIONS.UPDATE_LINE_ITEM_SUBSCRIPTION, firstSellingPlanId);
  }

  closeSelector();
};

const onDropdownItemClick = (index) => {
  const selectedSellingPlan = props.sellingPlanGroup.selling_plans[index];

  emits(ACTIONS.UPDATE_LINE_ITEM_SUBSCRIPTION, selectedSellingPlan.id);

  closeSelector();
};
</script>
