import { createApp, h } from 'vue';

// Directives
import focusTrap from '../../../bundles/utils/directives/focus-trap';
import clickOutside from '../../../bundles/utils/directives/click-outside';

// Components
import CartDrawer from './cart-drawer.vue';
import { openCartDrawer } from './helpers';

/**
 * Expose cart opening function to the global scope
 * for backwards compatibility with existing code
 */
window.openCartDrawer = openCartDrawer;

/**
 * Initialize the cart drawer Vue application
 * This should be called once when the page loads
 */
export const initCartDrawer = () => {
  const cartElement = document.getElementById('cart');

  // Only initialize if the cart element exists
  if (!cartElement) {
    return;
  }

  // Create the Vue application instance
  const cartDrawer = createApp({
    render: () => h(CartDrawer),
  });

  // Register global directives
  cartDrawer.directive('trap', focusTrap);
  cartDrawer.directive('click-outside', clickOutside);

  // Mount the app to the DOM
  cartDrawer.mount('#cart');

  // Return the app instance for potential future reference
  return cartDrawer;
};
