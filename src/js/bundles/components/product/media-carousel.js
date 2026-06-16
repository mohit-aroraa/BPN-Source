import {initSlider} from '../shared/utils';
import {commonConfig} from './config';

export const initMediaCarousel = () => {
  const el = document.querySelector('[data-media-carousel-swiper]');

  if (!el) return;
  const slides = el.querySelectorAll('.swiper-slide');

  const config = {
    ...commonConfig,
    centeredSlides: false,
    loop: slides.length !== 1,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    on: {
      slideChange: function (instance) {
        const currentStep = instance.el.querySelector('.current_step');
        const videos = instance.el.parentNode.querySelectorAll('.media-carousel__videos-container .iframe-container');
        const videosCount = videos.length;
        const currentSlide = instance.activeIndex % videosCount;

        if (currentStep) {
          currentStep.innerHTML = currentSlide + 1;
        }

        videos.forEach((video, index) => {
          if (index === currentSlide) {
            video.classList.remove('hidden');
          } else {
            video.classList.add('hidden');
          }
        });
      },
    },
  };

  initSlider('[data-media-carousel-swiper]', config);
};
