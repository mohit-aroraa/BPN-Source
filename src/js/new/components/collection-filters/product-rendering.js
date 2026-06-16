/**
 * Product rendering functionality for collection filters
 */

import { createProductCard } from './product-display.js';
import { safeGet } from '../../utils/data-safety.js';

function sortDOMElementsBySetOrder(container, orderSet) {
  // Convert Set to Array to get indices for ordering
  const orderArray = Array.from(orderSet);

  // Get all child elements with data-product-handle attribute
  const elements = Array.from(container.children).filter(el =>
    el.hasAttribute('data-product-handle'),
  );

  // Separate promotion element from regular elements
  let promotionElement = null;
  const regularElements = [];

  elements.forEach(el => {
    const handle = el.getAttribute('data-product-handle');
    if (handle === 'promotion') {
      promotionElement = el;
    } else {
      regularElements.push(el);
    }
  });

  // Sort regular elements based on the order in the Set
  regularElements.sort((a, b) => {
    const handleA = a.getAttribute('data-product-handle');
    const handleB = b.getAttribute('data-product-handle');

    const indexA = orderArray.indexOf(handleA);
    const indexB = orderArray.indexOf(handleB);

    // Elements not in the set go to the end
    if (indexA === -1 && indexB === -1) {
      return 0;
    }
    if (indexA === -1) {
      return 1;
    }
    if (indexB === -1) {
      return -1;
    }

    return indexA - indexB;
  });

  // Create final sorted array and insert promotion if it exists
  const finalElements = [...regularElements];

  if (promotionElement) {
    const position = parseInt(promotionElement.getAttribute('data-product-position'));

    if (isNaN(position) || position >= finalElements.length) {
      // If position is invalid or greater than array length, add to end
      finalElements.push(promotionElement);
    } else {
      // Insert at the specified position (0-based index)
      finalElements.splice(position, 0, promotionElement);
    }
  }

  // Append elements back to container in the new order
  finalElements.forEach(element => {
    container.appendChild(element);
  });

  return finalElements;
}


/**
 * Show a "No results" message when no products match filters
 * @param {HTMLElement} productsContainer - Container for products
 */
export function showNoResults(productsContainer) {
  // Hide all products
  const allProducts = document.querySelectorAll('.bpn-product-grid-item');
  allProducts.forEach(product => {
    product.style.display = 'none';
  });

  // Show no results message if it doesn't exist
  if (!productsContainer.querySelector('.bpn-collection__no-results')) {
    const noResults = document.createElement('div');
    noResults.className = 'bpn-collection__no-results';
    noResults.textContent = 'No products found';
    productsContainer.appendChild(noResults);
  }
}

/**
 * Clear the "No results" message if it exists
 * @param {HTMLElement} productsContainer - Container for products
 */
export function clearNoResultsMessage(productsContainer) {
  const noResults = productsContainer.querySelector('.bpn-collection__no-results');
  if (noResults) {
    noResults.remove();
  }
}

/**
 * Process existing products - show or hide them based on filtering
 * @param {Array} products - Products from GraphQL response
 * @param {Set} filteredProductHandles - Set of product handles in filtered results
 * @param {HTMLElement} productsContainer - Container for products
 * @return {Set} - Set of product handles that were found in the DOM
 */
export function processExistingProducts(products, filteredProductHandles, productsContainer) {
  // Get all product elements
  const allProducts = document.querySelectorAll('.bpn-product-grid-item');

  // Track which products we've shown
  const shownHandles = new Set();

  // Show/hide products based on filtered results
  allProducts.forEach(productElement => {
    const productLink = productElement.querySelector('a[href*="/products/"]');
    if (!productLink) {
      return;
    }

    // Extract handle from product URL
    const href = productLink.getAttribute('href') || '';
    const handleMatch = href.match(/\/products\/([^/?#]+)/);

    if (handleMatch && handleMatch[1]) {
      const handle = handleMatch[1];

      // If the product is in our filtered results, show it
      if (filteredProductHandles.has(handle)) {
        productElement.style.display = '';
        shownHandles.add(handle);
      } else {
        // Otherwise hide it
        productElement.style.display = 'none';
      }
    }
  });

  return shownHandles;
}

/**
 * Append any missing products that aren't in the DOM yet
 * @param {Array} products - Products from GraphQL response
 * @param {Set} filteredProductHandles - Set of product handles in filtered results
 * @param {Set} shownHandles - Set of product handles already shown in the DOM
 * @param {HTMLElement} productsContainer - Container for products
 */
export function appendMissingProducts(products, filteredProductHandles, shownHandles, productsContainer) {
  try {
    // Find handles we need to append (products in filtered results but not shown yet)
    const missingHandles = new Set([...filteredProductHandles].filter(handle => !shownHandles.has(handle)));

    // Append missing products
    if (missingHandles.size > 0) {
      products
        .filter(product => missingHandles.has(safeGet(product, 'handle', '')))
        .forEach(product => {
          try {
            const productElement = createProductCard(product);
            if (productElement) {
              productsContainer.appendChild(productElement);
            }
          } catch (error) {
            console.error('Error creating product card:', error, product);
          }
        });
    }
    sortDOMElementsBySetOrder(productsContainer, filteredProductHandles);
  } catch (error) {
    console.error('Error appending missing products:', error);
  }
}

/**
 * Set loading state for the collection
 * @param {HTMLElement} productGrid - Product grid element
 * @param {boolean} isLoading - Whether the collection is loading
 */
export function setLoadingState(productGrid, isLoading) {
  if (!productGrid) {
    return;
  }

  if (isLoading) {
    productGrid.classList.add('is-loading');

    // Add a loading overlay if it doesn't exist
    if (!productGrid.querySelector('.bpn-collection__loading-overlay')) {
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'bpn-collection__loading-overlay';
      loadingOverlay.innerHTML = '<div class="bpn-collection__loading-spinner"></div>';
      productGrid.appendChild(loadingOverlay);
    }
  } else {
    productGrid.classList.remove('is-loading');

    // Remove the loading overlay
    const loadingOverlay = productGrid.querySelector('.bpn-collection__loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }
}

/**
 * Render products to the product grid
 * @param {Array} products - Products from GraphQL response
 * @param {HTMLElement} productsContainer - Container for products
 * @return {void}
 */
export function renderProducts(products, productsContainer) {
  if (!productsContainer || !Array.isArray(products)) {
    console.warn('Invalid parameters for renderProducts', { products, productsContainer });
    return;
  }

  // Build a set of product handles from the filtered results for fast lookup
  const filteredProductHandles = new Set(products.map(product => safeGet(product, 'handle', '')));

  // If no products found
  if (products.length === 0) {
    showNoResults(productsContainer);
    return;
  }

  // Remove no results message if it exists
  clearNoResultsMessage(productsContainer);

  // Process existing products
  const shownHandles = processExistingProducts(products, filteredProductHandles, productsContainer);

  // Append any missing products
  appendMissingProducts(products, filteredProductHandles, shownHandles, productsContainer);
}
