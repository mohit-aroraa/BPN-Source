import 'Styles/templates/product.redesign.scss';

import {initPDPRedesign} from '../components/product';

try {
  const isProductRedesignPage = Boolean(document.querySelector('#product-hero'));

  if (isProductRedesignPage) {
    setTimeout(() => {
      initPDPRedesign();
    }, 300);
  }
} catch (error) {
  console.log('error: ', error);
  throw error;
}
