import {A11y, FreeMode, Lazy, Pagination, Navigation} from "swiper";
import {initSlider} from "./utils";

const config = {
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
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    renderBullet: function (index, className) {
      return `<div class="${className}"></div>`
    },
  },
  breakpoints: {
    1440: {
      spaceBetween: 32
    }
  }
}

export const reviewsSlider = () => {
  initSlider("[data-reviews-swiper]", config)
}