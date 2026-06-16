import Swiper, { Autoplay } from 'swiper';

const announcementBarSelector = '.announcementBar--swiper';
const announcementSlidesSelector = '.announcementBar__item.swiper-slide';

const getSwiperOptions = (announcementSlidesCount, delay = 5000) => {
  if (announcementSlidesCount > 1) {
    return {
      direction: 'vertical',
      
      loop: true,
      slidesPerView: 1,
      modules: [ Autoplay ],
      autoplay: {
        delay,
      },
    };
  }

  return {
    loop: false,
    slidesPerView: 1,
  };
};

export const initAnnouncementBar = () => {
  const $announcementBar = document.querySelector(announcementBarSelector);
  const $announcementSlides = document.querySelectorAll(announcementSlidesSelector);

  if ($announcementBar && $announcementSlides) {
    const { isEnable, slideInterval } = JSON.parse(
      $announcementBar.dataset.announcementsettings,
    );

    if (isEnable && $announcementBar) {
      new Swiper(announcementBarSelector, getSwiperOptions($announcementSlides.length, slideInterval));
    }
  }
};
