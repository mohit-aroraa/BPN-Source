import cartMethods from '../../utils/helpers/cart-helper';
import { openCartDrawer } from '../../../new/vue/cart/helpers';

const { post } = cartMethods;

import { initSlider } from './utils';
import { commonConfig } from '../product/config';

const config = {
  ...commonConfig,
  preventClicks: true,
  a11y: false,
  noSwiping: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  cssMode:true,
  breakpoints: {
    1440: {
      spaceBetween: 32,
    },
  },
};

export const initProductCard = (productCard) => {
  const addProductButton = productCard.querySelector('.product-card__add-button');
  const variations = productCard.querySelectorAll('.product-card__dropdown .product-card__dropdown-item');
  const dropdown = productCard.querySelector('.product-card__dropdown');
  const dropdownTrigger = productCard.querySelector('.product-card__dropdown .product-card__dropdown-trigger');
  const dropdownTriggerLabel = productCard.querySelector('.product-card__dropdown button span');

  const addProduct = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { variation_id: variationId } = event.target.dataset;

    await post('add', { id: parseInt(variationId), quantity: 1 });

    openCartDrawer();

    return null;
  };

  const selectValidation = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { variation_id: selectedVariationId } = event.currentTarget.dataset;

    variations.forEach(variation => {
      const { variation_id: variationId } = variation.dataset;

      if (selectedVariationId === variationId) {
        dropdownTriggerLabel.innerHTML = event.currentTarget.innerHTML;

        variation.classList.add('selected');

        addProductButton.setAttribute('data-variation_id', selectedVariationId);
      } else {
        variation.classList.remove('selected');
      }
    });

    dropdown.classList.remove('active');

    return false;
  };


  const outClickHandler = (event) => {
    if (!dropdown.contains(event.target)) {
      event.preventDefault();
      event.stopPropagation();

      dropdown.classList.remove('active');

      return false;
    }
  };

  const openDropdown = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (dropdown.classList.contains('active')) {
      dropdown.classList.remove('active');
    } else {
      dropdown.classList.add('active');
      document.addEventListener('click', outClickHandler, { capture: true, once: true });
    }

    return false;
  };

  addProductButton.addEventListener('click', addProduct);

  if (dropdownTrigger) {
    dropdownTrigger.addEventListener('click', openDropdown);
  }

  variations.forEach(variation => variation.addEventListener('click', selectValidation));
};

const initRecommendations = () => {
  initSlider('[data-recommendations-swiper]', config);

  const productCards = document.querySelectorAll('.recommendations .product-card');

  productCards.forEach(initProductCard);
};

export default initRecommendations;
