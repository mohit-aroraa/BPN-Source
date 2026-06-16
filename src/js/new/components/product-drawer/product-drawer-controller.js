/**
 * Product Drawer Controller
 *
 * Main controller module for handling the product drawer
 * Manages drawer opening/closing and product loading with Vue integration
 */

import { exists, safeGet } from '../../utils/data-safety.js';
import { createApp } from 'vue';
import * as vueComponents from './vue/index.js';

// Events
export const EVENTS = {
  OPEN: 'product-drawer:open',
  CLOSE: 'product-drawer:close',
  ADD_TO_CART: 'product-drawer:add-to-cart',
};

export class ProductDrawerController {
  constructor() {
    try {
      // DOM elements
      this.drawerElement = document.getElementById('bpn-product-drawer');
      this.backdropElement = document.getElementById('bpn-product-drawer-backdrop');
      this.contentElement = this.drawerElement?.querySelector('.bpn-product-drawer__content');
      this.closeButton = null;

      // Vue app instance
      this.vueApp = null;

      // State
      this.isOpen = false;
      this.currentProductHandle = null;
      this.isVueLoaded = true;

      // Initialize if elements exist
      if (this.drawerElement && this.backdropElement) {
        this.init();
      } else {
        console.warn('Product drawer: Required elements not found');
      }
    } catch (error) {
      console.error('Error in ProductDrawerController constructor:', error);
    }
  }

  /**
   * Initialize the drawer
   */
  init() {
    // Set up event listeners
    this.setupEventListeners();

    // Set up buttons
    this.setupButtons();

    // Expose global methods
    this.exposeGlobalMethods();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Document level events
    document.addEventListener(EVENTS.OPEN, this.handleOpenEvent.bind(this));
    document.addEventListener(EVENTS.CLOSE, this.handleCloseEvent.bind(this));
    document.addEventListener(EVENTS.ADD_TO_CART, this.handleAddToCartEvent.bind(this));
    document.addEventListener('keydown', this.handleKeyboardEvents.bind(this));

    // Backdrop click
    this.backdropElement.addEventListener('click', this.close.bind(this));
  }

