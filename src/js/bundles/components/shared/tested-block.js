import Swiper, { Scrollbar, A11y, FreeMode } from "swiper";
import { THEME_BREAKPOINTS } from "../../utils/constants";

export default function testedBlockSlider() {
  const slider = document.querySelectorAll("[data-bare-standard-slider]");
  if (window.innerWidth < THEME_BREAKPOINTS.tablet)
    slider.forEach((item) => {
      new Swiper(item, {
        // Install modules
        modules: [Scrollbar, A11y, FreeMode],
        speed: 500,
        slidesPerView: 1.24,
        spaceBetween: 16,
        a11y: true,
        freeMode: true,
        scrollbar: {
          el: ".swiper-scrollbar",
          hide: false,
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
