import {
  A11y,
  Lazy,
  FreeMode,
  Mousewheel, Navigation,
} from 'swiper';
import { initSlider, toggleNavigation } from '../../components/shared/utils';

import featuredCollection from '../../components/shared/featured-collection';

try {
  featuredCollection();
} catch (error) {
  console.log(error);
}

const isChallangeReferrer = () => {
  const referrer = document.referrer;

  return referrer && referrer.includes('/challenge');
};

function hasLoginSuccessParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const loginSuccessParam = urlParams.get('login_success');

  return loginSuccessParam && loginSuccessParam.toLowerCase() === 'true';
}

const initOrderSliders = () => {
  initSlider('[data-order-images-swiper]', {
    modules: [ A11y, Lazy, FreeMode, Mousewheel, Navigation ],
    slidesPerView: 'auto',
    loop: false,
    a11y: true,
    freeMode: true,
    preventClicks: true,
    spaceBetween: 8,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    on: {
      init() {
        toggleNavigation(this);
      },
      resize() {
        toggleNavigation(this);
      },
    },
  });
};

const initOrderSummaryClick = () => {
  document.querySelectorAll('.order-summary').forEach(order => {
    order.addEventListener('click', (event) => {

      if (event.target.classList.contains('swiper-button-prev') || event.target.classList.contains('swiper-button-next')) {
        return;
      }

      const { href } = event.currentTarget.dataset;

      if (href) {
        window.location.href = href;
      }
    });
  });
};

initOrderSliders();
initOrderSummaryClick();

if (hasLoginSuccessParam() || isChallangeReferrer()) {
}
