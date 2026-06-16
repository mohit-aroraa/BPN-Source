import 'Styles/templates/product.flannels.scss';
import productVariantDropdown from '../components/pdp/product-dropdown';
import {
  PRODUCT_PAGE_PRICE_ELEM,
  PRODUCT_PAGE_ADD_TO_CART,
} from '../utils/constants';

// Import Swiper and modules
import Swiper, {
  Navigation,
  Pagination,
  A11y,
  Lazy,
  Thumbs,
  FreeMode,
  Mousewheel,
} from 'swiper';

const pdpSlider = document.querySelectorAll('[data-product-gallery]');

// Initilize swipper for all the product variant
pdpSlider.forEach((slider, index) => {
  const pdpThumb = new Swiper('.js-product-gallery-thumb-' + (index + 1), {
    // Install modules
    modules: [A11y, Lazy, FreeMode, Mousewheel],
    slidesPerView: 4.4,
    spaceBetween: 8,
    freeMode: true,
    watchSlidesProgress: true,
    threshold: 10,
    preloadImages: false,
    lazy: {
      checkInView: true,
      loadPrevNext: true,
      loadOnTransitionStart: true,
    },
    a11y: true,
    mousewheel: {
      releaseOnEdges: true,
    },
    breakpoints: {
      1365: {
        direction: 'vertical',
        slidesPerView: 7.4,
        spaceBetween: 12,
      },
    },
  });
  const pdp = new Swiper('.js-product-gallery-' + (index + 1), {
    // Install modules
    modules: [Navigation, Pagination, A11y, Lazy, Thumbs],
    preloadImages: false,
    lazy: {
      checkInView: true,
    },
    thumbs: {
      swiper: pdpThumb,
    },
    a11y: true,
    navigation: {
      nextEl: '.swiper-button-pdp-next',
      prevEl: '.swiper-button-pdp-prev',
    },
    pagination: {
      el: '.swiper-pagination-pdp',
      type: 'bullets',
      clickable: true,
    },
  });
});

try {
  productVariantDropdown();
} catch (error) {
  console.log('Error on importing module:' + error);
}

function removeSpaceFromPrice(text) {
  if (text) {
    return text.replace('$ ', '');
  }
}

//Get the nutrition modal button
const variantSelector = document.querySelector('.js-product-variant-selector');

const rcContainer = document.getElementById('rc_container');

function subscriptionToggleUiUpdate() {
  const purachaseTypeRadio = document.querySelector(
    'input[name="purchase_type"]:checked',
  );
  const autoDeliverElem = document.getElementById('rc_price_autodeliver');
  const originalpriceElem = document.getElementById('rc_price_onetime');

  const discountPrice = document.querySelector(
    '.purchaseTypeSmallText--discount',
  );
  // Hide afterpay section on load
  const afterPay = document.querySelectorAll('afterpay-placement');

  const originalPrice = removeSpaceFromPrice(originalpriceElem.innerText);
  const subscriptionPrice = removeSpaceFromPrice(autoDeliverElem.innerText);

  const difference = Number(originalPrice) - Number(subscriptionPrice);
  const differenceHasDecimal = difference % 1 === 0 ? false : true;

  discountPrice.innerText = differenceHasDecimal
    ? `Save $${difference.toFixed(2)}`
    : `Save $${difference}.00`;
  discountPrice.style.display = 'block';

  const purachaseType = purachaseTypeRadio && purachaseTypeRadio.value;

  setTimeout(() => {
    const discountedprice = removeSpaceFromPrice(autoDeliverElem.innerText);
    const originalPrice = removeSpaceFromPrice(originalpriceElem.innerText);

    if (purachaseType === 'autodeliver' && PRODUCT_PAGE_PRICE_ELEM.length) {
      const html = `<span class="price-item--strike">${originalPrice}</span>`;

      PRODUCT_PAGE_PRICE_ELEM.forEach((item) => {
        item.classList.add('price-item--red');
        item.innerText = `$${discountedprice}`;
        item.insertAdjacentHTML('beforeend', html);
      });

      if (afterPay.length) {
        afterPay.forEach((item) => {
          item.style.display = 'none';
        });
      }
    } else {
      PRODUCT_PAGE_PRICE_ELEM.forEach((item) => {
        item.classList.remove('price-item--red');
        item.innerHTML = `$${originalPrice}`;
      });

      if (afterPay.length) {
        afterPay.forEach((item) => {
          item.style.display = 'block';
        });
      }
    }
  }, 0);

  const price =
    purachaseType === 'autodeliver'
      ? removeSpaceFromPrice(autoDeliverElem.innerText)
      : removeSpaceFromPrice(originalpriceElem.innerText);

  const buttonText =
    purachaseType === 'autodeliver'
      ? `Subscribe - $${price} / Month`
      : `Add to cart - $${price}`;
  if (PRODUCT_PAGE_ADD_TO_CART) {
    PRODUCT_PAGE_ADD_TO_CART.innerText = buttonText;
  }
}

function waitFor_ReCharge(method) {
  if (
    window.ReCharge &&
    window.rcWidget &&
    rcContainer &&
    rcContainer.style.display === 'block'
  ) {
    method();
  } else {
    setTimeout(function () {
      waitFor_ReCharge(method);
    }, 50);
  }
}

waitFor_ReCharge(function () {
  subscriptionToggleUiUpdate();

  const purcahseTyperadio = document.querySelectorAll(
    'input[name="purchase_type"]',
  );

  if (purcahseTyperadio) {
    purcahseTyperadio.forEach((elem) => {
      elem.addEventListener('change', function () {
        subscriptionToggleUiUpdate();
      });
    });
  }
  if (variantSelector) {
    variantSelector.addEventListener('change', function () {
      setTimeout(() => {
        subscriptionToggleUiUpdate();
      }, 0);
    });
  }
});
