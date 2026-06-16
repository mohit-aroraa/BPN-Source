import Swiper, { Autoplay, A11y, Thumbs } from "swiper";

export default function featuredPageSlider() {
  const featuredTextSliderElem = document.querySelector(
    "[data-featured-text-slider]"
  );
  const featuredIconSliderElem = document.querySelector(
    "[data-featured-icon-slider]"
  );
  if (featuredTextSliderElem && featuredIconSliderElem) {
    const featuredTextSlider = new Swiper(featuredTextSliderElem, {
      // Install modules
      modules: [A11y],
      speed: 500,
      a11y: true,
      loop: true,
      allowTouchMove: false,
      watchSlidesProgress: true,
    });
    const featuredIconSlider = new Swiper(featuredIconSliderElem, {
      // Install modules
      modules: [A11y, Autoplay, Thumbs],
      speed: 500,
      slidesPerView: 3.8,
      spaceBetween: 24,
      a11y: true,
      loop: true,
      centeredSlides: true,
      allowTouchMove: false,
      autoplay: {
        disableOnInteraction: false,
      },
      thumbs: {
        swiper: featuredTextSlider,
      },
      breakpoints: {
        640: {
          slidesPerView: 5,
          spaceBetween: 32,
        },
      },
    });
  }
}
