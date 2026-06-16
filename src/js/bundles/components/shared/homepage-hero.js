import {initSlider} from "./utils";
import {A11y, FreeMode, Lazy, Navigation, Pagination} from "swiper";

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
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    renderBullet: function (index, className) {
      return `<div class="${className}"></div>`
    },
  },
  breakpoints: {
    959: {
      enabled: true,
      spaceBetween: 32,
      loop: false,
      freeMode: false,
    }
  }
}

const initHomePageSwiper = () => {
  initSlider("[data-homepage-hero-swiper]", config)
}

const initHomepageHero = () => {
  initHomePageSwiper()
}

export default initHomepageHero