  /**
   * Set up buttons and controls
   */
  setupButtons() {
    // Close button
    this.closeButton = this.drawerElement.querySelector('.bpn-product-drawer-close');
    if (exists(this.closeButton)) {
      this.closeButton.addEventListener('click', this.close.bind(this));
    }

    // Trigger buttons in the page
    const triggerButtons = document.querySelectorAll('.js-product-drawer-trigger');

    triggerButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const productHandle = button.getAttribute('data-product-handle');

        if (productHandle) {
          this.open({ productHandle });
        }
      });
    });
  }

  /**
   * Open the drawer
   * @param {Object} options - Options for opening the drawer
   * @param {string} options.productHandle - Product handle to load
   */
  open(options = {}) {
    document.dispatchEvent(new CustomEvent(EVENTS.OPEN, { detail: options }));
  }

  /**
   * Close the drawer
   */
  close() {
    document.dispatchEvent(new CustomEvent(EVENTS.CLOSE));
  }

  /**
   * Handle open event
   * @param {CustomEvent} event - The open event with details
   */
  handleOpenEvent(event) {
    const options = safeGet(event, 'detail', {});

    // Set product data if provided
    if (options.productHandle) {
      // Validate product handle format
      const handle = options.productHandle.toString().trim();
      if (!handle) {
        console.error('Product drawer error: Empty product handle provided');
        return;
      }

      // Check for valid handle format (alphanumeric with hyphens)
      if (!/^[a-z0-9-]+$/.test(handle)) {
        console.error('Product drawer error: Invalid product handle format:', handle);
        return;
      }

      this.currentProductHandle = handle;
      this.loadProduct(handle);
    } else {
      console.error('Product drawer error: No product handle provided');
      return;
    }

    // Show the drawer
    this.drawerElement.classList.add('visible');
    this.backdropElement.classList.add('visible');
    this.isOpen = true;
  }

  /**
   * Handle close event
   */
  handleCloseEvent() {
    // Hide the drawer
    this.drawerElement.classList.remove('visible');
    this.backdropElement.classList.remove('visible');
    this.isOpen = false;
  }

  /**
   * Handle add to cart event
   * @param {CustomEvent} event - The add to cart event with details
   */
  handleAddToCartEvent(event) {
    const item = safeGet(event, 'detail', {});

    // Close the product drawer
    this.close();

    // Open the cart drawer after a short delay
    setTimeout(() => {
      if (window.BPN && window.BPN.cart && typeof window.BPN.cart.open === 'function') {
        window.BPN.cart.open();
      } else if (typeof window.openCartDrawer === 'function') {
        window.openCartDrawer();
      } else {
        document.dispatchEvent(new CustomEvent('cart:open', {}));
      }
    }, 300);
  }

  /**
   * Handle keyboard events
   * @param {KeyboardEvent} event - The keyboard event
   */
  handleKeyboardEvents(event) {
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  /**
   * Load product data and mount Vue component
   * @param {string} handle - Product handle to load
   */
  loadProduct(handle) {
    // If content element doesn't exist, nothing to do
    if (!this.contentElement) {
      console.error('Product drawer error: Content element not found');
      return;
    }

    // Validate components were loaded properly
    if (!exists(vueComponents)) {
      console.error('Product drawer error: Vue components object is null or undefined');
      this.contentElement.innerHTML = '<div class="product-drawer__error">Error loading product details</div>';
      return;
    }

    if (!exists(vueComponents.ProductDrawer)) {
      console.error('Product drawer error: ProductDrawer component not found in loaded components:', vueComponents);
      this.contentElement.innerHTML = '<div class="product-drawer__error">Error loading product details</div>';
      return;
    }

    const triggerButton = document.querySelector('.js-product-drawer-trigger[data-product-handle="' + handle + '"]');
    const clickIdPrefix = triggerButton ? triggerButton.getAttribute('data-click-id')?.replace('_cta', '') : '';

    // Create and mount Vue component if not already mounted
    try {
      if (!this.vueApp) {
        const ProductDrawer = vueComponents.ProductDrawer;

        // First, clear the content element
        this.contentElement.innerHTML = '';

        // Create a fresh mount point
        const mountPoint = document.createElement('div');
        this.contentElement.appendChild(mountPoint);

        // Create the Vue app with directly imported createApp
        this.vueApp = createApp(ProductDrawer, {
          productHandle: handle,
          onClose: this.close.bind(this),
          clickIdPrefix: clickIdPrefix,
        });

        // Mount to the fresh mount point
        this.vueApp.mount(mountPoint);

        // No need to check _instance immediately as Vue3 might not populate it synchronously
      } else {
        try {
          // Use nextTick to ensure component has updated
          // Get component instance - Vue 3 has different structure than Vue 2
          const vm = this.vueApp._instance;

          if (vm && vm.props) {
            // Set the handle directly on the props object
            vm.props.productHandle = handle;
            vm.props.clickIdPrefix = clickIdPrefix;

            // Force a component update (if needed)
            if (typeof vm.exposed?.refetchProduct === 'function') {
              vm.exposed.refetchProduct();
            }
          } else {
            // Unmount and create a new Vue app as fallback
            if (this.vueApp) {
              this.vueApp.unmount();
              this.vueApp = null;
            }

            // Retry with a new instance
            this.contentElement.innerHTML = '<div class="product-drawer__loading">Loading...</div>';
            setTimeout(() => this.loadProduct(handle), 100);
          }
        } catch (err) {
          console.error('Product drawer error: Failed to update props:', err);

          // Recreate the app as a fallback
          if (this.vueApp) {
            this.vueApp.unmount();
            this.vueApp = null;
            this.loadProduct(handle);
          }
        }
      }
    } catch (error) {
      console.error('Product drawer error: Failed to mount Vue app:', error);
      this.contentElement.innerHTML = '<div class="product-drawer__error">Error loading product details</div>';
    }
  }

  /**
   * Expose global methods for use outside this module
   */
  exposeGlobalMethods() {
    // Create BPN namespace if it doesn't exist
    window.BPN = window.BPN || {};

    // Add product drawer methods to the BPN namespace
    window.BPN.productDrawer = window.BPN.productDrawer || {};
    window.BPN.productDrawer.open = (options) => {
      this.open(options);
    };
  }
}
