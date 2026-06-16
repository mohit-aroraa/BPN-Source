const IS_CUSTOMER_FROM_FACEBOOK = 'SMS_IS_CUSTOMER_FROM_FACEBOOK';
const IS_CUSTOMER_FACEBOOK_PROMO_VIEWED = 'SMS_IS_CUSTOMER_FACEBOOK_PROMO_VIEWED';
const IS_CUSTOMER_SUBSCRIBED_FROM_FACEBOOK = 'SMS_IS_CUSTOMER_SUBSCRIBED_FROM_FACEBOOK';
const IS_SMS_PROMO_POPUP_VIEWED = 'SMS_IS_SMS_PROMO_POPUP_VIEWED';

const GUEST_PHONE_KEY = 'GUEST_PHONE_KEY';

export const getIsCustomerSawFacebookPromo = () => {
  return localStorage.getItem(IS_CUSTOMER_FACEBOOK_PROMO_VIEWED) === 'true';
};

export const setIsCustomerSawFacebookPromo = () => {
  return localStorage.setItem(IS_CUSTOMER_FACEBOOK_PROMO_VIEWED, 'true');
};

export const getIsCustomerFromFacebook = () => {
  return localStorage.getItem(IS_CUSTOMER_FROM_FACEBOOK) === 'true';
};

export const setSmsPromoPopupViewed = () => {
  if (localStorage.getItem(IS_SMS_PROMO_POPUP_VIEWED) === 'true') {
    return;
  }

  localStorage.setItem(IS_SMS_PROMO_POPUP_VIEWED, 'true');
};

export const getSmsPromoPopupViewed = () => {
  return localStorage.getItem(IS_SMS_PROMO_POPUP_VIEWED) === 'true';
};

export const setIsSubscribedCustomerFromFacebook = () => {
  if (localStorage.getItem(IS_CUSTOMER_SUBSCRIBED_FROM_FACEBOOK) === 'true') {
    return;
  }

  localStorage.setItem(IS_CUSTOMER_SUBSCRIBED_FROM_FACEBOOK, 'true');
};

export const getIsSubscribedCustomerFromFacebook = () => {
  return localStorage.getItem(IS_CUSTOMER_SUBSCRIBED_FROM_FACEBOOK) === 'true';
};

export const setGuestPhone = (phone) => {
  sessionStorage.setItem(GUEST_PHONE_KEY, phone);

  window.BPN.customer.phone = phone;
};
