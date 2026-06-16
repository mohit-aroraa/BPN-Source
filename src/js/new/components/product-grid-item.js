import Swiper, { Navigation, A11y } from 'swiper';

export const initProductGridItemSlider = () => {
  document.querySelectorAll('.js-product-grid-item-slider').forEach(slider => {
    if (slider.classList.contains('swiper-initialized')) {return;}

    new Swiper(slider, {
      modules: [Navigation, A11y],
      loop: true,
      observer: true,
      watchOverflow: true,
      // Prevent accidental swipe on desktop clicks inside the product link
      simulateTouch: false,
      threshold: 8,
      navigation: {
        nextEl: slider.querySelector('.bpn-swiper-button-next'),
        prevEl: slider.querySelector('.bpn-swiper-button-prev'),
      },
    });
  });
};
