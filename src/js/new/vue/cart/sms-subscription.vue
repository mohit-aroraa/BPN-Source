<template>
  <section
    v-if="smsConfig.isEnabled === true"
    class="sms-subscription"
    :style="style"
  >
    <button v-if="buttonText !== undefined"
            class="sms-subscription__button"
            data-action="subscribe"
            v-html="buttonText"
            @click="onButtonClick(modalId)"
            :data-click-id="clickId"
    />
    <span class="sms-subscription__text" v-html="text" />
  </section>

</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { getSMSConfig } from '../../helpers/sms';
import { getCustomerIsSMSSubscribed } from '../../helpers/customer';
import { isDesktop } from '../../helpers/common';
import {
  getIsSubscribedCustomerFromFacebook,
  getIsCustomerFromFacebook,
} from '../../storage/customer';
import { openModal } from '../../utils/postscript';
import { EVENTS } from '../../components/constatns';

const smsConfig = ref(getSMSConfig());
const hasSubscription = ref(getCustomerIsSMSSubscribed());

const props = defineProps({
  clickIdPrefix: {
    type: String,
    default: ''
  }
});

function smsSubscriptionUpdateListener(event) {
  hasSubscription.value = event.detail.hasSubscription;
}

onMounted(() => {
  document.addEventListener(EVENTS.SUBSCRIPTION_UPDATED, smsSubscriptionUpdateListener);
});

onUnmounted(() => {
  document.removeEventListener(EVENTS.SUBSCRIPTION_UPDATED, smsSubscriptionUpdateListener);
});

const STATE = {
  paidMediaTrafficSubscribed: 'paidMediaTrafficSubscribed',
  paidMediaTraffic: 'paidMediaTraffic',
  subscribed: 'subscribed',
  notSubscribed: 'notSubscribed',
};

const state = computed(() => {
  if (getIsSubscribedCustomerFromFacebook()) {
    return hasSubscription.value ? STATE.paidMediaTrafficSubscribed : STATE.paidMediaTraffic;
  }
  return hasSubscription.value ? STATE.subscribed : STATE.notSubscribed;
});

const buttonText = computed(() => {
  if (state.value === STATE.paidMediaTrafficSubscribed) {
    return undefined;
  }
  return smsConfig.value.announcementBarSettings[state.value]?.buttonText;
});

const text = computed(() => {
  return smsConfig.value.announcementBarSettings[state.value]?.text;
});

const clickId = computed(() => {
  if (hasSubscription.value) {
    return props.clickIdPrefix ? `${props.clickIdPrefix}_drawer_subscribe_sms-why` : 'cart_sms-why';
  }

  return props.clickIdPrefix ? `${props.clickIdPrefix}_drawer_subscribe_sms` : 'cart_sms';
});

const style = computed(() => {
  return {
    flexDirection: STATE.subscribed === state.value ? 'row-reverse' : 'row',
    '--background-color': smsConfig.value.announcementBarSettings.backgroundColor,
    '--text-color': smsConfig.value.announcementBarSettings.textColor,
  };
});

const modalId = computed(() => {
  const { smsBenefitPopupId, smsBenefitMobilePopupId, popupId, mobilePopupId } = smsConfig.value;
  if (getIsCustomerFromFacebook()) {
    return isDesktop() ? smsBenefitPopupId : smsBenefitMobilePopupId;
  }

  return isDesktop() ? popupId : mobilePopupId;
});

const onButtonClick = (id) => {
  if (hasSubscription.value) {
    document.dispatchEvent(new CustomEvent(EVENTS.OPEN_INFORMATION));
  } else {
    openModal(id);
  }
};

</script>
