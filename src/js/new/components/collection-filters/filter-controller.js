/**
 * Collection Filters Controller
 *
 * Main controller module for handling collection filters
 * Coordinates URL parameter handling, GraphQL queries, and DOM updates
 */

import { graphqlClient } from '../../utils/graphql-client.js';
import { processMetafieldParams, processSortParam } from './url-params.js';
import { renderProducts, setLoadingState } from './product-rendering.js';
import { exists, safeGet } from '../../utils/data-safety.js';
import { lockBodyScroll, unlockBodyScroll } from '../../helpers/common';

export const getCollectionHandle = () => {
  // Prioritize data attribute on .bpn-collection element
  const collectionElement = document.querySelector('.bpn-collection');
  if (collectionElement && collectionElement.dataset.collectionHandle) {
    return collectionElement.dataset.collectionHandle;
  }

  return window.location.pathname.split('/').filter(p => p).pop();
};

export class FilterController {
  constructor() {
    try {
      // DOM elements
      this.filtersForm = document.querySelector('#FacetFiltersForm');
      this.productGrid = document.querySelector('.bpn-collection__products');
      this.productsContainer = document.querySelector('.bpn-collection__products-inner');
      this.resetFilterTrigger = document.querySelector('.bpn-facets__active-filter-clear-button');
      this.activeFilterItems = document.querySelectorAll('.bpn-facets__active-filter .bpn-facets__active-filter-item');
      this.activeFilterItemsButtons = document.querySelectorAll('.bpn-facets__active-filter .bpn-facets__active-filter-item .bpn-facets__active-filter-button');

      // Mobile drawer elements
      this.sidebar = document.querySelector('.bpn-collection__sidebar');

      this.backdropElement = document.querySelector('#cart-backdrop');
      this.sidebarCloseTrigger = document.querySelector('.bpn-collection__sidebar-close-button');
      this.openFilterTrigger = document.querySelector('.bpn-collection__filter-trigger');
      this.drawerAppplyFilterTrigger = document.querySelector('.bpn-collection__sidebar-footer-button.primary-button');
      this.drawerResetFilterTrigger = document.querySelector('.bpn-collection__sidebar-footer-button.secondary-button');

      // Collection data - use safe access patterns
      this.collectionHandle = getCollectionHandle();

      // Initialize if elements exist
      if (this.filtersForm && this.productGrid) {
        this.init();
      } else {
        this.setupSorting();
        console.warn('Collection filters: Required elements not found', {
          filtersForm: !!this.filtersForm,
          productGrid: !!this.productGrid,
        });
      }
    } catch (error) {
      console.error('Error initializing collection filters:', error);
    }
  }

  /**
   * Initialize the filters
   */
  init() {
    // Handle URL parameters on page load
    this.handleUrlParams();

    // Set up event listeners for filter inputs
    this.setupFilterInputs();

    // Set up active filter removal
    this.setupActiveFilters();

    // Set up sorting
    this.setupSorting();

    this.setupMobileDrawer();
  }

  uncheckFilters() {
    this.activeFilterItemsButtons.forEach((button) => {
      const { name, value } = safeGet(button, 'dataset', {});

      const filter = document.querySelector(`input[name="${name}"][value="${value}"]`);

      if (exists(filter)) {
        filter.checked = false;

        button.parentElement.classList.remove('active');
      }
    });
  }

  /**
   * Handle URL parameters when the page loads
   */
  handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    let paramsApplied = false;

    // Process metafield filter parameters
    paramsApplied = processMetafieldParams(urlParams, this.filtersForm) || paramsApplied;

    // Process sort parameter
    paramsApplied = processSortParam(urlParams) || paramsApplied;

