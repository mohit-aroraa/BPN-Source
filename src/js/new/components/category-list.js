import { initSlider } from '../../bundles/components/shared/utils';
import { A11y, FreeMode, Lazy, Pagination } from 'swiper';

const config = {
  modules: [ A11y, FreeMode, Lazy, Pagination ],
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
    el: '.swiper-pagination',
    clickable: true,
    renderBullet: function(index, className) {
      return `<div class="${className}"></div>`;
    },
  },
  breakpoints: {
    959: {
      enabled: true,
      spaceBetween: 32,
      loop: false,
      freeMode: false,
    },
  },
};

const initCategoryListSwiper = () => {
  const swiperElements = document.querySelectorAll('[data-homepage-hero-swiper]');

  swiperElements.forEach(element => {
    const slides = element.querySelectorAll('.swiper-slide');
    const pagination = element.querySelector('.swiper-pagination');

    // Hide pagination on desktop and show on mobile based on slide count
    const handlePaginationDisplay = () => {
      if (pagination) {
        if (window.innerWidth >= 959 && slides.length <= 4) {
          pagination.style.display = 'none';
        } else {
          pagination.style.display = 'flex';
        }
      }
    };

    // Initial check
    handlePaginationDisplay();

    // Update on window resize
    window.addEventListener('resize', handlePaginationDisplay);
  });

  initSlider('[data-homepage-hero-swiper]', config);
};

const initCategoryList = () => {
  initCategoryListSwiper();
};

export default initCategoryList;
