import cartMethods from '../../utils/helpers/cart-helper';
import { trackElementsVisibility } from '../../utils/observeElementOutOfViewport';
import { initTooltip } from './tooltip';
import { initProductImagesSlider } from './product-images';
import { getTagDiscount, isOtpOnlySale } from '../../utils/discount';
import { openBackInStackModal } from '../../utils/bis';
import { EVENTS } from '../../../new/vue/cart/constants';
import Swiper from 'swiper';

const { post } = cartMethods;

const currencySymbol = window.BPN?.shop?.currency?.symbol || window.BPN?.cart?.currencySymbol || '$';

let domCache = {};

const isStackAndSaveEnabled = () => domCache.product?.enable_stack_and_save === true;

const hideSubscriptionCheckboxes = () => {
  if (!isStackAndSaveEnabled()) {
    return;
  }

  const applyHiddenState = () => {
    document.querySelectorAll('.subscription-checkbox').forEach((element) => {
      element.classList.add('hidden');
      element.style.display = 'none';
    });
  };

  applyHiddenState();

  if (!document.body) {
    return;
  }

  const observer = new MutationObserver(() => {
    applyHiddenState();
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

const getFormattedPrice = (price, tagDiscount) => {
  if (tagDiscount) {
    return `${currencySymbol}${(price * (1 - tagDiscount / 100) / 100).toFixed(2)}`;
  }

  return `${currencySymbol}${(price / 100).toFixed(2)}`;
};

const updatePrice = (variation) => {
  const rawTagDiscount = getTagDiscount(domCache.product.tags);
  const otpOnly = isOtpOnlySale(domCache.product.tags);
  const tagDiscount = (otpOnly && isSubscriptionEnabled()) ? undefined : rawTagDiscount;
  const { product_price: price, product_name: rawProductName } = variation.dataset;
  const productName = rawProductName || '';
  const buyBoxOTPPriceContainers = document.querySelectorAll('.buy-box__one-time-purchase .buy-box__purchase-type-price');
  const buyBoxSubscriptionPriceContainers = [...document.querySelectorAll('.buy-box__subscription .buy-box__purchase-type-price')];
  const discountContainers = document.querySelectorAll('.buy-box__subscription .buy-box__purchase-type-discount');
  const priceContainers = document.querySelectorAll('.product-hero__price');


  const formattedPrice = getFormattedPrice(price, tagDiscount);
  const isVariety = /variety/i.test(productName);
  const match = productName.match(/(\d+)\s*ct/i);
  const gelsCount = match ? parseInt(match[1], 10) : null;

  const pricePerGel =
    isVariety && gelsCount
      ? (price / 100 / gelsCount).toFixed(2)
      : null;

  if (pricePerGel) {
    priceContainers.forEach(item => {
      if (!tagDiscount) {
        if (isVariety && pricePerGel) {
          item.innerHTML = `
          ${formattedPrice}
          / <small>$${pricePerGel}/GEL</small>
        `;
        } else {
          item.innerHTML = formattedPrice;
        }
      }
    });
  }

  buyBoxOTPPriceContainers.forEach((item) => {
    item.innerHTML = formattedPrice;
  });

  buyBoxSubscriptionPriceContainers.map((buyBoxSubscriptionPriceContainer, index) => {
    const discount = Number(buyBoxSubscriptionPriceContainer.dataset.discount) || 15;
    const discountedPrice = (price - (price / 100 * discount)).toFixed(2);

    if (tagDiscount) {
      buyBoxSubscriptionPriceContainer.innerHTML = formattedPrice;
    } else {
      buyBoxSubscriptionPriceContainer.innerHTML = `${currencySymbol}${(discountedPrice / 100).toFixed(2)}`;
    }

    if (discountContainers[index]) {
      if (tagDiscount) {
        discountContainers[index].innerHTML = `Save ${tagDiscount}%`;
      } else {
        discountContainers[index].innerHTML = `Save ${currencySymbol}${((price - discountedPrice) / 100).toFixed(2)}`;
      }
    }
  });
};

const selectVariationInCurrentProductDataById = (variationId) => {
  return domCache.product.variants.find(item => String(item.id) === String(variationId));
};

const selectVariationById = (variationId) => {
  return domCache.product.variants.find(item => String(item.id) === String(variationId));
};

const selectUnavailableVariations = () => {
  return domCache.product.variants.filter(item => item.available === false || item.availability === 'oos');
};

const shouldBeVisible = (selectedOption, option) => {
  const { position: sPosition, value: sValue, variation_id: sVariationId } = selectedOption.dataset;
  const { position, value, variation_id: variationId } = option.dataset;

  const variation = selectVariationById(variationId);
  const selectedVariation = selectVariationById(sVariationId);

  if (sPosition === position) {
    const expectedOption = selectedVariation.options.filter((option) => option !== sValue);

    return sValue !== value && expectedOption.every((option) => variation.options.includes(option));
  }

  const options = option.closest('.selector-container').dataset.options.split(',');

  const allowedOption = [...options, ...selectedVariation.options];

  return variation.options.every(option => allowedOption.includes(option));
};

const shouldBeSelected = (selectedOption, option) => {
  const { position: sPosition, value: sValue, variation_id: sVariationId } = selectedOption.dataset;
  const { position, variation_id: variationId } = option.dataset;

  if (sPosition === position) {
    return false;
  }

  const variation = domCache.product.variants.find(item => String(item.id) === String(variationId));
  const selectedVariation = domCache.product.variants.find(item => String(item.id) === String(sVariationId));
  const allowedOption = selectedVariation.options.filter((item) => item !== sValue);

  return allowedOption.every(option => variation.options.includes(option));
};

const syncCarousel = (element) => {
  const variation = selectVariationById(element.dataset.variation_id);
  const carousel = document.querySelector('.product-images-carousel');
  const title = variation.title.toLowerCase();
  const productTitle = domCache.product.title.toLowerCase();

  if (carousel) {
    carousel.querySelectorAll('.image-slide').forEach(slide => {
      let show = slide.dataset.alt.includes(title) || slide.dataset.alt.includes(productTitle) || slide.dataset.alt.includes('@common');
      // fixed a specific issue with Go Gel Variants where variant names are similar
      show = slide.dataset.alt.includes('caf') && !title.includes('caf') ? false : show;
      if (show) {
        slide.classList.remove('hidden');
      } else {
        slide.classList.add('hidden');
      }
    });
  }

  domCache.swipers.forEach((swiper) => {
    swiper.slideTo(0);
    swiper.update();
  });
};

const isSubscriptionEnabled = () => {
  if (isStackAndSaveEnabled()) {
    return false;
  }

  return document.querySelectorAll('.buy-box__purchase-type.buy-box__subscription.selected').length !== 0;
};

const syncNutritionFacts = (variant) => {
  const variationId = variant.dataset.variation_id;
  const id = `nutrition-facts-${variationId}`;
  const facts = document.querySelectorAll('.nutrition-facts');

  facts.forEach((fact) => {
    if (fact.classList.contains(id)) {
      fact.classList.remove('hidden');
    } else {
      fact.classList.add('hidden');
      fact.classList.remove('active');
    }
  });
};

const syncOptions = (selectedOption) => {
  const variationId = selectedOption.dataset.variation_id;

  if (isStackAndSaveEnabled()) {
    const quantitySelector = document.querySelector(".product-hero .quantity-selector");
    const buyMoreSection = document.querySelector(".buy-more-save-more__section");
    const isSpecialVariation = variationId === "44867944710316";
    const productName = selectedOption.dataset.product_name || selectedOption.dataset.value || '';
    const isVariety = /variety/i.test(productName);

    quantitySelector?.classList.toggle("hidden", !isSpecialVariation || isVariety);
    buyMoreSection?.classList.remove("hidden");

    if (isSpecialVariation) {
      setQuantitySelectorValue(1);
    }
  }

  domCache.selectors.forEach((option) => {
    if (option === selectedOption || option.dataset.variation_id === variationId) {
      option.classList.add('selected');
      option.classList.remove('hidden');
    } else {
      if (shouldBeVisible(selectedOption, option)) {
        option.classList.remove('hidden');
      } else {
        option.classList.add('hidden');
      }

      if (shouldBeSelected(selectedOption, option)) {
        option.classList.add('selected');
      } else {
        option.classList.remove('selected');
      }
    }
  });
};

const syncOptionsThumbnails = (selectedOption) => {
  const variationId = selectedOption.dataset.variation_id;
  const isThumbnailSource = [...domCache.thumbnailsSelectors].includes(selectedOption);

  domCache.thumbnailsSelectors.forEach((option) => {
    if (option === selectedOption || option.dataset.variation_id === variationId) {
      option.classList.add("selected");
    } else {
      option.classList.remove("selected");
    }
  });

  if (!isThumbnailSource) return;

  domCache.selectors.forEach((option) => {
    if (option.dataset.variation_id === variationId) {
      option.click();
    }
  });

};

const filterThumbnailProducts = () => {
  const filters = domCache.filterThumbnailProducts;
  const flavorItems = domCache.thumbnailsSelectors;
  const refreshFlavorSwiper = () => {
    if (!domCache.flavorThumbnailsSwiper) return;

    domCache.flavorThumbnailsSwiper.updateSlides();
    domCache.flavorThumbnailsSwiper.update();
    domCache.flavorThumbnailsSwiper.slideTo(0);
    domCache.flavorThumbnailsSwiper.updateFlavorNavigation?.();
  };

  function applyFilter(type) {
    flavorItems.forEach(item => {
      const isCaffeinated = item.getAttribute("data-caffeine") === "true";
      const flavorName = item.textContent.trim().toLowerCase();
      item.classList.remove("hidden");

      if (type === "variety-pack") {
        if (item.getAttribute("data-variant-type") !== "variety-pack") {
          item.classList.add("hidden");
        }
        return;
      }

      if (type === "caffeine") {
        if (!isCaffeinated) item.classList.add("hidden");
        return;
      }
      if (type === "no-caffeine") {

        if (isCaffeinated) {
          item.classList.add("hidden");
          return;
        }
        if (flavorName.includes("variety pack")) {
          item.classList.add("hidden");
          return;
        }
        return;
      }
    });

    refreshFlavorSwiper();
  }

  filters.forEach(filter => {
    filter.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const type = e.target.dataset.option;

      filters.forEach(f => f.classList.remove("active"));
      e.target.classList.add("active");

      applyFilter(type);
    });
  });
  const defaultFilter = document.querySelector('.product-flavors-thumbnails-caf span.active');
  if (defaultFilter) {
    applyFilter(defaultFilter.dataset.option);
  }
}

const syncDropdownTriggerLabel = () => {
  document.querySelectorAll('.product-hero__dropdown-trigger .sold-out-label').forEach(label => label.parentNode.removeChild(label));
};

const syncCTALabel = (price) => {
  const rawTagDiscount = getTagDiscount(domCache.product.tags);
  const otpOnly = isOtpOnlySale(domCache.product.tags);
  const subscriptionActive = isSubscriptionEnabled();

  const tagDiscount = (otpOnly && subscriptionActive) ? undefined : rawTagDiscount;

  const formattedPrice = getFormattedPrice(price, tagDiscount);
  const comparePrice = getFormattedPrice(price);

  const priceContainer = document.querySelector('.product-hero__price');

  const isChecked = domCache.pairProductCheckbox?.checked;

  let modalButtonText = tagDiscount
    ? `ADD TO CART - <span class="compare-price">${comparePrice}</span> ${formattedPrice}`
    : `ADD TO CART - ${formattedPrice}`;
  let ctaButtonText = modalButtonText;

  if (priceContainer) {
    if (!tagDiscount) {
      priceContainer.innerHTML = formattedPrice;
    } else {
      priceContainer.innerHTML = `<span class="discounted-price">${formattedPrice}</span> <span class="original-price">${comparePrice}</span>`;
    }
  }

  if (subscriptionActive && !isChecked) {
    const buyBoxSubscriptionPriceContainer = document.querySelector('.buy-box__subscription .buy-box__purchase-type-price');
    const discount = Number(buyBoxSubscriptionPriceContainer.dataset.discount) || 15;
    const discountedPrice = (price - (price / 100 * discount)).toFixed(2);

    if (!tagDiscount) {
      modalButtonText = `ADD TO CART - <span class="compare-price">${comparePrice}</span> ${`${currencySymbol}${(discountedPrice / 100).toFixed(2)}`}`;
      if (priceContainer) {
        priceContainer.innerHTML = `${currencySymbol}${(discountedPrice / 100).toFixed(2)}`;
      }
    } else {
      modalButtonText = `ADD TO CART - <span class="compare-price">${comparePrice}</span> ${formattedPrice}`;
    }
    ctaButtonText = modalButtonText;
  }


  if (isChecked) {
    modalButtonText = `Add Both To Cart - ${formattedPrice}`;
    ctaButtonText = modalButtonText;
  }

  const discountLabel = document.querySelector('.product-hero__discount-label');
  if (discountLabel) {
    if (tagDiscount) {
      discountLabel.classList.remove('hidden');
    } else {
      discountLabel.classList.add('hidden');
    }
  }

  if (!domCache.addProductButton.disabled) {
    domCache.addProductButton.innerHTML = ctaButtonText;
    domCache.modalAddProductButton.forEach((button) => {
      button.innerHTML = modalButtonText;
    });
  }
};

const syncDeliveryFrequencyVisibility = () => {
  const bullet = domCache.baseInformation.querySelector('.bullet');
  const deliveryFrequency = domCache.baseInformation.querySelector('.delivery-frequency');

  if (isSubscriptionEnabled()) {
    deliveryFrequency?.classList.remove('hidden');

    if (bullet) {
      bullet.classList.remove('hidden');
    }
  } else {
    deliveryFrequency?.classList.add('hidden');

    if (bullet) {
      bullet.classList.add('hidden');
    }
  }
};

const initThumbnailSelector = (selectors) => {
  selectors.forEach((selector) => {
    selector.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      syncOptionsThumbnails(event.currentTarget);
    })
  })

}

