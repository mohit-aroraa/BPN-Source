import cartHelper, { isSMSGWPProperty } from '../../bundles/utils/helpers/cart-helper';
import { syncHeaderPadding } from '../../bundles/components/global/header';

import { checkSubscriptionByPhone } from '../client/postscript';
import { openModal } from '../utils/postscript';
import { isDesktop } from '../helpers/common';
import {
  getCustomer,
  getCustomerIsSMSSubscribed,
  setCustomerIsSMSSubscribed,
  getCustomerPhone,
} from '../helpers/customer';
import {
  getIsCustomerSawFacebookPromo,
  getIsCustomerFromFacebook,
  setIsCustomerSawFacebookPromo,
  getSmsPromoPopupViewed,
  setSmsPromoPopupViewed,
  setIsSubscribedCustomerFromFacebook,
} from '../storage/customer';
import { getFormattedPhoneNumber, getSMSConfig } from '../helpers/sms';
import { setGuestPhone } from '../storage/customer';
import { EVENTS as CART_EVENTS } from '../../new/vue/cart/constants';
import { EVENTS } from './constatns';

const SMS_SUBSCRIPTION_SYNC_INTERVAL = 20000;

const dom = {};

const closeInformationModal = (event) => {
  event.preventDefault();
  event.stopPropagation();

  dom.modal.classList.add('hidden');

  document.body.classList.remove('overflow-hidden');

  return undefined;
};

const onInformationModalClick = (event) => {
  event.preventDefault();
  event.stopPropagation();

  dom.modal.classList.remove('hidden');
};

const attachEventHandler = (elements, handler, event = 'click') => {
  elements.forEach((element) => {
    element.addEventListener(event, handler);
  });
};

const updateElementsClass = (elements = [], action, className) => {
  elements.forEach((element) => {
    element.classList[action](className);
  });
};

const openSMSBannerPopup = () => {
  const { popupId, mobilePopupId } = window.BPN.smsConfig;

  openModal(isDesktop() ? popupId : mobilePopupId);
};

const openPaidMediaTrafficPopup = () => {
  const { smsBenefitPopupId, smsBenefitMobilePopupId } = window.BPN.smsConfig;

  openModal(isDesktop() ? smsBenefitPopupId : smsBenefitMobilePopupId);
};

const onClickSubscribeTrigger = (event) => {
  event.preventDefault();
  event.stopPropagation();

  openSMSBannerPopup();
};

const syncLineItemsSMSProperty = async (hasSubscription) => {
  const cart = await cartHelper.get();
  const items = cart.items || [];

  for (const item of items) {
    const properties = item.properties || {};

    const shouldUpdateSMSProperty = properties.__SMS !== hasSubscription && !isSMSGWPProperty(properties);

    if (shouldUpdateSMSProperty) {
      const payload = await cartHelper.post('change', {
        id: item.key,
        quantity: item.quantity,
        properties: {
          ...properties,
          '__SMS': hasSubscription,
        },
      });

      document.dispatchEvent(new CustomEvent(CART_EVENTS.UPDATED, { detail: payload }));
    }
  }
};

const getActiveBannerClassName = (hasSubscription) => {
  if (getIsCustomerFromFacebook()) {
    return hasSubscription ? 'paid-media-traffic-announcement-bar-subscribed' : 'paid-media-traffic-announcement-bar';
  }

  return hasSubscription ? 'sms-subscription-subscribed' : 'sms-subscription-not-subscribed';
};

const setDiscount = (discount) => {
  const subscriptionPriceElement = document.querySelector('.subscription-price');
  const SelectedVariationOption = document.querySelector('.variation-option.selected');

  if (subscriptionPriceElement) {
    subscriptionPriceElement.setAttribute('data-discount', discount);
    SelectedVariationOption.click();
  }
};

const onModalClick = (event) => {
  if (event.target === dom.modal) {
    closeInformationModal(event);
  }
};

const toggleBannersVisibility = (hasSubscription) => {
  const activeBannerClassName = getActiveBannerClassName(hasSubscription);

  dom.banners.forEach(banner => {
    if (banner.classList.contains(activeBannerClassName)) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  });
};

const hasProductSaleTag = () => {
  const pattern = /^ssale\d+$/;

  const tags = window.BPN?.currentProductData?.tags || [];

  return tags.some(tag => pattern.test(tag));
};

const syncSMSSubscriptionBanner = (hasSubscription) => {
  toggleBannersVisibility(hasSubscription);

  setDiscount(hasSubscription ? '20' : '15');

  if (hasProductSaleTag()) {
    updateElementsClass(dom.priceBanners, 'add', 'hidden');
    updateElementsClass(dom.priceBannersNot, 'add', 'sale');
  } else if (hasSubscription) {
    updateElementsClass(dom.priceBanners, 'remove', 'hidden');
    updateElementsClass(dom.priceBannersNot, 'add', 'sale');
  } else {
    updateElementsClass(dom.priceBanners, 'add', 'hidden');
    updateElementsClass(dom.priceBannersNot, 'remove', 'sale');
  }

  syncHeaderPadding();
};

