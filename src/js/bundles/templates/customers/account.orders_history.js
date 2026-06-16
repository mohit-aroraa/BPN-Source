import {
  A11y,
  Lazy,
  FreeMode,
  Mousewheel,
  Navigation,
} from 'swiper';
import { initSlider, toggleNavigation } from '../../components/shared/utils';

const initOrdersHistorySliders = () => {
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

initOrderSummaryClick();
initOrdersHistorySliders();
