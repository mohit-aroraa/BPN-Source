import Swiper from "swiper";

export function toggleNavigation(swiperInstance) {
  const nextBtn = swiperInstance.el.querySelector('.swiper-button-next');
  const prevBtn = swiperInstance.el.querySelector('.swiper-button-prev');

  if (swiperInstance.isLocked) {
    swiperInstance.disable(); // Disable swiper interaction

    if (nextBtn) nextBtn.classList.add('hidden')
    if (prevBtn) prevBtn.classList.add('hidden')
  } else {
    swiperInstance.enable(); // Enable swiper interaction

    if (nextBtn) nextBtn.classList.remove('hidden')
    if (prevBtn) prevBtn.classList.remove('hidden')
  }
}

export const initSlider = (selector, config) => {
  const elements = document.querySelectorAll(
    selector
  );

  elements.forEach((element) => new Swiper(element, config))
}