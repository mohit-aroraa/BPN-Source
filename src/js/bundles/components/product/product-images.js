import Swiper from 'swiper';
import { FreeMode, Lazy, Navigation, Pagination, Thumbs } from 'swiper';

const getOffset = () => {
  const header = document.querySelector('.pageHeader');
  const productHero = document.querySelector('#product-hero');
  const style = window.getComputedStyle(productHero);

  return `${header.offsetHeight + parseInt(style.getPropertyValue('padding-top'))}px`;
};

const setProductImagesCarouselTop = () => {
  const container = document.querySelector('#MainContent');
  const carousel = document.querySelector('.product-images-carousel');

  if (container && window.innerWidth >= 768) {
    container.classList.remove('mid-container');

    carousel.style.top = getOffset();
  }
};

export const initProductImagesSlider = () => {
  let thumbsSwiper;
  let swiper;

  setProductImagesCarouselTop();
  const verticalSliderConfig = {
    modules: [ FreeMode, Lazy, Pagination ],
    slidesPerView: 'auto',
    spaceBetween: 12,
    speed: 500,
    loop: false,
    freeMode: true,
    preloadImages: false,
    slideToClickedSlide: true,
    on: {
      click: (instance) => {
        const slides = [];

        instance.wrapperEl.querySelectorAll('.image-slide').forEach(slide => {
          if (!slide.classList.contains('hidden')) {
            slides.push(slide);
          }
        });

        const index = slides.reduce((previousValue, currentValue, currentIndex) => {
          if (currentValue === instance.clickedSlide) {
            return currentIndex;
          }

          return previousValue;
        }, 0);

        swiper.slideTo(index);
      },
    },
    lazy: {
      checkInView: true,
    },
    direction: 'vertical',
  };

  thumbsSwiper = new Swiper('.product-images-carousel-vertical-slider', verticalSliderConfig);

  const config = {
    modules: [ Lazy, Pagination, Navigation, Thumbs ],
    slidesPerView: 'auto',
    speed: 500,
    loop: false,
    preloadImages: false,
    lazy: {
      checkInView: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    thumbs: {
      swiper: thumbsSwiper,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: function (index, className) {
        return `<div class="${className}"></div>`;
      },
    },
  };

  swiper = new Swiper('[data-product-images-carousel-slider]', config);

  return [ thumbsSwiper, swiper ];
};
