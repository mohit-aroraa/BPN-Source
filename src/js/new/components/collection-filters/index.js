/**
 * Collection Filters Module
 *
 * Main entry point for collection filters
 * Handles instant filtering with Shopify's GraphQL API for metafield-based filters
 */

import { FilterController } from './filter-controller.js';

/**
 * Initialize collection filters
 * @returns {FilterController} The filter controller instance
 */
export function initCollectionFilters() {
  return new FilterController();
}

// Initialize when the DOM is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCollectionFilters);
}
