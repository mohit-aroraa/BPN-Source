import {initSlider} from '../shared/utils';
import {commonConfig} from './config';

const config = {
  ...commonConfig,
  breakpoints: {
    1440: {
      enabled: false,
      spaceBetween: 0,
    },
  },
};

export const initProductDetailsCarousel = () => {
  initSlider('[data-product-details-swiper]', config);
};