const initFlavorThumbnailsSwiper = () => {
  const slider = document.querySelector('[data-flavor-thumbnails-swiper]');

  if (!slider) {
    return null;
  }

  if (slider.classList.contains('swiper-initialized')) {
    const existingSwiper = slider.swiper;
    existingSwiper?.updateFlavorNavigation?.();
    return existingSwiper;
  }

  const prevEl = document.querySelector('[data-flavor-thumbnails-prev]');
  const nextEl = document.querySelector('[data-flavor-thumbnails-next]');
  const hasNavigation = Boolean(prevEl && nextEl);

  const swiper = new Swiper(slider, {
    slidesPerView: 'auto',
    spaceBetween: 12,
    watchOverflow: true,
    threshold: 8,
    speed: 450,
    cssMode: true,
    breakpoints: {
      0: {
        spaceBetween: 8,
      },
      768: {
        spaceBetween: 12,
      },
    },
  });

  if (!hasNavigation) {
    return swiper;
  }

  const getVisibleSlides = () => {
    if (!swiper.slides?.length) return 1;
    const referenceSlide = swiper.slides[swiper.activeIndex] || swiper.slides[0];
    const slideWidth = referenceSlide?.offsetWidth || referenceSlide?.clientWidth || 1;
    const totalSlideWidth = slideWidth + swiper.params.spaceBetween;
    if (!totalSlideWidth || !swiper.width) return 1;
    return Math.max(1, Math.round((swiper.width + swiper.params.spaceBetween) / totalSlideWidth));
  };

  const updateNavigationState = () => {
    const visibleSlides = getVisibleSlides();
    const maxIndex = Math.max(swiper.slides.length - visibleSlides, 0);
    const atStart = swiper.activeIndex <= 0 || swiper.slides.length <= visibleSlides;
    const atEnd = swiper.activeIndex >= maxIndex || swiper.slides.length <= visibleSlides;

    prevEl.classList.toggle('is-disabled', atStart);
    nextEl.classList.toggle('is-disabled', atEnd);
  };

  const slideToStart = () => {
    swiper.slideTo(0, 400);
    updateNavigationState();
  };

  const slideToEnd = () => {
    const visibleSlides = getVisibleSlides();
    const targetIndex = Math.max(swiper.slides.length - visibleSlides, 0);
    swiper.slideTo(targetIndex, 400);
    updateNavigationState();
  };

  const bindNavigation = () => {
    if (prevEl.dataset.flavorNavBound === 'true') {
      return;
    }

    prevEl.addEventListener('click', (event) => {
      event.preventDefault();
      slideToStart();
    });

    nextEl.addEventListener('click', (event) => {
      event.preventDefault();
      slideToEnd();
    });

    prevEl.dataset.flavorNavBound = 'true';
    nextEl.dataset.flavorNavBound = 'true';
  };

  bindNavigation();

  swiper.on('init', updateNavigationState);
  swiper.on('slideChange', updateNavigationState);
  swiper.on('resize', updateNavigationState);
  swiper.on('update', updateNavigationState);

  updateNavigationState();

  swiper.updateFlavorNavigation = updateNavigationState;

  return swiper;
};


