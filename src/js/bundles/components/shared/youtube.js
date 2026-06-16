import { initSlider } from './utils';
import { A11y, FreeMode, Lazy, Navigation, Pagination } from 'swiper';
import { initProductCard } from './recommendations';

const config = {
  modules: [ A11y, FreeMode, Lazy, Pagination, Navigation ],
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
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    renderBullet: function(index, className) {
      return `<div class="${className}"></div>`;
    },
  },
  breakpoints: {
    1440: {
      spaceBetween: 32,
    },
  },
};

const toggleDocumentOverflow = (add = false) => {
  if (add) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
};
const initDrawer = (youtube) => {
  const closeButton = youtube.querySelector('.bpn-youtube__drawer-close-button');

  closeButton.addEventListener('click', (event) => {
    event.preventDefault();

    toggleDocumentOverflow();
    event.target.closest('.js-bpn-youtube-drawer').classList.add('hidden');

    return false;
  });

  const drawer = youtube.querySelector('.js-bpn-youtube-drawer');

  drawer.addEventListener('click', (event) => {
    event.preventDefault();

    if (event.target.classList.contains('js-bpn-youtube-drawer')) {
      toggleDocumentOverflow();
      event.target.classList.add('hidden');
    }

    return false;
  });
};

const initProductCards = (youtube) => {
  const productCards = youtube.querySelectorAll('.product-card');

  productCards.forEach(initProductCard);
};

const initLinks = (youtube) => {

  const links = youtube.querySelectorAll('[data-youtube-swiper] .js-bpn-youtube-video-link');

  links.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const index = event.target.dataset.index;

      toggleDocumentOverflow(true);
      event.target.closest('.js-bpn-youtube').querySelector('.js-bpn-youtube-drawer').classList.remove('hidden');

      const lists = youtube.querySelectorAll('.js-bpn-youtube-product-list');

      lists.forEach(list => {
        if (list.classList.contains(`bpn-youtube__product-list--${index}`)) {
          list.classList.remove('hidden');
        } else {
          list.classList.add('hidden');
        }
      });

      return false;
    });
  });
};
const initYoutube = () => {
  initSlider('[data-youtube-swiper]', config);

  const youtubeSections = document.querySelectorAll('.js-bpn-youtube');

  youtubeSections.forEach(youtube => {
    initDrawer(youtube);
    initProductCards(youtube);
    initLinks(youtube);
  });
};

export default initYoutube;