    // If URL parameters were applied, update the UI
    if (paramsApplied) {
      // Apply filters without navigating - just update the UI
      this.applyFilters();
    }
  }

  /**
   * Set up event listeners for filter inputs (checkboxes, etc.)
   */
  setupFilterInputs() {
    // Find all checkbox inputs
    const checkboxes = this.filtersForm.querySelectorAll('input[type="checkbox"]');

    // Add change event listener to each checkbox for instant filtering
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        let isActive = false;
        const { name, value } = checkbox;
        const activeFilterButton = document.querySelector(`button[data-name="${name}"][data-value="${value}"]`);

        // If the checkbox is unchecked and there's a hidden input with the same name, remove it
        if (!checkbox.checked) {
          const hiddenInput = this.filtersForm.querySelector(`input[type="hidden"][name="${checkbox.name}"]`);
          if (hiddenInput) {
            hiddenInput.remove();
          }
        } else {
          isActive = true;
        }

        if (exists(activeFilterButton)) {
          activeFilterButton.parentElement.classList.toggle('active', isActive);
        }

        this.applyFilters();
        this.syncResetButtonFilter();
      });
    });
  }

  syncFilterProductCount(count) {
    document.querySelectorAll('.filtered-product-count').forEach(item => {
      item.innerHTML = item.innerHTML.replace(/\d+/, count);
    });
  }

  syncResetButtonFilter() {
    let isActive = false;

    this.activeFilterItems.forEach(item => {
      if (item.classList.contains('active')) {
        isActive = true;
      }
    });

    this.resetFilterTrigger.classList.toggle('active', isActive);
  };

  /**
   * Set up active filter removal
   */
  setupActiveFilters() {
    this.activeFilterItemsButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();

        const { name, value } = safeGet(event, 'currentTarget.dataset', {});

        const filter = document.querySelector(`input[name="${name}"][value="${value}"]`);

        if (exists(filter)) {
          filter.checked = false;

          button.parentElement.classList.remove('active');

          this.applyFilters();
          this.syncResetButtonFilter();
        }
      });
    });

    if (exists(this.resetFilterTrigger)) {
      this.resetFilterTrigger.addEventListener('click', (event) => {
        event.preventDefault();

        this.uncheckFilters();
        this.applyFilters();
        this.syncResetButtonFilter();
      });
    }
  }

  /**
   * Set up sorting
   */
  setupSorting() {
    const sortSelect = document.getElementById('SortBy');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.applyFilters();
      });
    }
  }

  /**
   * Apply filters based on form state using GraphQL
   */
  applyFilters() {
    try {
      setLoadingState(this.productGrid, true);

      const searchParams = new URLSearchParams(window.location.search);

      if (this.filtersForm) {
        const formData = new FormData(this.filtersForm);

        // Clear existing params that correspond to current filter inputs
        for (const key of Array.from(searchParams.keys())) {
          if (this.filtersForm.querySelector(`[name="${key}"]`)) {
            searchParams.delete(key);
          }
        }

        // Add form data to URLSearchParams
        for (const [key, value] of formData.entries()) {
          searchParams.append(key, value); // allows multiple values for same key
        }
      }

      const sortSelect = document.getElementById('SortBy');
      if (sortSelect && sortSelect.value) {
        searchParams.set('sort_by', sortSelect.value);
      }

      const searchParamsString = searchParams.toString();
      const url = `${window.location.pathname}?${searchParamsString}${window.location.hash}`;

      // Build filterParams: collect multiple values into arrays
      const filterParams = {};
      for (const [key, value] of searchParams.entries()) {
        if (filterParams[key]) {
          filterParams[key] = [].concat(filterParams[key], value);
        } else {
          filterParams[key] = value;
        }
      }

      const sortKey = searchParams.get('sort_by') || 'BEST_SELLING';
      const reverse = ['title-descending', 'price-descending', 'created-descending'].includes(sortKey);

      let graphqlSortKey = 'BEST_SELLING';
      if (sortKey === 'title-ascending' || sortKey === 'title-descending') {
        graphqlSortKey = 'TITLE';
      } else if (sortKey === 'price-ascending' || sortKey === 'price-descending') {
        graphqlSortKey = 'PRICE';
      } else if (sortKey === 'created-ascending' || sortKey === 'created-descending') {
        graphqlSortKey = 'CREATED';
      } else if (sortKey === 'manual') {
        graphqlSortKey = 'MANUAL';
      }

      // Fetch data using GraphQL
      graphqlClient.getCollection(this.collectionHandle, filterParams, graphqlSortKey, reverse)
        .then(data => {
          // Safe check for collection data
          const collection = safeGet(data, 'collection');
          if (!collection) {
            throw new Error('Collection not found');
          }

          // Get products with safe access
          const products = safeGet(collection, 'products.nodes', []);

          // Update the product grid
          renderProducts(products, this.productsContainer);

          this.syncFilterProductCount(products.length);
          // Update the URL without triggering a page load
          window.history.pushState({ filters: filterParams }, '', url);

          // Remove loading state
          setLoadingState(this.productGrid, false);

          // Dispatch a custom event to notify other components
          window.dispatchEvent(new CustomEvent('collection:filtersUpdated', {
            detail: { collection },
          }));
        })
        .catch(error => {
          console.error('Error applying filters:', error);
          // Remove loading state
          setLoadingState(this.productGrid, false);
        });
    } catch (error) {
      console.error('Error in applyFilters:', error);
      setLoadingState(this.productGrid, false);
    }
  }

  // Mobile Drawer functionality
  onBackdropClick(e) {
    if (e.target.id === 'cart-backdrop') {
      this.closeDrawer();
    }
  }

  closeDrawer() {
    if (exists(this.backdropElement)) {
      this.backdropElement.classList.remove('visible');
      this.sidebar.classList.remove('visible');
      unlockBodyScroll();
    }
  }

  openDrawer() {
    if (exists(this.backdropElement)) {
      this.backdropElement.classList.add('visible');
      this.sidebar.classList.add('visible');

      lockBodyScroll();
    }
  }

  setupMobileDrawer() {
    if (exists(this.backdropElement)) {
      this.backdropElement.addEventListener('click', this.onBackdropClick.bind(this));
    }

    if (exists(this.openFilterTrigger)) {
      this.openFilterTrigger.addEventListener('click', this.openDrawer.bind(this));
    }

    if (exists(this.sidebarCloseTrigger)) {
      this.sidebarCloseTrigger.addEventListener('click', this.closeDrawer.bind(this));
    }

    if (exists(this.drawerResetFilterTrigger)) {
      this.drawerResetFilterTrigger.addEventListener('click',
        (event) => {
          event.preventDefault();

          this.uncheckFilters();
          this.applyFilters();
          this.syncResetButtonFilter();
          this.closeDrawer();
        });
    }

    if (exists(this.drawerAppplyFilterTrigger)) {
      this.drawerAppplyFilterTrigger.addEventListener('click', this.closeDrawer.bind(this));
    }
  }
}
