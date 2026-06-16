import Swiper, { A11y, Scrollbar, FreeMode } from 'swiper';

export default function communityBlock() {
  const sliderElems = document.querySelectorAll('[data-featured-slider]');
  const triggers = document.querySelectorAll('.js-tab-trigger');
  const articleBody = document.querySelectorAll('.js-article-wrapper');
  const viewAllButtons = document.querySelectorAll('.js-view-all-content');

  sliderElems.forEach((item) => {
    new Swiper(item, {
      // Install modules
      modules: [A11y, Scrollbar, FreeMode],
      slidesPerView: 1.2,
      spaceBetween: 20,
      speed: 500,
      observer: false,
      loop: false,
      a11y: true,
      freeMode: true,
      scrollbar: {
        el: '.swiper-scrollbar',
        hide: false,
      },
      // Responsive breakpoints
      breakpoints: {
        // when window width is >= 640px
        640: {
          slidesPerView: 2.4,
        },
        767: {
          slidesPerView: 3,
          freeMode: false,
          scrollbar: {
            hide: true,
          },
          spaceBetween: 30,
        },
      },
    });
  });
  triggers.forEach((elem) => {
    elem.addEventListener('click', function (e) {
      const target = this.dataset.target;
      const link = this.dataset.allLink;
      const text = this.dataset.allText || 'View all content';
      const prevActiveLink = document.querySelector('.js-tab-trigger.active');
      const targetElem = document.querySelector(target);
      articleBody.forEach((item) => {
        item.classList.add('hide');
      });
      if (targetElem) {
        targetElem.classList.remove('hide');
      }
      if (prevActiveLink) {
        prevActiveLink.classList.remove('active');
        this.classList.add('active');
      }
      //Set view all button link
      viewAllButtons.forEach((item) => {
        item.href = link;
        item.innerText = text;
      });
    });
  });
}
