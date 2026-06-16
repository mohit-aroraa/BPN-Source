import {
  PRODUCT_PAGE_PRICE_ELEM,
  PRODUCT_PAGE_ADD_TO_CART,
} from '../../utils/constants';

export default function productVariantDropdown() {
  const variantSelectBox = document.querySelector(
    '.js-product-variant-selector',
  );
  const dropdownTrigger = document.querySelector(
    '.js-variant-dropdown-trigger',
  );
  const variantDropdownItems = document.querySelectorAll(
    '.js-variant-dropdown-item',
  );
  const nutritionShortTexts = document.querySelectorAll(
    '[data-nutrition-short-text]',
  );
  const rcBlock = document.querySelector('#rc_container');

  //Toggle the 'open' class on the dropdown container
  dropdownTrigger &&
  dropdownTrigger.addEventListener('click', function () {
    const { parentElement } = this;
    parentElement && parentElement.classList.toggle('open');
  });

  function setVariant() {
    const elem = this;
    const variantId = elem?.dataset.productVariant;
    const variantTitle = elem?.dataset.variantTitle;
    const variantPrice = elem?.dataset.productVariantPrice;

    //Close dropdown
    if (dropdownTrigger) {
      dropdownTrigger.setAttribute('data-selected-variant', variantId);
      dropdownTrigger.querySelector('.text').innerText = variantTitle;
      dropdownTrigger.parentElement.classList.remove('open');
    }

    if (!variantSelectBox && !variantId && !variantTitle) {
      return;
    }
    //Set value of the variant selectBox

    variantSelectBox.value = variantId;
    variantSelectBox.setAttribute('data-selected-variant-price', variantPrice);
    //Trigger change event on select
    let changeEvent = new Event('change');
    variantSelectBox.dispatchEvent(changeEvent, { bubbles: true });

    //Find the previous selected item and remove selected class
    const prevSelectedItem = document.querySelector(
      '[data-product-variant-selected]',
    );
    if (prevSelectedItem) {
      prevSelectedItem.classList.remove('variantDropdown__item--selected');
      prevSelectedItem.removeAttribute('data-product-variant-selected');
    }

    //Reset the price for recharge widget
    if (rcBlock) {
      //Subscription product
      const sellingPlanSelector = rcBlock.querySelector(
        '[data-recharge-shipping-interval-frequency]',
      );
      const sellingPlan = rcBlock.querySelector('.js-subscription-input');
      const discountPriceElem = rcBlock.querySelector('#rc_price_autodeliver');
      const discountAmountElem = rcBlock.querySelector(
        '.purchaseTypeSmallText--discount',
      );
      const onSale = document.querySelector('[name="on_sale_price"]');
      const purchaseType =
        rcBlock.querySelector('[name="purchase_type"]:checked') &&
        rcBlock.querySelector('[name="purchase_type"]:checked').value;
      const discountPercentage =
        sellingPlan && parseFloat(sellingPlan.dataset.discountPercentage);
      const discountAmount =
        (parseFloat(variantPrice) * discountPercentage) / 100;
      const discountedPrice = parseFloat(variantPrice) - discountAmount;
      sellingPlanSelector.setAttribute(
        'data-original-price',
        `$${variantPrice}`,
      );

      sellingPlanSelector.setAttribute(
        'data-discounted-price',
        `$${parseFloat(discountAmount).toFixed(2)}`,
      );
      sellingPlanSelector.setAttribute(
        'data-discount-amount',
        `$${parseFloat(discountedPrice).toFixed(2)}`,
      );
      discountPriceElem &&
      (discountPriceElem.innerText = `$${parseFloat(discountedPrice).toFixed(
        2,
      )}`);
      discountAmountElem &&
      (discountAmountElem.innerText = `$${parseFloat(discountAmount).toFixed(
        2,
      )}`);
      if (purchaseType === 'onetime') {
        PRODUCT_PAGE_PRICE_ELEM.forEach((item) => {
          item.innerText = `$${variantPrice}`;
        });
      } else {
        const html = `<s class="price-item-original">$${variantPrice}</s>`;

        PRODUCT_PAGE_PRICE_ELEM.forEach((item) => {
          item.classList.add('price-item--red');
          item.innerText = `$${parseFloat(discountedPrice).toFixed(2)}`;
          item.insertAdjacentHTML('beforeend', html);
        });
      }
      const price =
        purchaseType === 'autodeliver'
          ? discountedPrice
          : purchaseType === 'onetime' && onSale
            ? onSale.value
            : variantPrice;

      const buttonText =
        purchaseType === 'autodeliver'
          ? `Subscribe <span class="price_on_cta">- $${parseFloat(
            price,
          ).toFixed(2)} / Month</span>`
          : `Add to cart <span class="price_on_cta">- $${parseFloat(
            price,
          ).toFixed(2)}</span>`;
      if (PRODUCT_PAGE_ADD_TO_CART) {
        PRODUCT_PAGE_ADD_TO_CART.innerHTML = buttonText;
      }
    } else {
      //Only one time product
      PRODUCT_PAGE_PRICE_ELEM.forEach((item) => {
        item.innerText = `$${variantPrice}`;
      });
      if (PRODUCT_PAGE_ADD_TO_CART) {
        PRODUCT_PAGE_ADD_TO_CART.innerHTML = `Add to cart <span class="price_on_cta">- $${variantPrice}</span>`;
      }
    }

    //Add selected class and additional attribute on the current variant
    elem.classList.add('variantDropdown__item--selected');
    elem.setAttribute('data-product-variant-selected', true);

    //Show the variant specific nutrition accordion short text only if short text length is greater than 1 and same length of dropdown item length
    if (
      nutritionShortTexts.length > 1 &&
      nutritionShortTexts.length === variantDropdownItems.length
    ) {
      nutritionShortTexts.forEach((item) => {
        const productVariantId = item?.dataset?.nutritionShortText;
        item.classList.add('hide');
        //if variant id match then remove 'hide' class
        if (productVariantId === variantId) {
          item.classList.remove('hide');
        }
      });
    }

    // Switch slide when variant option change
    const variantSlides = document.querySelectorAll('[data-product-gallery]');
    const variantThumbSlides = document.querySelectorAll(
      '[data-product-gallery-thumbnail]',
    );

    function toggleSlide(slides) {
      slides.forEach((variantSlide) => {
        const variantName = variantSlide.dataset?.variantGallery;
        if (variantTitle && variantName) {
          variantSlide.classList.add('hide');
          if (variantTitle.toLowerCase() === variantName.toLowerCase()) {
            variantSlide.classList.remove('hide');
          }
        }
      });
    }

    toggleSlide(variantSlides);
    toggleSlide(variantThumbSlides);
  }

  //Adding even listener on each dropdown item
  variantDropdownItems.forEach((item) => {
    item.addEventListener('click', setVariant);
  });
}
