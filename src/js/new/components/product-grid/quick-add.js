/**
 * Quick Add to Cart
 *
 * Handles adding products to cart directly from the product grid
 * and opens the cart drawer after successful addition
 */
import { exists } from '../../utils/data-safety.js';
import { getCustomerIsSMSSubscribed } from '../../helpers/customer';
import { EVENTS } from '../../vue/cart/constants.js';

/**
 * Add an item to the cart
 * @param {number} id - Variant ID to add
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<Object>} - Cart response data
 */
async function addToCart(id, quantity = 1) {
  try {
    const properties = {
      __SMS: getCustomerIsSMSSubscribed(),
    };

    // Add athlete name as a line item property if available
    if (window.BPN && window.BPN.athleteName) {
      // eslint-disable-next-line camelcase
      properties.athlete_name = window.BPN.athleteName;
    }

    // Update cart attributes if athlete name is available
    if (window.BPN && window.BPN.athleteName) {
      const attrResponse = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: {
            // eslint-disable-next-line camelcase
            athlete_name: window.BPN.athleteName,
          },
        }),
      });

      if (attrResponse.ok) {
        await attrResponse.json();
      }
    }

    // Add item to cart
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        quantity,
        properties: properties,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.description || 'Error adding to cart');
    }

    const addedItem = await response.json();

    return addedItem;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
}

/**
 * Open the cart drawer
 */
function openCartDrawer() {
  // Check for BPN namespace first (preferred approach)
  if (exists(window.BPN) && exists(window.BPN.cart) && typeof window.BPN.cart.open === 'function') {
    window.BPN.cart.open();
  }
  // Fall back to legacy global function if available
  else if (typeof window.openCartDrawer === 'function') {
    window.openCartDrawer();
  }
  // Use event as final fallback
  else {
    document.dispatchEvent(new CustomEvent('cart:open', {}));
  }
}

/**
 * Show toast notification if available
 * @param {string} message - Message to display
 * @param {boolean} isError - Whether this is an error message
 */
function showToast(message, isError = false) {
  if (typeof window.enableToast === 'function') {
    window.enableToast(message, isError);
  } else {
    // Fallback alert if no toast available
    if (isError) {
      alert(message);
    }
  }
}

/**
 * Handle click on quick add button
 * @param {Event} event - Click event
 */
async function handleQuickAdd(event) {
  const button = event.currentTarget;

  // Get product data from button attributes
  const productId = button.getAttribute('data-product-id');

  if (!productId) {
    console.error('Missing product ID for quick add button');
    return;
  }

  // Don't allow multiple clicks
  if (button.classList.contains('loading')) {
    return;
  }

  // Show loading state
  const originalText = button.textContent;
  button.classList.add('loading');
  button.textContent = 'Adding...';
  button.disabled = true;

  try {
    // Add item to cart
    await addToCart(productId);

    // Show success message
    showToast('Item added to cart');
    document.dispatchEvent(new CustomEvent(EVENTS.ITEM_ADDED, {
      detail: { id: productId },
    }));
  } catch (error) {
    showToast('Failed to add item to cart', true);
  } finally {
    // Reset button state
    button.classList.remove('loading');
    button.textContent = originalText;
    button.disabled = false;
  }
}

/**
 * Initialize quick add functionality by attaching event listeners
 */
export function initQuickAdd() {
  const quickAddButtons = document.querySelectorAll('.js-add-to-cart');

  quickAddButtons.forEach(button => {
    button.addEventListener('click', handleQuickAdd);
  });
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', initQuickAdd);

// Export for direct use
export default {
  initQuickAdd,
  addToCart,
  openCartDrawer,
};
