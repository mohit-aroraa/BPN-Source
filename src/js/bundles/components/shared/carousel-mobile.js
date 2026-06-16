const initCarousel = () => {

  const runCarousel = () => {
    const carousel = document.querySelector('.carousel-mobile .carousel-mobile__track');

    if (!carousel) {return;}

    function updateMargin() {
      const scrollLeft = carousel.scrollLeft;
      const scrollWidth = carousel.scrollWidth;
      const clientWidth = carousel.clientWidth;
      const maxScrollLeft = scrollWidth - clientWidth;

      if (scrollLeft <= 16) {
        carousel.style.marginLeft = '16px';
        carousel.style.marginRight = '0px';
      } else if (scrollLeft >= maxScrollLeft - 16) {
        carousel.style.marginLeft = '0px';
      } else {
        carousel.style.marginLeft = '0px';
        carousel.style.marginRight = '0px';
      }
    }

    carousel.addEventListener('scroll', updateMargin);
    updateMargin();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runCarousel);
  } else {
    runCarousel();
  }
};

window.initMenuCarousel = initCarousel;

const initMenuCarousel = () => {
  initCarousel();
};

export default initMenuCarousel;