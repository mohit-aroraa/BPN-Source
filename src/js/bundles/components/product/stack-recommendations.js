import { initSlider } from '../shared/utils';
import { initProductCard } from '../shared/recommendations';
import cartMethods from '../../utils/helpers/cart-helper';
import { commonConfig } from './config';
import { getCustomerIsSMSSubscribed } from '../../../new/helpers/customer';
import { EVENTS } from '../../../new/vue/cart/constants';

const config = {
  ...commonConfig,
  spaceBetween: 16,
  direction: 'vertical',
  enabled: false,
  slideToClickedSlide: false,
  noSwiping: true,
  a11y: false,
  breakpoints: {
    768: {
      direction: 'horizontal',
      enabled: true,
      spaceBetween: 16,
      slideToClickedSlide: false,
    },
    1024: {
      direction: 'horizontal',
      enabled: true,
      spaceBetween: 32,
      slideToClickedSlide: false,
    },
    1440: {
      slidesPerView: 4,
      direction: 'horizontal',
      enabled: true,
      spaceBetween: 32,
      slideToClickedSlide: false,
    },
  },
};

export const initStackRecommendationsCarousel = () => {
  initSlider('[data-stack-recommendations-swiper]', config);

  document.querySelectorAll('.stack-recommendations').forEach((element) => {
    const cta = element.querySelector('.stack-recommendations-slider__add-button');
    const currencySymbol = window.BPN?.cart?.currencySymbol || '$';

    const addProducts = async () => {
      const items = [];
      const cards = element.querySelectorAll('.product-card');

      cards.forEach(card => {
        if (!card.querySelector('.product-card__selector.selected')) {
          return;
        }

        const button = card.querySelector('.product-card__add-button');

        items.push({
          id: parseInt(button.dataset.variation_id),
          quantity: 1,
          properties: {
            __SMS: getCustomerIsSMSSubscribed(),
          }
        });
      });

      await cartMethods.post('add', { items });
      document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, {
        detail: { items },
      }));
    };

    const updateCTALabel = () => {
      let totalPrice = 0;
      const selectedElements = element.querySelectorAll('.product-card__selector.selected');

      if (selectedElements.length === 0) {
        cta.disabled = true;
        cta.innerHTML = 'select items to add to cart';

        return;
      }

      cta.disabled = false;

      selectedElements.forEach((item) => {
        totalPrice += Number(item.dataset.price);
      });

      cta.innerHTML = `ADD ${selectedElements.length} items TO CART — ${currencySymbol}${totalPrice / 100}`;
    };

    cta.addEventListener('click', addProducts);

    element.querySelectorAll('.product-card').forEach(productCard => {
      initProductCard(productCard);
    });

    element.querySelectorAll('.product-card .product-card__selector').forEach((item) => {
      item.addEventListener('click', (event) => {
        event.stopPropagation();
        event.preventDefault();

        item.classList.toggle('selected');

        updateCTALabel();

        return false;
      });
    });
  });
};
