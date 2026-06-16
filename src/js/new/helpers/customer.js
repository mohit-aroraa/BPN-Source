export const getCustomerSmsMarketingConsent = () => {
  return window.BPN.customer.smsMarketingConsent;
};

export const getCustomer = () => {
  return window.BPN.customer || {};
};

export const getCustomerIsSMSSubscribed = () => {
  const { isSMSSubscribed = false } = getCustomer();

  return isSMSSubscribed;
};

export const getCustomerPhone = () => {
  const { phone = undefined } = getCustomer();

  return phone;
};

export const getCustomerEmail = () => {
  const { email = undefined } = getCustomer();

  return email;
};

export const setCustomerIsSMSSubscribed = (isSMSSubscribed) => {
  window.BPN.customer.isSMSSubscribed = isSMSSubscribed;
};
