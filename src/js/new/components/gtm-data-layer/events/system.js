/**
 * GTM Data Layer - System Events
 * Events: error_404, out_of_stock_view
 */
import { pushToDataLayer, isEventEnabled } from '../utils.js';

/**
 * Track 404 page view
 * Fires immediately when the template is '404'
 */
export const initError404 = (config) => {
  if (!isEventEnabled(config, 'error_404')) {
    return;
  }

  if (config.templateName !== '404') {
    return;
  }

  /* eslint-disable camelcase -- GA4 event schema requires snake_case properties */
  pushToDataLayer({
    event: 'error_404',
    page_location: window.location.href,
    page_referrer: document.referrer || 'direct',
  });
  /* eslint-enable camelcase */
};

/**
 * Track out-of-stock variant views on PDP
 * Fires on initial load if default variant is OOS,
 * and on variant change if newly selected variant is OOS.
 */
export const initOutOfStockView = (config) => {
  if (!isEventEnabled(config, 'out_of_stock_view')) {
    return;
  }

  if (config.templateName !== 'product') {
    return;
  }

  const productData = window.BPN?.currentProductData;
  if (!productData) {
    console.warn('GTM Data Layer: out_of_stock_view - Product data not found');
    return;
  }

  // Track OOS for initial/selected variant
  const checkAndTrackOOS = (variant) => {
    if (!variant || variant.available) {
      return;
    }

    /* eslint-disable camelcase -- GA4 event schema requires snake_case properties */
    pushToDataLayer({
      event: 'out_of_stock_view',
      item_id: variant.sku || variant.id?.toString() || 'unknown',
      item_name: productData.shopify_raw_title || productData.title || '',
    });
    /* eslint-enable camelcase */
  };

  // Check the selected or first available variant on load
  const selectedVariant = productData.selected_or_first_available_variant;
  checkAndTrackOOS(selectedVariant);

  // Listen for variant changes
  // BPN's buy-box dispatches variant changes via URL updates (?variant=ID)
  // We watch for URL changes and find the new variant from productData.variants
  const trackedVariants = new Set();
  if (selectedVariant && !selectedVariant.available) {
    trackedVariants.add(selectedVariant.id);
  }

  // Handle variant change by reading variant ID from URL
  const handleVariantChange = () => {
    const params = new URLSearchParams(window.location.search);
    const variantId = params.get('variant');

    if (!variantId) {
      return;
    }

    const variantIdNum = parseInt(variantId, 10);
    if (trackedVariants.has(variantIdNum)) {
      return;
    }

    const variant = productData.variants?.find(
      (v) => v.id === variantIdNum,
    );

    if (variant && !variant.available) {
      trackedVariants.add(variantIdNum);
      /* eslint-disable camelcase -- GA4 event schema requires snake_case properties */
      pushToDataLayer({
        event: 'out_of_stock_view',
        item_id: variant.sku || variant.id?.toString() || 'unknown',
        item_name: productData.shopify_raw_title || productData.title || '',
      });
      /* eslint-enable camelcase */
    }
  };

  // Listen for popstate (back/forward navigation)
  window.addEventListener('popstate', handleVariantChange);

  // Intercept pushState/replaceState for variant selector changes
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleVariantChange();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleVariantChange();
  };
};
