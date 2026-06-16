export const setVariant = function () {
  const elem = this;
  if (!elem) {return;}
  const parentWrapper = elem.closest('.productGridItem');
  const dropdownWrapper = elem.closest('.productVariantDropdown');
  const dropdownTrigger = dropdownWrapper
    ? dropdownWrapper.querySelector('[data-upsell-variant-dropdown-trigger]')
    : null;
  const cta = parentWrapper.querySelector('.js-upsell-add-to-cart-btn');
  const prevSelectedVariant = dropdownWrapper
    ? dropdownWrapper.querySelector(
      '.js-product-variant-dropdown-item-selected',
    )
    : null;
  const variantId = elem.dataset.variantId;
  const variantTitle = elem.dataset.variantTitle;
  const variantPrice = elem.dataset.variantPrice;
  const form = elem.closest('.js-upsell-product-form');

  //Remove selected class
  if (prevSelectedVariant) {
    prevSelectedVariant.classList.remove(
      'productVariantDropdown__item--selected',
      'js-product-variant-dropdown-item-selected',
    );
  }
  //Add selected class to the current item
  elem.classList.add(
    'productVariantDropdown__item--selected',
    'js-product-variant-dropdown-item-selected',
  );
  //Change the Image and update the attributes of the CTA
  if (parentWrapper) {
    const imageWrappers = parentWrapper.querySelectorAll(
      '.js-variant-image-wrapper',
    );
    imageWrappers.forEach((element) => {
      const wrapperVariantId = element.dataset.variantId;
      element.classList.add('hide');
      if (variantId === wrapperVariantId) {
        element.classList.remove('hide');
      }
    });
    if (cta) {
      cta.setAttribute('data-selected-variant-title', variantTitle);
      cta.setAttribute('data-selected-variant-price', variantPrice);
    }
  }
  //Change the A
  if (!form) {return;}
  const varianSelector = form.querySelector('[name="id"]');
  if (dropdownWrapper && varianSelector && dropdownTrigger) {
    varianSelector.value = variantId;
    dropdownTrigger.querySelector('.text').innerText = variantTitle;
    dropdownWrapper.classList.remove('open');
  }
};
