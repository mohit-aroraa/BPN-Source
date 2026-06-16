/**
 * GTM Data Layer - Shared Utilities
 */

/**
 * Read and parse the GTM config from the Liquid-rendered JSON block.
 * @returns {Object|null} Parsed config object or null if not found/invalid
 */
export const getConfig = () => {
  const configEl = document.getElementById('gtm-data-layer-config');
  if (!configEl) {
    console.warn('GTM Data Layer: Config element not found');
    return null;
  }
  try {
    return JSON.parse(configEl.textContent);
  } catch (e) {
    console.error('GTM Data Layer: Failed to parse config', e);
    return null;
  }
};

/**
 * Check if a specific event is enabled in the config.
 * @param {Object} config - GTM config object
 * @param {string} eventName - Event name to check (e.g., 'view_item')
 * @returns {boolean}
 */
export const isEventEnabled = (config, eventName) => {
  return config?.events?.[eventName] === true;
};

/**
 * Push data to the dataLayer, optionally clearing ecommerce first.
 * @param {Object} data - Event data to push
 * @param {boolean} [clearEcommerce=false] - Whether to push ecommerce:null first
 */
export const pushToDataLayer = (data, clearEcommerce = false) => {
  window.dataLayer = window.dataLayer || [];
  if (clearEcommerce) {
    window.dataLayer.push({ ecommerce: null });
  }
  window.dataLayer.push(data);
};

/**
 * Get the active currency code.
 * @returns {string} Currency code (defaults to 'USD')
 */
export const getCurrency = () => {
  return window.Shopify?.currency?.active || 'USD';
};

/**
 * Format a product/variant into GA4 item schema.
 * @param {Object} params - Product data parameters
 * @param {string} [params.sku] - Variant SKU
 * @param {string|number} [params.variantId] - Variant ID
 * @param {string} [params.title] - Product title
 * @param {string} [params.vendor] - Product vendor
 * @param {string} [params.type] - Product type
 * @param {string} [params.variantTitle] - Variant title
 * @param {number} [params.price] - Price in cents
 * @param {number} [params.quantity=1] - Quantity
 * @param {number} [params.index] - Position in list
 * @returns {Object} GA4-compliant item object
 */
export const formatGA4Item = ({
  sku,
  variantId,
  title,
  vendor,
  type,
  variantTitle,
  price,
  quantity = 1,
  index,
}) => {
  /* eslint-disable camelcase -- GA4 item schema requires snake_case properties */
  const item = {
    item_id: sku || variantId?.toString() || 'unknown',
    item_name: title || '',
    item_brand: vendor || 'Bare Performance Nutrition',
    item_category: type || '',
    item_variant: variantTitle || '',
    price: typeof price === 'number' ? price / 100 : 0,
    quantity,
  };
  /* eslint-enable camelcase */
  if (typeof index === 'number') {
    item.index = index;
  }
  return item;
};

/**
 * Fetch current cart state from Shopify API.
 * @returns {Promise<Object|null>} Cart JSON or null on failure
 */
export const fetchCartState = async () => {
  try {
    const response = await fetch('/cart.js');
    if (!response.ok) {
      throw new Error(`Cart fetch failed: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.error('GTM Data Layer: Failed to fetch cart', e);
    return null;
  }
};

/**
 * Get list context (id + name) from a DOM element's section context.
 * @param {HTMLElement} element - Element to derive list context from
 * @returns {Object} { id: string, name: string }
 */
export const getListContext = (element) => {
  const section = element?.closest(
    'section, [data-section-type], [data-item-list-id]',
  );

  if (section) {
    if (section.dataset.itemListId && section.dataset.itemListName) {
      return {
        id: section.dataset.itemListId,
        name: section.dataset.itemListName,
      };
    }

    const sectionId = section.id || section.dataset.sectionId || '';
    const heading = section.querySelector('h1, h2, h3');
    const name = heading?.textContent?.trim() || sectionId || 'Product List';

    return {
      id: sectionId || 'unknown',
      name,
    };
  }

  // Collection page fallback
  const collectionMatch = window.location.pathname.match(
    /\/collections\/([^/\?#]+)/,
  );
  if (collectionMatch) {
    return {
      id: `collection_${collectionMatch[1]}`,
      name: collectionMatch[1]
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    };
  }

  // Homepage fallback
  if (window.location.pathname === '/') {
    return { id: 'homepage', name: 'Homepage' };
  }

  return { id: 'unknown', name: 'Product List' };
};
