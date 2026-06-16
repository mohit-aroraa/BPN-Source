import { EVENTS } from './constants';

export const openCartDrawer = () => {
  document.dispatchEvent(new CustomEvent(EVENTS.OPEN, {}));
};

export const getFormattedPrice = (price, currency = '$') => {
  return `${currency}${(price / 100).toFixed(2)}`;
};

export const isFreeGiftItem = (item) => {
  return item.properties && (item.properties['_isFreeGift'] === true || item.properties['_isFreeGift'] === 'true');
};
