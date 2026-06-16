import Swiper, { Navigation, A11y } from 'swiper';

// Only initialize swiper on desktop/tablet large screens
export const tabbedStackSwiper = () => {
  if (window.innerWidth >= 1200) {
    const tabbedStackSwiper = new Swiper('.bpn-athletic-tabbed-stack__products', {
      modules: [Navigation, A11y],
      loop: false,
      observer: true,
      watchOverflow: true,
      slidesPerView: 2,
      spaceBetween: 32,
      navigation: {
        nextEl: '.bpn-athletic-tabbed-stack__products .swiper-button-next',
        prevEl: '.bpn-athletic-tabbed-stack__products .swiper-button-prev',
      },
    });
  }
};


export const multipleColumnSwiper = () => {
  const multipleColumnSwiper = new Swiper('.bpn-athletic-image-multiple-column__slider', {
    modules: [Navigation, A11y],
    slidesPerView: 'auto',
    spaceBetween: 12,
    speed: 600,
    a11y: true,
    freeMode: true,
    preloadImages: true,
    loop: true,
    breakpoints: {
      1024: {
        spaceBetween: 32,
      },
    },
    navigation: {
      nextEl: '.bpn-athletic-image-multiple-column__slider .swiper-button-next',
      prevEl: '.bpn-athletic-image-multiple-column__slider .swiper-button-prev',
    },
  });
};
