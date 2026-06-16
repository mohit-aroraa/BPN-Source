import { getIsCustomerFromFacebook, getIsSubscribedCustomerFromFacebook } from '../storage/customer';

import cartMethods from '../../bundles/utils/helpers/cart-helper';
import { EVENTS } from '../vue/cart/constants';
import { getSMSConfig } from '../helpers/sms';

const { post } = cartMethods;

const getProductFlags = (items, freeProductGiftId) => {
  let hasGiftProduct = false;
  let hasSubscriptionProduct = false;
  let hasOTPProduct = false;
  let giftCount = 0;

  items.forEach((item) => {
    if (String(item.id) === String(freeProductGiftId) && '__SMSGWP' in item.properties) {
      hasGiftProduct = true;
      giftCount = item.quantity;
    } else if ('selling_plan_allocation' in item) {
      hasSubscriptionProduct = true;
    } else {
      hasOTPProduct = true;
    }
  });

  return { hasGiftProduct, hasSubscriptionProduct, hasOTPProduct, giftCount };
};

const shouldAddGift = (productFlags, productPurchaseType) => {
  const { hasSubscriptionProduct, hasOTPProduct } = productFlags;

  if (productPurchaseType === 'Both' && (hasSubscriptionProduct || hasOTPProduct)) {
    return true;
  }

  if (productPurchaseType === 'OTP' && hasOTPProduct) {
    return true;
  }

  return productPurchaseType === 'Subscription' && hasSubscriptionProduct;
};

const handleGiftProduct = async (shouldAddGiftProduct, hasGiftProduct, giftCount) => {
  const { freeProductGiftId } = getSMSConfig();

  if (shouldAddGiftProduct && giftCount > 1) {
    await post('change', {
      id: freeProductGiftId, quantity: 1, properties: {
        '__SMSGWP': true,
      },
    });

    return true;
  }

  if (shouldAddGiftProduct && !hasGiftProduct) {
    await post('add', {
      id: parseInt(freeProductGiftId), quantity: 1, properties: {
        '__SMSGWP': true,
      },
    });

    return true;
  }

  if (!shouldAddGiftProduct && hasGiftProduct) {
    await post('change', {
      id: freeProductGiftId, quantity: 0,
    });

    return true;
  }

  return false;
};

export const shouldRunSyncFacebookPromotion = () => {
  const { isFacebookPromoEnabled } = getSMSConfig();

  if (!isFacebookPromoEnabled || !getIsCustomerFromFacebook()) {

    return false;
  }

  return getIsSubscribedCustomerFromFacebook();
};

const publishCartUpdatedEvent = () => {
  document.dispatchEvent(new CustomEvent(EVENTS.UPDATED, {}));
};

export const syncFacebookPromotion = async (items = []) => {
  const { freeProductGiftId, productPurchaseType } = getSMSConfig();

  const productFlags = getProductFlags(items, freeProductGiftId);

  const shouldAddGiftProduct = shouldAddGift(productFlags, productPurchaseType);

  const isUpdated = await handleGiftProduct(shouldAddGiftProduct, productFlags.hasGiftProduct, productFlags.giftCount);

  if (isUpdated) {
    publishCartUpdatedEvent();
  }
};


