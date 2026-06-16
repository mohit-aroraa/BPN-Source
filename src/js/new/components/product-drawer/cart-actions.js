/**
 * Cart Actions for Product Drawer
 *
 * Utility functions for interacting with the Shopify cart when adding products
 * from the product drawer
 */
import { exists, safeGet } from '../../utils/data-safety.js';
import { getCustomerIsSMSSubscribed } from '../../helpers/customer';

/**
 * Format a cart item for the Shopify Cart API
 * @param {Object} item - Raw item to format
 * @returns {Object} Formatted item
 */
const formatCartItem = (item) => {
  const formattedItem = {
    quantity: safeGet(item, 'quantity', 1),
    properties: {},
  };

  let variantId = safeGet(item, 'id');
  if (typeof variantId === 'string' && variantId.includes('gid://shopify/ProductVariant/')) {
    variantId = variantId.split('/').pop();
  }
  formattedItem.id = parseInt(variantId);

  // Check if this is a subscription product
  const isSubscription = exists(item.selling_plan);

  if (isSubscription) {
    let sellingPlanId = item.selling_plan;
    if (typeof sellingPlanId === 'string' && sellingPlanId.includes('gid://shopify/SellingPlan/')) {
      sellingPlanId = sellingPlanId.split('/').pop();
    }
    // eslint-disable-next-line camelcase
    formattedItem.selling_plan = parseInt(sellingPlanId);

    // Add subscription flag to item properties
    formattedItem.properties.subscriptionProduct = 'true';
    console.log('Adding subscription flag to line item properties');
  }

  if (exists(item.properties)) {
    formattedItem.properties = { ...formattedItem.properties, ...item.properties };
  }

  formattedItem.properties.__SMS = getCustomerIsSMSSubscribed();

  // Add athlete name as a line item property if available
  if (window.BPN && window.BPN.athleteName) {
    // eslint-disable-next-line camelcase
    formattedItem.properties.athlete_name = window.BPN.athleteName;
  }

  return formattedItem;
};

/**
 * Add an item to the cart via Shopify's Cart API
 * @param {Object} item - Item to add (id, quantity, selling_plan, etc.)
 * @returns {Promise<Object>} Added item details
 */
export const addToCart = async (item) => {
  try {
    const payload = formatCartItem(item);
    const cartAttributes = {};

    // Add athlete name as a cart attribute if available
    if (window.BPN && window.BPN.athleteName) {
      // eslint-disable-next-line camelcase
      cartAttributes.athlete_name = window.BPN.athleteName;
    }

    // First update cart attributes if needed (only for athlete name)
    if (Object.keys(cartAttributes).length > 0) {
      // Get current cart attributes first
      const cartResponse = await fetch('/cart.js');
      const cartData = await cartResponse.json();
      const existingAttributes = cartData.attributes || {};

      // Merge with new attributes (don't overwrite existing ones unless new value provided)
      const mergedAttributes = { ...existingAttributes, ...cartAttributes };

      const attrResponse = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attributes: mergedAttributes }),
      });

      if (attrResponse.ok) {
        await attrResponse.json();
      }
    }

    // Then add the item to cart
    const response = await fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(safeGet(errorData, 'description', 'Error adding to cart'));
    }
    const addedItem = await response.json();
    return addedItem;
  } catch (error) {
    throw error;
  }
};

/**
 * Open the cart drawer
 */
export const openCartDrawer = () => {
  // Check for BPN namespace first
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
};

export const openCartDrawerDelayed = (delay = 100) => {
  setTimeout(() => {
    openCartDrawer();
  }, delay);
};
