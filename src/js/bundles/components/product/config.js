import {A11y, FreeMode, Lazy, Navigation, Pagination} from 'swiper';

export const commonConfig = {
  modules: [A11y, FreeMode, Lazy, Pagination, Navigation],
  slidesPerView: 'auto',
  spaceBetween: 16,
  speed: 500,
  loop: false,
  a11y: true,
  freeMode: true,
  preloadImages: false,
  lazy: {
    checkInView: true,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    renderBullet: function (index, className) {
      return `<div class="${className}"></div>`;
    },
  },
};
