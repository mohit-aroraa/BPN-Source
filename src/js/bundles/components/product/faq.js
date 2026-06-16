import {initSlider} from '../shared/utils';
import {commonConfig} from './config';

const config = {
  ...commonConfig,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    1440: {
      spaceBetween: 32,
    },
  },
};

export const initFaqCarousel = () => {
  initSlider('[data-faq-swiper]', config);
};
