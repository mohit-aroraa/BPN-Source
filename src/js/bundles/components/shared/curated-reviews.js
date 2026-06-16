import Swiper, {
  Navigation,
  A11y,
  Controller,
  Scrollbar,
  FreeMode,
} from 'swiper';
import { THEME_BREAKPOINTS } from '../../utils/constants';

export default function reviewSlider() {
  const reviewSliderElem = document.querySelector('[data-review-block]');
  const reviewerSliderElem = document.querySelector('[data-reviewer-block]');

  let reviewSliderInstance = null;
  let reviewerSliderInstance = null;
  const commonConfig = {
    spaceBetween: 32,
    followFinger: false,
    allowTouchMove: false,
    freeMode: false,
    scrollbar: {
      hide: true,
    },
  };

  if (reviewSliderElem && reviewerSliderElem) {
    if (window.innerWidth > THEME_BREAKPOINTS.mobileLarge) {
      reviewSliderInstance = new Swiper(reviewSliderElem, {
        // Install modules
        modules: [A11y],
        slidesPerView: 1,
        speed: 500,
        loop: false,
        a11y: true,
        direction: 'vertical',
        allowTouchMove: false,
      });
    }
    reviewerSliderInstance = new Swiper(reviewerSliderElem, {
      // Install modules
      modules: [A11y, Navigation, Controller, Scrollbar, FreeMode],
      slidesPerView: 1.2,
      spaceBetween: 20,
      speed: 500,
      loop: false,
      a11y: true,
      watchSlidesProgress: true,
      followFinger: true,
      allowTouchMove: true,
      freeMode: true,
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: false,
      },
      navigation: {
        nextEl: '.js-review-next',
        prevEl: '.js-review-prev',
      },
      controller: {
        control: reviewSliderInstance,
        by: 'slide',
      },
      on: {
        snapGridLengthChange: function () {
          if (this.snapGrid.length != this.slidesGrid.length) {
            this.snapGrid = this.slidesGrid.slice(0);
          }
        },
      },
      // Responsive breakpoints
      breakpoints: {
        640: {
          slidesPerView: 2,
          ...commonConfig,
        },
        1023: {
          slidesPerView: 2,
          ...commonConfig,
        },
        1366: {
          slidesPerView: 3,
          ...commonConfig,
        },
        1920: {
          slidesPerView: 4,
          ...commonConfig,
        },
        3000: {
          slidesPerView: 5,
          ...commonConfig,
        },
      },
    });
  }
}
