import 'Styles/templates/product.scss';
import MicroModal from 'micromodal';

import { mountProductBuyBox } from '../components/pdp/buy-box';
import testedBlockSlider from '../components/shared/tested-block';
import reviewSlider from '../components/shared/curated-reviews';

const micromodalOptions = {
  awaitCloseAnimation: true,
  disableFocus: true,
  onShow: function () {
    document.documentElement.classList.add('lock-body');
  },
  onClose: function () {
    document.documentElement.classList.remove('lock-body');
  },
};

function openFirstFaq() {
  const firstFAQtrigger = document.querySelector(
    '.js-accordion-section-product [data-accordion-trigger]',
  );
  firstFAQtrigger && firstFAQtrigger.click();
}

try {
  mountProductBuyBox();
  testedBlockSlider();
  reviewSlider();
  openFirstFaq();
  MicroModal.init({ ...micromodalOptions });
} catch (error) {
  console.log('Error on importing module:' + error);
}