const initFilterThumbnailVariants = () => {
  filterThumbnailProducts();
}


const syncModalFlavorOption = (value, selectedQty = null) => {
  const label = document.querySelector('.flavor-option');
  domCache.currentFlavorOption = value;

  if (label) {
    let labelValue = value;

    if (isStackAndSaveEnabled()) {
      const qty = Number(selectedQty ?? getSelectedBuyMoreQty());

      if (!Number.isNaN(qty) && qty > 0) {
        labelValue = `${value} • ${qty} ${qty === 1 ? 'box' : 'boxes'}`;
      }
    }

    label.textContent = labelValue;
  }

  if (isStackAndSaveEnabled() && value === 'Variety Pack / 15 ct') {
    const deliveryFrequencyElement = document.querySelector('.delivery-frequency');
    if (deliveryFrequencyElement) {
      deliveryFrequencyElement.innerHTML = '15 Gels';
    }
  }
};

const toggleSubscriptionVisibility = (showSubscription = false) => {
  const elements = document.querySelectorAll('.subscription-selector');

  elements.forEach((element) => {
    if (showSubscription) {
      element.classList.remove('opacity-hidden');
    } else {
      element.classList.add('opacity-hidden');
    }
  });
};

const togglePurchaseOptionsVisibility = (show = false) => {
  const optionsToggle = document.querySelector('.pdp-sticky-footer__options-toggle');
  const deliveryFrequency = document.querySelector('.delivery-frequency');
  const bullet = document.querySelector('.pdp-sticky-footer__variant-info .bullet');

  [optionsToggle, deliveryFrequency, bullet].forEach((el) => {
    if (!el) return;
    if (show) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
};

const getExternalUrl = (variant) => {
  if (typeof variant['external_link'] !== 'undefined' && 'url' in variant.external_link) {
    return [variant.external_link.text, variant.external_link.url];
  }

  return '';
};

const toggleQuantitySelectorVisibility = (show) => {
  if (domCache.quantitySelector) {
    if (show) {
      domCache.quantitySelector.classList.remove('hidden');
    } else {
      domCache.quantitySelector.classList.add('hidden');
    }
  }
};

const setQuantitySelectorValue = (quantity) => {
  const selector = domCache.quantitySelector || document.querySelector('.product-hero .quantity-selector');

  if (!selector) {
    return;
  }

  if (!domCache.quantitySelector) {
    domCache.quantitySelector = selector;
  }

  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  const valueElement = selector.querySelector('.quantity-selector__value');
  const prevControl = selector.querySelector('[data-direction="prev"]');

  if (valueElement) {
    valueElement.innerText = normalizedQuantity;
  }

  if (prevControl) {
    if (normalizedQuantity === 1) {
      prevControl.classList.add('disabled');
      prevControl.setAttribute('disabled', 'true');
    } else {
      prevControl.classList.remove('disabled');
      prevControl.removeAttribute('disabled');
    }
  }

  if (domCache.addProductButton) {
    domCache.addProductButton.setAttribute('data-quantity', String(normalizedQuantity));
  }

  if (domCache.modalAddProductButton && typeof domCache.modalAddProductButton.forEach === 'function') {
    domCache.modalAddProductButton.forEach((button) => {
      button.setAttribute('data-quantity', String(normalizedQuantity));
    });
  }
};

const getSelectedBuyMoreQty = () => {
  const selectedItem = document.querySelector('.buy-more-save-more__section-item.selected');

  if (!selectedItem) {
    return null;
  }

  const qty = Number(selectedItem.dataset.qty);

  return Number.isNaN(qty) ? null : qty;
};

const applyBuyMoreSelection = (qty = null) => {
  if (!isStackAndSaveEnabled()) {
    return;
  }

  const items = [...document.querySelectorAll('.buy-more-save-more__section-item')];

  if (!items.length) {
    return;
  }

  const targetItem = qty
    ? items.find((item) => Number(item.dataset.qty) === Number(qty))
    : null;

  (targetItem || items[1] || items[0]).click();
};

const forceOTPMode = () => {
  const selectors = document.querySelectorAll('.buy-box__purchase-type');
  selectors.forEach((item) => {
    if (item.classList.contains('buy-box__one-time-purchase')) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
  syncDeliveryFrequencyVisibility();
};

function syncCTA(item) {
  const { variation_id: variationId, available, product_price: price } = item.dataset;
  const variant = selectVariationInCurrentProductDataById(variationId);
  const { availability = 'default' } = variant;

  domCache.addProductButton.setAttribute('data-variation_id', variationId);
  domCache.modalAddProductButton.forEach((button) => {
    button.setAttribute('data-variation_id', variationId);
  });
  syncCTALabel(price);
  syncDropdownTriggerLabel();

  if (availability === 'external') {
    const [text, url] = getExternalUrl(variant);

    domCache.externalLink.setAttribute('href', url);
    domCache.externalLink.innerHTML = text;

    domCache.modalExternalLink.setAttribute('href', url);
    domCache.modalExternalLink.innerHTML = text;

    // external
    domCache.externalLink.classList.remove('hidden');
    domCache.modalExternalLink.classList.remove('hidden');

    // add
    domCache.addProductButton.classList.add('hidden');
    domCache.modalAddProductButton.forEach((button) => {
      button.classList.add('hidden');
    })

    // oos
    domCache.bisTriggers.forEach(el => el.classList.add('hidden'));
    domCache.modalBisTriggers.forEach(el => el.classList.add('hidden'));

    toggleSubscriptionVisibility(false);
    togglePurchaseOptionsVisibility(false);
    toggleQuantitySelectorVisibility(false);
    return;
  }

  if (availability === 'oos' || available === false) {
    // external
    domCache.externalLink.classList.add('hidden');
    domCache.modalExternalLink.classList.add('hidden');

    // add
    domCache.addProductButton.classList.add('hidden');
    domCache.modalAddProductButton.forEach((button) => {
      button.classList.add('hidden');
    })

    // oos
    domCache.bisTriggers.forEach(el => el.classList.remove('hidden'));
    domCache.modalBisTriggers.forEach(el => el.classList.remove('hidden'));

    toggleSubscriptionVisibility(false);
    togglePurchaseOptionsVisibility(false);
    toggleQuantitySelectorVisibility(false);

    return;
  }

  // add
  domCache.addProductButton.classList.remove('hidden');
  domCache.modalAddProductButton.forEach((button) => {
    button.classList.remove('hidden');
  })

  // oos
  domCache.bisTriggers.forEach(el => el.classList.add('hidden'));
  domCache.modalBisTriggers.forEach(el => el.classList.add('hidden'));

  // external
  domCache.externalLink.classList.add('hidden');
  domCache.modalExternalLink.classList.add('hidden');

  // Hide subscription selector and purchase options if this variant has no selling plans, and force OTP
  if (variant.has_selling_plan === false) {
    toggleSubscriptionVisibility(false);
    togglePurchaseOptionsVisibility(false);
    forceOTPMode();
    syncCTALabel(price); // recalculate after forcing OTP so button text reflects OTP pricing
  } else {
    toggleSubscriptionVisibility(true);
    togglePurchaseOptionsVisibility(true);
  }
  toggleQuantitySelectorVisibility(true);
}

const initSelector = (selector) => {
  const variations = selector.querySelectorAll('.variation-option');

  if (variations.length === 1) {
    return;
  }

  variations.forEach(variation => {
    variation.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      domCache.addToCardBuyBox?.classList.add('hidden');
      syncCTA(variation);
      updatePrice(variation);
      syncOptions(variation);
      syncOptionsThumbnails(variation);
      syncNutritionFacts(variation);
      syncCarousel(variation);

      if (variation.dataset.value) {
        syncModalFlavorOption(variation.dataset.value);
      }
      updateBuyMoreSaveMore(Number(variation.dataset.product_price), variation.dataset.variation_id);
      applyBuyMoreSelection(getSelectedBuyMoreQty());

      return false;
    });
  });
};

const updateVariationDropdownLabels = (value) => {
  document.querySelectorAll('.product-hero__dropdown button span').forEach(label => {
    label.innerHTML = value;
  });
};

const syncThumbnailsFromDropdown = (selectedVariationId) => {
  domCache.thumbnailsSelectors.forEach((thumbnail) => {
    if (thumbnail.dataset.variation_id === selectedVariationId) {
      thumbnail.classList.add('selected');
    } else {
      thumbnail.classList.remove('selected');
    }
  });
};

const initVariationDropdown = (dropdown) => {
  const dropdownTrigger = dropdown.querySelector('.product-hero__dropdown-trigger');
  const variations = dropdown.querySelectorAll('.product-hero__dropdown-item');

  // Sync the dropdown trigger icon with the correct variant on page load.
  // Liquid may not reflect ?variant= correctly in the trigger, so we resolve it here.
  if (variations.length && dropdownTrigger) {
    const urlVariantId = new URLSearchParams(window.location.search).get('variant');
    const serverSelected = [...variations].find(v => v.classList.contains('selected'));

    let initialItem = serverSelected ?? variations[0];
    if (urlVariantId) {
      const urlVariant = [...variations].find(v => v.dataset.variation_id === urlVariantId);
      if (urlVariant) initialItem = urlVariant;
    }

    const triggerSpan = dropdownTrigger.querySelector('span');
    if (triggerSpan && initialItem) {
      triggerSpan.innerHTML = initialItem.innerHTML;
    }
  }

  if (isStackAndSaveEnabled() && variations.length) {
    setTimeout(() => {
      const urlVariantId = new URLSearchParams(window.location.search).get('variant');
      const serverSelected = [...variations].find(v => v.classList.contains('selected'));
      const fallback = serverSelected ?? variations[0];

      if (urlVariantId) {
        const urlVariant = [...variations].find(v => v.dataset.variation_id === urlVariantId);
        (urlVariant ?? fallback)?.click();
      } else {
        fallback?.click();
      }
    }, 300);
  }

  const outClickHandler = (event) => {
    if (!dropdown.contains(event.target)) {
      event.preventDefault();
      event.stopPropagation();

      dropdown.classList.remove('active');

      return false;
    }
  };

  const selectValidation = (variation) => {
    dropdown.classList.remove('active');
    domCache.addToCardBuyBox?.classList.add('hidden');
    const selectedBuyMoreQty = getSelectedBuyMoreQty();

    const flavor = variation.dataset.value;
    const variationId = variation.dataset.variation_id;

    updateVariationDropdownLabels(variation.innerHTML);
    syncCTA(variation);
    updatePrice(variation);
    syncOptions(variation);
    syncCarousel(variation);
    syncNutritionFacts(variation);
    syncThumbnailsFromDropdown(variationId); // Nueva línea
    if (variation.dataset.value) {
      syncModalFlavorOption(flavor);
    }
    updateBuyMoreSaveMore(Number(variation.dataset.product_price), variation.dataset.variation_id);
    applyBuyMoreSelection(selectedBuyMoreQty);
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

  variations.forEach(variation => variation.addEventListener('click', () => selectValidation(variation)));

  if (dropdownTrigger) {
    dropdownTrigger.addEventListener('click', openDropdown);
  }
};

const updateDropdownTriggerLabel = (value) => {
  const dropdownTriggerLabels = document.querySelectorAll('.delivery-type-dropdown button span');
  const deliveryFrequencyLabel = document.querySelector('#delivery-frequency');

  deliveryFrequencyLabel.innerHTML = value;

  dropdownTriggerLabels.forEach((dropdownTriggerLabel) => {
    dropdownTriggerLabel.innerHTML = value;
  });
};

const initSubscriptionSelector = () => {
  const selectors = document.querySelectorAll('.buy-box__purchase-type');

  selectors.forEach(selector => selector.addEventListener('click', () => {
    const isSubscriptionItem = selector.classList.contains('buy-box__subscription');

    selectors.forEach((item) => {
      if (isSubscriptionItem) {
        if (item.classList.contains('buy-box__subscription')) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      } else {
        if (!item.classList.contains('buy-box__subscription')) {
          item.classList.add('selected');
        } else {
          item.classList.remove('selected');
        }
      }

      const { variation_id: variationId } = domCache.addProductButton.dataset;
      const variation = domCache.product.variants.find(item => String(item.id) === String(variationId));

      syncCTALabel(variation.price);
      syncDeliveryFrequencyVisibility();
    });
  }));

};

const initDeliveryTypeDropdown = (dropdown) => {
  const trigger = dropdown.querySelector('.delivery-type-dropdown__trigger');

  const values = document.querySelectorAll('.delivery-type-dropdown__dropdown-item');

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

  const selectValue = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const { selling_plan: selectedSellingPlan } = event.currentTarget.dataset;

    domCache.addProductButton.setAttribute('data-selling_plan', selectedSellingPlan);
    domCache.modalAddProductButton.forEach((button) => {
      button.setAttribute('data-selling_plan', selectedSellingPlan);
    })

    values.forEach(element => {
      const { selling_plan: sellingPlan } = element.dataset;

      if (selectedSellingPlan === sellingPlan) {
        updateDropdownTriggerLabel(event.currentTarget.innerHTML);

        element.classList.add('selected');
      } else {
        element.classList.remove('selected');
      }
    });

    dropdown.classList.remove('active');

    return false;
  };

  if (trigger) {
    trigger.addEventListener('click', openDropdown);
  }

  values.forEach(variation => variation.addEventListener('click', selectValue));
};

const initInformationAccordion = () => {
  document.querySelectorAll('.information-accordion').forEach((accordion) => {
    const accordionItems = accordion.querySelectorAll('.information-accordion__item');

    accordionItems.forEach(accordionItem => {
      accordionItem.addEventListener('click', () => {
        accordionItems.forEach(item => {
          if (item === accordionItem) {
            item.classList.toggle('active');
          } else {
            item.classList.remove('active');
          }
        });
      });
    });
  });
};

const initQuantitySelector = () => {
  if (!domCache.quantitySelector) {
    return;
  }

  const valueElement = domCache.quantitySelector.querySelector('.quantity-selector__value');

  if (!valueElement) {
    return;
  }

  domCache.quantitySelector.addEventListener('click', (event) => {
    const control = typeof event.target.closest === 'function' ? event.target.closest('[data-direction]') : null;

    if (!control) {
      return;
    }

    const { direction } = control.dataset;
    const actualValue = Number(valueElement.innerText);
    const prevControl = domCache.quantitySelector.querySelector('[data-direction="prev"]');

    if (direction === 'prev') {
      if (prevControl?.classList.contains('disabled')) {
        return;
      }

      setQuantitySelectorValue(actualValue - 1);
    } else if (direction === 'next') {
      setQuantitySelectorValue(actualValue + 1);
    }
  });
};

const updateBuyMoreSaveMore = (price, variantId) => {
  if (!isStackAndSaveEnabled()) return;

  const variant = domCache.product?.variants?.find(v => String(v.id) === String(variantId));
  const countPerBox = Number(variant?.serving_size_or_count) || 1;

  const section = document.querySelector('.buy-more-save-more__section');
  if (section) {
    section.dataset.countPerBox = countPerBox;
  }

  document.querySelectorAll('.buy-more-save-more__section-item').forEach(item => {
    const multiplier = Number(item.dataset.multiplier) || 1;
    const discountPct = Number(item.dataset.discount) || 0;
    const unitLabel = item.dataset.unitLabel || 'UNIT';

    const totalRaw = price * multiplier;
    const discountAmount = Math.round(totalRaw * discountPct / 100);
    const totalPrice = totalRaw - discountAmount;
    const totalUnits = countPerBox * multiplier;
    const pricePerUnit = totalPrice / totalUnits;

    const formattedTotal = `${currencySymbol}${(totalPrice / 100).toFixed(2)}`;
    const formattedPerUnit = `${currencySymbol}${(Math.floor(pricePerUnit) / 100).toFixed(2)}`;

    item.dataset.price = formattedTotal;

    const priceEl = item.querySelector('p');
    const perUnitEl = item.querySelector('small');

    if (priceEl) priceEl.textContent = formattedTotal;
    if (perUnitEl) perUnitEl.textContent = `${formattedPerUnit}/${unitLabel}`;
  });
};

const initBuyMoreSaveMore = () => {
  const items = document.querySelectorAll('.buy-more-save-more__section-item');

  items.forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.buy-more-save-more__section-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
      const deliveryFrequencyElement = document.querySelector(".delivery-frequency");
      const addToCartStickyButtons = document.querySelectorAll("#add-to-cart-sticky-footer .add-to-cart__add-button");
      const qty = item.getAttribute('data-qty');
      const price = item.getAttribute('data-price');
      const productPrice = document.querySelector(".product-hero__price");
      const cta = document.querySelector(".buy-box__add-button");

      productPrice.innerHTML = price;
      cta.innerHTML = `ADD TO CART - ${price}`;
      addToCartStickyButtons.forEach((button) => {
        button.innerHTML = `ADD TO CART - ${price}`;
      });

      const newText = qty == 1 ? '1 Box' : `${qty} Boxes`;

      if (deliveryFrequencyElement) {
        deliveryFrequencyElement.innerHTML = newText;
      }

      setQuantitySelectorValue(Number(qty));

      if (domCache.currentFlavorOption) {
        syncModalFlavorOption(domCache.currentFlavorOption, Number(qty));
      }
    });
  });


  if (items.length) {
    setTimeout(() => {
      applyBuyMoreSelection(getSelectedBuyMoreQty());
    }, 350);
  }

};


