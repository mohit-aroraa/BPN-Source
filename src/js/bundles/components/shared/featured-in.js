import Swiper, { Autoplay, A11y, Lazy } from "swiper";

export default function featuredInSlider() {
  const featuredInElem = document.querySelectorAll("[data-featured-in-slider]");
  featuredInElem.forEach((item) => {
    new Swiper(item, {
      // Install modules
      modules: [A11y, Autoplay, Lazy],
      speed: 500,
      slidesPerView: 3.6,
      spaceBetween: 15,
      a11y: true,
      loop: true,
      allowTouchMove: false,
      preloadImages: false,
      lazy: {
        checkInView: true,
      },
      autoplay: {
        disableOnInteraction: false,
      },
      breakpoints: {
        640: {
          slidesPerView: 5,
          spaceBetween: 32,
          autoplay: { enabled: false, loop: false },
        },
      },
    });
  });
}
