import { createApp } from 'vue';
import productStore from '../../../utils/store/productStore';
import BuyBox from './BuyBox.vue';
import { decimalPrice } from '../../../utils/helpers/utility';
import clickOutside from '../../../utils/directives/click-outside';

export const mountProductBuyBox = () => {
  const productBuyBox = createApp(BuyBox);

  productBuyBox.use(productStore);
  productBuyBox.directive('click-outside', clickOutside);

  productBuyBox.mount('#js_pdp_buy_box');
}