const showStickyFooter = () => {
  domCache.stickyFooter.classList.remove('hidden');
};

const hideStickyFooter = () => {
  domCache.stickyFooter.classList.add('hidden');
};

const initAddCartChangeOptions = () => {
  const elements = [
    domCache.addProductButton,
    domCache.externalLink,
    ...domCache.bisTriggers,
  ].filter(Boolean);
  domCache.addCartChangeOptions.forEach((button) => {
    button.addEventListener('click', () => {
      domCache.addToCardBuyBox.classList.toggle('hidden');
      domCache.iconChevronDown?.classList.toggle('rotated')
    });
  })

  if (!domCache.addToCardBuyBox) return;

  domCache.addToCardBuyBox.addEventListener('click', (event) => {
    if (event.target === domCache.addToCardBuyBox) {
      domCache.addToCardBuyBox.classList.toggle('hidden');
      domCache.iconChevronDown?.classList.toggle('rotated')
    }
  });

  trackElementsVisibility(elements, hideStickyFooter, showStickyFooter);

  domCache.closeAddToCartModal.addEventListener('click', () => {
    domCache.addToCardBuyBox.classList.toggle('hidden');
  });
};

const addProduct = async (event) => {
  event.preventDefault();
  event.stopPropagation();

  const { variation_id, selling_plan = undefined, product_handle = undefined } = event.currentTarget.dataset;
  let { quantity = 1 } = event.currentTarget.dataset;

  if (isStackAndSaveEnabled()) {
    quantity = parseInt(domCache.QuantitySelectorProductDetail?.innerHTML || 1);
  }

  const payload = { id: parseInt(variation_id), quantity };

  if (isSubscriptionEnabled() && selling_plan) {
    payload.selling_plan = selling_plan;
  }

  await post('add', payload);

  domCache.addToCardBuyBox.classList.add('hidden');

  if (domCache.pairProductCheckbox?.checked) {
    const pairVariantId = domCache.pairProductCheckbox.dataset.variant_id;
    const pairPayload = { id: parseInt(pairVariantId), quantity: '1' };
    setTimeout(async () => {
      try {
        await post('add', pairPayload);
        document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, {
          detail: { id: pairPayload.id },
        }));
      } catch (error) {
        console.error('Failed to add pair product:', error);
      }
    }, 1000)
  }

  document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, {
    detail: { id: payload.id },
  }));

  return null;
};