export async function syncSMSSubscription() {
  const phone = getCustomerPhone();

  let hasSubscription = getCustomerIsSMSSubscribed();

  if (phone) {
    hasSubscription = await checkSubscriptionByPhone(phone);

    setCustomerIsSMSSubscribed(hasSubscription);
  }

  syncSMSSubscriptionBanner(hasSubscription);
  syncLineItemsSMSProperty(hasSubscription);

  document.dispatchEvent(new CustomEvent(EVENTS.SUBSCRIPTION_UPDATED, {
    detail: { hasSubscription },
  }));
}

const initPostscriptEvents = () => {
  let number;

  const onImpressionEvent = (psPopupId) => {
    const { popupId, mobilePopupId } = window.BPN.smsConfig;

    if ([ popupId, mobilePopupId ].includes(String(psPopupId))) {
      setSmsPromoPopupViewed();
    }

    const { smsBenefitPopupId, smsBenefitMobilePopupId } = window.BPN.smsConfig;

    if ([ smsBenefitPopupId, smsBenefitMobilePopupId ].includes(String(psPopupId))) {
      setIsCustomerSawFacebookPromo();
    }
  };

  const onSubscriberCreatedEvent = () => {
    if (getIsCustomerFromFacebook()) {
      setIsSubscribedCustomerFromFacebook();
    }

    setGuestPhone(number);
    syncSMSSubscription();
  };

  window.addEventListener('postscriptPopup', function(event) {
    const { values, type, popupId: psPopupId } = event.detail || {};

    if (type === 'impression') {
      onImpressionEvent(psPopupId);
    }

    if (type === 'formSubmit') {
      // we need to do it because subscriberCreated has no phone value
      number = getFormattedPhoneNumber(values.phone || '');
    }

    if (type === 'subscriberCreated') {
      onSubscriberCreatedEvent();
    }
  });

  window.addEventListener('postscriptReady', () => {
    const config = getSMSConfig();
    const customer = getCustomer();

    const showPopupDelay = config.showPopupDelay;
    const showPopupWithDelay = config.showPopupWithDelay;
    const isFacebookPromoEnabled = config.isFacebookPromoEnabled;

    const smsMarketingConsent = customer.smsMarketingConsent;

    const showFacebookPopup = isFacebookPromoEnabled && getIsCustomerFromFacebook() && !getIsCustomerSawFacebookPromo();

    if (showFacebookPopup) {
      setTimeout(() => {
        openPaidMediaTrafficPopup();
      }, showPopupDelay);
    } else {
      const showSMSPromo = showPopupWithDelay && !smsMarketingConsent && !getSmsPromoPopupViewed();

      if (showSMSPromo) {
        setTimeout(() => {
          openSMSBannerPopup();
        }, showPopupDelay);
      }
    }
  });
};

const initDOMCache = () => {
  dom.modal = document.querySelector('#sms-subscription-information-modal');
  dom.modalClose = dom.modal.querySelector('.sms-subscription-modal__close-button');

  dom.banners = document.querySelectorAll('.sms-subscription');

  dom.subscribeBanners = document.querySelectorAll('.sms-subscription-not-subscribed');
  dom.priceBannersNot = document.querySelectorAll('.discount-value');
  dom.priceBanners = document.querySelectorAll('.sms-subscription-discount-value');
  dom.subscribeTriggers = document.querySelectorAll('.sms-subscription-not-subscribed button');

  dom.informationBanners = document.querySelectorAll('.sms-subscription-subscribed');
  dom.informationTriggers = document.querySelectorAll('.sms-subscription-subscribed button');

  dom.painTrafficTriggers = document.querySelectorAll('.paid-media-traffic-announcement-bar button');
};

const initEventListeners = () => {
  if (dom.subscribeTriggers) {
    attachEventHandler(dom.subscribeTriggers, onClickSubscribeTrigger);
  }

  if (dom.informationTriggers) {
    attachEventHandler(dom.informationTriggers, onInformationModalClick);
  }

  if (dom.priceBanners) {
    attachEventHandler(dom.priceBanners, onInformationModalClick);
  }

  if (dom.modalClose) {
    dom.modalClose.addEventListener('click', closeInformationModal);
  }

  if (dom.modal) {
    dom.modal.addEventListener('click', onModalClick);
  }

  if (dom.painTrafficTriggers) {
    attachEventHandler(dom.painTrafficTriggers, openPaidMediaTrafficPopup);
  }

  document.addEventListener(EVENTS.OPEN_INFORMATION, () => {
    dom.modal.classList.remove('hidden');
  });
};

export const initSMSSubscription = () => {
  if (getSMSConfig().isEnabled !== true) {
    return;
  }

  initDOMCache();
  initEventListeners();
  initPostscriptEvents();

  setInterval(syncSMSSubscription, SMS_SUBSCRIPTION_SYNC_INTERVAL);

  syncSMSSubscription();
};
