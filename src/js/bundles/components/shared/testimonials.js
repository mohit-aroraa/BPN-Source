import Swiper, {A11y, FreeMode, Lazy, Navigation, Pagination, Thumbs,} from "swiper";

const createConfig = (thumb) => {
  return {
    modules: [A11y, FreeMode, Lazy, Navigation, Thumbs],
    slidesPerView: 1,
    spaceBetween: 16,
    touchRatio: 1,
    speed: 300,
    loop: true,
    preloadImages: false,
    lazy: {
      checkInView: true,
    },
    on: {
      slideChange: function (instance) {
        if (thumb.activeIndex !== instance.activeIndex - 1) {
          thumb.slideTo(instance.activeIndex - 1, 0.5, false)
        }
      }
    },
    thumbs: {
      swiper: thumb,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      768: {
        slidesPerView: 'auto',
        spaceBetween: 32,
        slideToClickedSlide: true,
      }
    }
  }

}

const thumbsConfig = {
  modules: [A11y, FreeMode, Lazy, Pagination],
  slidesPerView: 'auto',
  spaceBetween: 16,
  speed: 300,
  freeMode: true,
  preloadImages: false,
  lazy: {
    checkInView: true,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    renderBullet: function (index, className) {
      return `<div class="${className}"></div>`
    },
  },
  breakpoints: {
    768: {
      enabled: false
    }
  }
}

const initTestimonials = () => {
  const thumb = new Swiper("[data-testimonials-thumbs-swiper]", thumbsConfig)

  new Swiper("[data-testimonials-swiper]", createConfig(thumb))
}


export default initTestimonials