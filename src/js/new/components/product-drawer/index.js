/**
 * Product Drawer Module
 *
 * Main entry point for product drawer functionality
 * Provides an interface for opening product drawers with subscription options
 */

import { ProductDrawerController } from './product-drawer-controller.js';

/**
 * Open the product drawer
 * @param {Object} options - Options for opening the drawer
 * @param {string} options.productHandle - Product handle to load
 */
export const openProductDrawer = (options = {}) => {
  document.dispatchEvent(new CustomEvent('product-drawer:open', { detail: options }));
};

/**
 * Close the product drawer
 */
export const closeProductDrawer = () => {
  document.dispatchEvent(new CustomEvent('product-drawer:close'));
};

/**
 * Initialize the product drawer
 * @returns {ProductDrawerController} The product drawer controller instance
 */
export function initProductDrawer() {
  return new ProductDrawerController();
}

// Initialize when the DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initProductDrawer);
}

// Set up global namespace for product drawer
if (typeof window !== 'undefined') {
  // Create BPN namespace if it doesn't exist
  window.BPN = window.BPN || {};
  window.BPN.productDrawer = window.BPN.productDrawer || {};

  // Add exported functions to namespace
  window.BPN.productDrawer.open = openProductDrawer;
  window.BPN.productDrawer.close = closeProductDrawer;
  window.BPN.productDrawer.init = initProductDrawer;
}