const openBISModal = (event) => {
  event.stopPropagation();

  const { product_id, variation_id } = domCache.addProductButton.dataset;

  const variation = selectVariationById(variation_id);

  let unavailableVariations = selectUnavailableVariations();

  if (unavailableVariations.length === 0) {
    unavailableVariations = [variation];
  }

  const product = {
    productId: product_id,
    handle: domCache.product.handle,
    title: domCache.product.shopify_title,
    variantId: variation.id,
    variantTitle: variation.title,
    variants: unavailableVariations,
  };

  openBackInStackModal(product);

  return false;
};

const initBISButtons = () => {
  domCache.bisTriggers.forEach((trigger) => {
    trigger.addEventListener('click', openBISModal, { capture: true });
  });

  domCache.modalBisTriggers.forEach((trigger) => {
    trigger.addEventListener('click', openBISModal, { capture: true });
  });
};

const initPairProductCheckbox = () => {
  if (!domCache.pairProductCheckbox) return;

  domCache.pairProductCheckbox.addEventListener('change', () => {
    const { variation_id: variationId } = domCache.addProductButton.dataset;
    const variant = selectVariationById(variationId);

    if (variant) {
      syncCTALabel(variant.price);
    }
  });
};

const makeAllSvgPatternsUnique = () => {
  let counter = 0;
  document.querySelectorAll('.product-hero__dropdown svg').forEach((svg, index) => {
    const pattern = svg.querySelector('pattern');
    if (pattern) {
      const oldId = pattern.getAttribute('id');
      const uniqueId = `${oldId}-${counter++}`;

      // Update the pattern ID
      pattern.setAttribute('id', uniqueId);

      // Update all references to this pattern (fill, stroke, etc.)
      svg.querySelectorAll(`[fill="url(#${oldId})"]`).forEach(el => {
        el.setAttribute('fill', `url(#${uniqueId})`);
      });
      svg.querySelectorAll(`[stroke="url(#${oldId})"]`).forEach(el => {
        el.setAttribute('stroke', `url(#${uniqueId})`);
      });
    }
  });
};

