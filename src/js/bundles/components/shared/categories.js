import Swiper, { A11y, FreeMode, Lazy } from 'swiper';
import { THEME_BREAKPOINTS } from '../../utils/constants';


export default function categoriesSlider() {
  const categoriesSliderElems = document.querySelectorAll(
    '[data-categories-swiper]',
  );

  if (window.innerWidth < THEME_BREAKPOINTS.tablet) {
    categoriesSliderElems.forEach((elem) => {
      new Swiper(elem, {
        modules: [A11y, FreeMode, Lazy],
        slidesPerView: 1.2,
        spaceBetween: 12,
        speed: 500,
        loop: false,
        a11y: true,
        freeMode: true,
        preloadImages: false,
        lazy: {
          checkInView: true,
        },
        // Responsive breakpoints
        breakpoints: {
        // when window width is >= 640px
          640: {
            slidesPerView: 2,
          },
        },
      });
    });
  }
}
