/**
 * Product display functions for collection filters
 */

import { safeGet, safeFirst, exists } from '../../utils/data-safety.js';

/**
 * Format money amount
 * @param {string} amount - The amount as a string
 * @param {string} currencyCode - Currency code (USD, etc.)
 * @return {string} Formatted money string
 */
export function formatMoney(amount, currencyCode) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode || 'USD',
  }).format(parseFloat(amount));
}

/**
 * Create a product card element for products not already on the page
 * @param {Object} product - Product data from GraphQL
 * @return {HTMLElement} The product card element
 */
export function createProductCard(product) {
  const productCard = document.createElement('div');
  productCard.className = 'bpn-product-grid-item';

  // Get variant and image using safe access helpers
  const variant = safeFirst(safeGet(product, 'variants.nodes'));
  const image = safeFirst(safeGet(product, 'images.nodes'));
  const handle = safeGet(product, 'handle', '');
  const title = safeGet(product, 'title', 'Product');

  // Only continue if we have a valid variant with price data
  if (!variant || !safeGet(variant, 'price.amount')) {
    console.warn('Invalid product data for product card creation:', product);
    return productCard;
  }

  // Format prices safely
  const price = formatMoney(
    safeGet(variant, 'price.amount'),
    safeGet(variant, 'price.currencyCode', 'USD'),
  );

  // Safely check for compareAtPrice
  const compareAtPriceAmount = safeGet(variant, 'compareAtPrice.amount');
  const compareAtPrice = exists(compareAtPriceAmount)
    ? formatMoney(
      compareAtPriceAmount,
      safeGet(variant, 'compareAtPrice.currencyCode', 'USD'),
    )
    : null;

  // Use the same HTML structure as the existing product cards
  productCard.innerHTML = `
    <a href="/products/${handle}" class="bpn-product-grid-item__link">
      <div class="bpn-product-grid-item__image-wrapper">
        <img
          src="${safeGet(image, 'url', '')}"
          alt="${safeGet(image, 'altText', title)}"
          class="bpn-product-grid-item__image"
          width="400"
          height="400"
          loading="lazy"
        />
      </div>
      <div class="bpn-product-grid-item__info">
        <h3 class="bpn-product-grid-item__title">${title}</h3>
        <div class="bpn-product-grid-item__price">
          ${compareAtPrice
    ? `<span class="bpn-product-grid-item__price--sale">${price}</span>
               <span class="bpn-product-grid-item__price--compare">${compareAtPrice}</span>`
    : `<span class="bpn-product-grid-item__price--regular">${price}</span>`
}
        </div>
      </div>
    </a>
    ${safeGet(variant, 'availableForSale', false)
    ? `<form method="post" action="/cart/add" class="bpn-product-grid-item__form">
           <input type="hidden" name="id" value="${safeGet(variant, 'id', '')}">
           <input type="hidden" name="quantity" value="1">
           <button type="submit" class="bpn-product-grid-item__add-to-cart button button-primary">
             Add to cart
           </button>
         </form>`
    : `<button type="button" class="bpn-product-grid-item__sold-out button button-disabled" disabled>
           Sold Out
         </button>`
}
  `;

  return productCard;
}

/**
 * Update product pricing if it has changed
 * @param {HTMLElement} productElement - The product element
 * @param {Object} productData - Product data from GraphQL
 */
export function updateProductPricing(productElement, productData) {
  if (!productElement || !productData) {
    return;
  }

  const variant = safeFirst(safeGet(productData, 'variants.nodes'));
  const priceElement = productElement.querySelector('.bpn-product-grid-item__price');

  if (!priceElement || !variant) {
    return;
  }

  // Get price data safely
  const priceAmount = safeGet(variant, 'price.amount');
  const currencyCode = safeGet(variant, 'price.currencyCode', 'USD');

  if (!exists(priceAmount)) {
    return;
  }

  // Format the price
  const formatPrice = formatMoney(priceAmount, currencyCode);

  // Safely check for compareAtPrice
  const compareAtPriceAmount = safeGet(variant, 'compareAtPrice.amount');
  const compareAtPrice = exists(compareAtPriceAmount)
    ? formatMoney(
      compareAtPriceAmount,
      safeGet(variant, 'compareAtPrice.currencyCode', currencyCode),
    )
    : null;

  // Only update if it's different to avoid unnecessary DOM changes
  if (compareAtPrice) {
    priceElement.innerHTML = `
      <span class="bpn-product-grid-item__price--sale">${formatPrice}</span>
      <span class="bpn-product-grid-item__price--compare">${compareAtPrice}</span>
    `;
  } else {
    priceElement.innerHTML = `
      <span class="bpn-product-grid-item__price--regular">${formatPrice}</span>
    `;
  }
}