const initDom = () => {
  domCache.product = window.BPN.currentProductData;

  if (isStackAndSaveEnabled()) {
    window.BPN.stackAndSaveProductHandles = window.BPN.stackAndSaveProductHandles || [];
    if (!window.BPN.stackAndSaveProductHandles.includes(domCache.product.handle)) {
      window.BPN.stackAndSaveProductHandles.push(domCache.product.handle);
    }
  }

  domCache.stickyFooter = document.querySelector('#add-to-cart-sticky-footer');
  domCache.addToCardBuyBox = document.querySelector('#add-to-cart-buy-box');
  domCache.addCartChangeOptions = document.querySelectorAll('.pdp-sticky-footer__change-options');
  domCache.bisTriggers = document.querySelectorAll('.buy-box-container #BIS_trigger');
  domCache.externalLink = document.querySelector('.buy-box-container .external_link');
  domCache.modalBisTriggers = document.querySelectorAll('.add-to-cart #BIS_trigger');
  domCache.modalExternalLink = document.querySelector('.add-to-cart .external_link');
  domCache.addProductButton = document.querySelector('.buy-box__add-button');
  domCache.modalAddProductButton = document.querySelectorAll('.add-to-cart__add-button');
  domCache.selectors = document.querySelectorAll('.variation-option');
  domCache.deliverDropdowns = document.querySelectorAll('.delivery-type-dropdown');
  domCache.quantitySelector = document.querySelector('.product-hero .quantity-selector');
  domCache.baseInformation = document.querySelector('.pdp-sticky-footer__variant-info');
  domCache.closeAddToCartModal = document.querySelector('.close-add-to-cart svg');
  domCache.QuantitySelectorProductDetail = domCache.quantitySelector?.querySelector('.quantity-selector__value');
  domCache.swipers = initProductImagesSlider();
  domCache.pairProductCheckbox = document.querySelector('#pair-product-checkbox');
  domCache.iconChevronDown = document.querySelector('.pdp-sticky-footer__options-toggle .icon-chevron-down');
  domCache.thumbnailsSelectors = document.querySelectorAll(".product-flavors-thumbnails-item");
  domCache.filterThumbnailProducts = document.querySelectorAll(".product-flavors-thumbnails-caf span");

  const currentFlavorLabel = document.querySelector('.flavor-option')?.textContent || '';
  domCache.currentFlavorOption = currentFlavorLabel.split(/[|•]/)[0].trim();
};

export const initBuyBox = () => {
  initDom();
  makeAllSvgPatternsUnique();
  const dropdowns = document.querySelectorAll('.product-hero__dropdown');
  const selectors = document.querySelectorAll('.product .selector-container .selector');

  dropdowns.forEach(dropdown => initVariationDropdown(dropdown));
  selectors.forEach(selector => initSelector(selector));

  domCache.addProductButton.addEventListener('click', addProduct);
  domCache.modalAddProductButton.forEach((button) => {
    button.addEventListener('click', addProduct);
  })

  domCache.deliverDropdowns.forEach(dropdown => initDeliveryTypeDropdown(dropdown));

  initSubscriptionSelector();
  initInformationAccordion();
  initQuantitySelector();
  initAddCartChangeOptions();
  initTooltip();
  initBISButtons();
  initThumbnailSelector(domCache.thumbnailsSelectors);
  domCache.flavorThumbnailsSwiper = initFlavorThumbnailsSwiper();
  initFilterThumbnailVariants();
  initBuyMoreSaveMore();
  initPairProductCheckbox();
  hideSubscriptionCheckboxes();
};
