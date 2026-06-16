export const getSMSConfig = () => {
  return window.BPN.smsConfig || {};
};

export const getFormattedPhoneNumber = (number = '') => {
  return number.replaceAll(' ', '').replaceAll('-', '').replaceAll('(', '').replaceAll(')', '').replaceAll('+', '');
};
