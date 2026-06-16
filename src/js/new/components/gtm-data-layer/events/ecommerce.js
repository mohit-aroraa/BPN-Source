/**
 * GTM Data Layer - E-commerce Events
 *
 * Events: view_item, view_item_list, select_item, add_to_cart, view_cart,
 *         update_cart, remove_from_cart, subscription_upsell
 */
import {
  pushToDataLayer,
  isEventEnabled,
  formatGA4Item,
  getCurrency,
  fetchCartState,
  getListContext,
} from '../utils.js';
import { createCartStateManager } from '../cart-state-manager.js';

/**
 * Track product detail page view (view_item)
 * Fires once on PDP load after DOM ready
 * @param {Object} config - GTM config object
 */
export const initViewItem = (config) => {
  if (!isEventEnabled(config, 'view_item')) {
    return;
  }

  if (config.templateName !== 'product') {
    return;
  }

  const productData = window.BPN?.currentProductData;
  if (!productData) {
    console.warn('GTM Data Layer: view_item - Product data not found');
    return;
  }

  const variant = productData.selected_or_first_available_variant;
  if (!variant) {
    console.warn('GTM Data Layer: view_item - No variant found');
    return;
  }

  const item = formatGA4Item({
    sku: variant.sku,
    variantId: variant.id,
    title: productData.shopify_raw_title || productData.title,
    vendor: 'Bare Performance Nutrition',
    type: productData.type,
    variantTitle: variant.title,
    price: variant.price,
  });

  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      currency: getCurrency(),
      value: item.price,
      items: [item],
    },
  }, true);
};

/**
 * Selectors for product list containers across BPN theme patterns.
 * @type {string[]}
 */
const LIST_SELECTORS = [
  '.bpn-collection__product-grid',
  '.bpn-recommendations__products',
  '.featuredCollection__container',
  '.product-grid',
  '.grid--view-items',
  '.stack-recommendations',
  '[data-product-list]',
];

/**
 * Joined selector string for product card elements.
 * @type {string}
 */
const CARD_SELECTOR = [
  '.bpn-product-grid-item',
  '.js-product-grid-item',
  '.product-card',
  '.collectionProductCard',
  '.productGridItem',
].join(', ');

/**
 * Extract product handle from a card's link URL.
 * @param {HTMLElement} card - Product card element
 * @returns {string} Product handle or empty string
 */
const extractHandleFromLink = (card) => {
  const link = card.closest('a[href*="/products/"]')
    || card.querySelector('a[href*="/products/"]');
  const href = link?.getAttribute('href') || '';
  const match = href.match(/\/products\/([^/\?#]+)/);
  return match ? match[1] : '';
};

/**
 * Extract product title text from a card element.
 * @param {HTMLElement} card - Product card element
 * @returns {string} Product title
 */
const extractTitle = (card) => {
  const titleEl = card.querySelector(
    '.bpn-product-grid-item__title, '
    + '.product-card__title, '
    + '.productGridItem__ProductTitle, '
    + 'h3, h2',
  );
  if (!titleEl) {
    return '';
  }
  const firstChild = titleEl.childNodes?.[0];
  if (firstChild?.nodeType === Node.TEXT_NODE) {
    const text = firstChild.textContent.trim();
    if (text) {
      return text;
    }
  }
  return titleEl.textContent?.trim() || '';
};

/**
 * Extract numeric price from a card element.
 * @param {HTMLElement} card - Product card element
 * @returns {number} Parsed price or 0
 */
const extractPrice = (card) => {
  const priceEl = card.querySelector(
    '.bpn-product-grid-item__price--sale, '
    + '.bpn-product-grid-item__price--regular, '
    + '.has-red-color, '
    + '.card-text.money, '
    + '.productGridItem__productPrice',
  );
  const priceText = priceEl?.textContent?.trim() || '';
  const match = priceText.match(/[\d,]+\.?\d*/);
  return match ? parseFloat(match[0].replace(/,/g, '')) : 0;
};

/**
 * Extract GA4-formatted item data from a single product card.
 * @param {HTMLElement} card - Product card element
 * @param {number} idx - Zero-based index within the list
 * @returns {Object|null} GA4 item object or null on failure
 */
const extractCardData = (card, idx) => {
  try {
    const handle = card.dataset?.productHandle
      || extractHandleFromLink(card);
    const title = extractTitle(card);
    const price = extractPrice(card);

    if (!handle && !title) {
      return null;
    }

    /* eslint-disable camelcase -- GA4 item schema requires snake_case */
    return {
      item_id: handle || `product_${idx}`,
      item_name: title,
      item_brand: 'Bare Performance Nutrition',
      price,
      quantity: 1,
      index: idx + 1,
    };
    /* eslint-enable camelcase */
  } catch (e) {
    console.warn('GTM Data Layer: Failed to extract product card data', e);
    return null;
  }
};

/**
 * Track product list/collection impressions (view_item_list)
 * Uses IntersectionObserver (25% threshold) on product grids
 * Includes MutationObserver for dynamically loaded content
 * @param {Object} config - GTM config object
 */
export const initViewItemList = (config) => {
  if (!isEventEnabled(config, 'view_item_list')) {
    return;
  }

  let observer = null;

  const trackViewItemList = (listElement) => {
    const listContext = getListContext(listElement);
    const cards = listElement.querySelectorAll(CARD_SELECTOR);
    const items = Array.from(cards)
      .map((card, idx) => extractCardData(card, idx))
      .filter(Boolean);

    if (items.length === 0) {
      return;
    }

    /* eslint-disable camelcase -- GA4 ecommerce schema */
    pushToDataLayer({
      event: 'view_item_list',
      ecommerce: {
        currency: getCurrency(),
        item_list_id: listContext.id,
        item_list_name: listContext.name,
        items,
      },
    }, true);
    /* eslint-enable camelcase */
  };

  const observeProductLists = () => {
    if (!observer) {
      return;
    }

    const productLists = document.querySelectorAll(
      LIST_SELECTORS.join(', '),
    );

    productLists.forEach((list) => {
      const hasCards = list.querySelectorAll(CARD_SELECTOR).length > 0;
      const notObserved = !list.hasAttribute('data-gtm-observer-attached');

      if (hasCards && notObserved) {
        list.setAttribute('data-gtm-observer-attached', 'true');
        observer.observe(list);
      }
    });
  };

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting
            && !entry.target.hasAttribute('data-gtm-list-viewed')
          ) {
            entry.target.setAttribute('data-gtm-list-viewed', 'true');
            trackViewItemList(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px' },
    );
  }
  observeProductLists();

  if ('MutationObserver' in window) {
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldRescan = false;
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const isMatch = LIST_SELECTORS.some(
                (sel) => node.matches?.(sel)
                  || node.querySelector?.(sel),
              );
              if (isMatch) {
                shouldRescan = true;
              }
            }
          });
        }
      });
      if (shouldRescan) {
        observeProductLists();
      }
    });

    const target = document.getElementById('MainContent')
      || document.body;
    mutationObserver.observe(target, {
      childList: true,
      subtree: true,
    });
  }
};

/**
 * Selectors for quick-add elements that should NOT trigger select_item.
 * Clicks within these elements are add-to-cart interactions, not product navigation.
 * @type {string}
 */
const QUICK_ADD_SELECTOR = [
  '.quick-add',
  '.product-card__dropdown',
  '.product-card__dropdown-trigger',
  '.product-card__dropdown-content',
  '.product-card__add-button',
  '.js-add-to-cart',
  'form',
  'button',
  'input[type="submit"]',
  'select',
].join(', ');

/**
 * Find the 1-indexed position of a card within its parent product list.
 * @param {HTMLElement} card - Product card element
 * @returns {number} 1-indexed position, defaults to 1
 */
const getCardIndex = (card) => {
  const parent = card.closest(LIST_SELECTORS.join(', '));
  if (!parent) {
    return 1;
  }
  const cards = parent.querySelectorAll(CARD_SELECTOR);
  const idx = Array.from(cards).indexOf(card);
  return (idx >= 0 ? idx : 0) + 1;
};

/**
 * Validate that a click event targets a navigable product card.
 * Returns the card element or null if the click should be ignored.
 * @param {Event} event - Click event
 * @returns {HTMLElement|null} Product card element or null
 */
const getClickedProductCard = (event) => {
  if (event.target.closest(QUICK_ADD_SELECTOR)) {
    return null;
  }

  const productCard = event.target.closest(CARD_SELECTOR);
  if (!productCard) {
    return null;
  }

  const link = productCard.closest('a[href*="/products/"]')
    || productCard.querySelector('a[href*="/products/"]');
  if (!link) {
    return null;
  }

  if (productCard.hasAttribute('data-gtm-select-tracked')) {
    return null;
  }

  return productCard;
};

/**
 * Track product card clicks that navigate to PDP (select_item).
 * Uses event delegation on document for all product card clicks,
 * including dynamically loaded cards.
 * @param {Object} config - GTM config object
 */
export const initSelectItem = (config) => {
  if (!isEventEnabled(config, 'select_item')) {
    return;
  }

  const handleProductClick = (event) => {
    const productCard = getClickedProductCard(event);
    if (!productCard) {
      return;
    }

    productCard.setAttribute('data-gtm-select-tracked', 'true');

    const handle = productCard.dataset?.productHandle
      || extractHandleFromLink(productCard);
    const title = extractTitle(productCard);

    if (!handle && !title) {
      return;
    }

    const listContext = getListContext(productCard);

    /* eslint-disable camelcase -- GA4 ecommerce schema */
    pushToDataLayer({
      event: 'select_item',
      ecommerce: {
        currency: getCurrency(),
        item_list_id: listContext.id,
        item_list_name: listContext.name,
        items: [{
          item_id: handle || 'unknown',
          item_name: title,
          item_brand: 'Bare Performance Nutrition',
          price: extractPrice(productCard),
          quantity: 1,
          index: getCardIndex(productCard),
        }],
      },
    }, true);
    /* eslint-enable camelcase */
  };

  document.addEventListener('click', handleProductClick);
};

/**
 * Format a Shopify cart line item into a GA4 add_to_cart item.
 * @param {Object} cartLineItem - Cart line item from /cart.js
 * @returns {Object} GA4-formatted item with purchase_type and selling_plan_id
 */
const formatCartLineItem = (cartLineItem) => {
  const sellingPlanId = cartLineItem.selling_plan_allocation
    ?.selling_plan?.id || null;

  /* eslint-disable camelcase -- GA4 ecommerce schema */
  return {
    item_id: cartLineItem.sku
      || cartLineItem.variant_id?.toString()
      || 'unknown',
    item_name: cartLineItem.product_title || '',
    item_brand: cartLineItem.vendor || 'Bare Performance Nutrition',
    item_category: cartLineItem.product_type || '',
    item_variant: cartLineItem.variant_title || '',
    price: (cartLineItem.final_price || cartLineItem.price || 0) / 100,
    quantity: cartLineItem.quantity || 1,
    purchase_type: sellingPlanId ? 'subscription' : 'one-time',
    selling_plan_id: sellingPlanId,
  };
  /* eslint-enable camelcase */
};

/**
 * Track items added to cart (add_to_cart).
 * Intercepts /cart/add.js API calls (both fetch and XMLHttpRequest)
 * and reads the added item data directly from the response body.
 * This approach guarantees exactly one event per API call, avoiding
 * the duplicate custom event dispatch issue.
 * @param {Object} config - GTM config object
 */
export const initAddToCart = (config) => {
  if (!isEventEnabled(config, 'add_to_cart')) {
    return;
  }

  let lastAddTimestamp = 0;

  /**
   * Push an add_to_cart event from a /cart/add.js response.
   * Simple 500ms timestamp dedup guards against the rare case
   * where both XHR and fetch paths fire for the same add.
   * @param {Object} responseData - Parsed JSON from /cart/add.js
   */
  const pushAddToCartEvent = (responseData) => {
    if (!responseData) {
      return;
    }

    // Shopify error responses have status/description but no product_title
    if (!responseData.product_title && !responseData.items) {
      return;
    }

    const now = Date.now();
    if (now - lastAddTimestamp < 500) {
      return;
    }
    lastAddTimestamp = now;

    try {
      // Handle multi-item add response: { items: [...] }
      const itemsToTrack = responseData.items
        ? responseData.items
        : [responseData];

      const items = itemsToTrack.map(
        (lineItem) => formatCartLineItem(lineItem),
      );

      const cartValue = items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0,
      );

      pushToDataLayer({
        event: 'add_to_cart',
        ecommerce: {
          currency: getCurrency(),
          value: cartValue,
          items,
        },
      }, true);
    } catch (e) {
      console.warn('GTM Data Layer: add_to_cart - push failed', e);
    }
  };

  // -- Intercept fetch for /cart/add.js --
  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    const [resource] = args;
    const url = typeof resource === 'string'
      ? resource
      : resource?.url || '';

    if (!url.includes('/cart/add.js')) {
      return originalFetch.apply(this, args);
    }

    return originalFetch.apply(this, args).then(async (response) => {
      try {
        const cloned = response.clone();
        const data = await cloned.json();
        pushAddToCartEvent(data);
      } catch (e) {
        console.warn('GTM Data Layer: add_to_cart fetch parse failed', e);
      }
      return response;
    });
  };

  // -- Intercept XMLHttpRequest for /cart/add.js (axios) --
  const OriginalXHROpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (
      typeof url === 'string'
      && url.includes('/cart/add.js')
    ) {
      this.addEventListener('load', function () {
        try {
          const data = JSON.parse(this.responseText);
          pushAddToCartEvent(data);
        } catch (e) {
          console.warn('GTM Data Layer: add_to_cart XHR parse failed', e);
        }
      }, { once: true });
    }
    return OriginalXHROpen.call(this, method, url, ...rest);
  };
};

/**
 * Track cart drawer open (view_cart).
 * Listens to cart:open custom event, fetches /cart.js for full item data.
 * @param {Object} config - GTM config object
 */
export const initViewCart = (config) => {
  if (!isEventEnabled(config, 'view_cart')) {
    return;
  }

  const handleCartOpen = async () => {
    try {
      // Small delay to ensure cart state is current
      await new Promise((resolve) => setTimeout(resolve, 200));

      const cart = await fetchCartState();
      if (!cart || !cart.items || cart.item_count === 0) {
        return;
      }

      const items = cart.items.map(
        (item) => formatCartLineItem(item),
      );

      const cartValue = cart.total_price / 100;

      pushToDataLayer({
        event: 'view_cart',
        ecommerce: {
          currency: getCurrency(),
          value: cartValue,
          items,
        },
      }, true);
    } catch (e) {
      console.warn('GTM Data Layer: view_cart - handler failed', e);
    }
  };

  document.addEventListener('cart:open', handleCartOpen);
};

// -- Cart operation handlers ------------------------------------------------

/**
 * Handle a single cart line item quantity change (update_cart).
 * Fires a flat event (not an ecommerce event) for each quantity change.
 * Ignores removals (newQuantity <= 0) and no-ops (same quantity).
 * @param {Object} updatedItem - Diff entry with item data + previousQuantity/newQuantity
 */
/* eslint-disable camelcase -- GA4 event schema requires snake_case */
const handleUpdateCart = (updatedItem) => {
  if (!updatedItem || updatedItem.previousQuantity === updatedItem.newQuantity) {
    return;
  }

  if (updatedItem.newQuantity <= 0) {
    return;
  }

  pushToDataLayer({
    event: 'update_cart',
    item_id: updatedItem.sku || updatedItem.variantId?.toString() || 'unknown',
    item_name: updatedItem.productTitle || '',
    previous_quantity: updatedItem.previousQuantity,
    new_quantity: updatedItem.newQuantity,
  });
};

/**
 * Handle items completely removed from the cart (remove_from_cart).
 * Fires a single ecommerce event with all removed items in the items array.
 * Prices are converted from Shopify cents to dollars.
 * @param {Array} removedItems - Array of normalized snapshot items that were removed
 */
const handleRemoveFromCart = (removedItems) => {
  if (!removedItems || removedItems.length === 0) {
    return;
  }

  let totalRemovedValue = 0;

  const items = removedItems.map((item) => {
    const itemPrice = (item.price || 0) / 100;
    totalRemovedValue += itemPrice * item.quantity;

    return {
      item_id: item.sku || item.variantId?.toString() || 'unknown',
      item_name: item.productTitle || '',
      item_brand: item.vendor || 'Bare Performance Nutrition',
      item_category: item.productType || '',
      item_variant: item.variantTitle || '',
      price: itemPrice,
      quantity: item.quantity,
    };
  });

  pushToDataLayer({
    event: 'remove_from_cart',
    ecommerce: {
      currency: getCurrency(),
      value: totalRemovedValue,
      items,
    },
  }, true);
};

/**
 * Handle a subscription upsell (subscription toggled ON for a cart item).
 * Fires subscription_upsell event with ecommerce data.
 * Uses time-window dedup to prevent duplicate fires for the same variant.
 * @param {Object} changedItem - Diff entry with oldSellingPlan, newSellingPlan, and newItem
 * @param {Object} dedup - Dedup tracker { lastVariantId, lastTimestamp }
 */
const handleSubscriptionUpsell = (changedItem, dedup) => {
  const item = changedItem.newItem;
  if (!item) {
    return;
  }

  const variantKey = item.variant_id?.toString();
  if (!variantKey) {
    return;
  }

  // 5-second time-window dedup per variant
  const now = Date.now();
  if (dedup.lastVariantId === variantKey && (now - dedup.lastTimestamp) < 5000) {
    return;
  }
  dedup.lastVariantId = variantKey;
  dedup.lastTimestamp = now;

  const formattedItem = formatCartLineItem(item);
  const cartValue = formattedItem.price * formattedItem.quantity;

  pushToDataLayer({
    event: 'subscription_upsell',
    item_id: formattedItem.item_id,
    item_name: formattedItem.item_name,
    upsell_location: 'cart_drawer',
    ecommerce: {
      currency: getCurrency(),
      value: cartValue,
      items: [formattedItem],
    },
  }, true);
};
/* eslint-enable camelcase */

/**
 * Check whether an item is NOT a free gift.
 * Free gift items have `_isFreeGift: true` in their properties
 * (set by syncFreeGift in cart-drawer.vue).
 * @param {Object} item - Normalized snapshot item or diff entry
 * @returns {boolean} true if the item is NOT a free gift
 */
const isNotFreeGift = (item) => {
  // Check the newItem (raw Shopify item) for gift properties
  const props = item.properties || item.newItem?.properties || {};
  return props._isFreeGift !== true
    && props._isFreeGift !== 'true';
};

/**
 * Process a cart diff result and fire the appropriate GTM events.
 * Filters out free gift items before processing to avoid spurious
 * events caused by syncFreeGift() secondary /cart/change.js calls.
 * @param {Object} diff - Diff result from cartStateManager.diffCart()
 * @param {boolean} trackUpdate - Whether update_cart tracking is enabled
 * @param {boolean} trackRemove - Whether remove_from_cart tracking is enabled
 * @param {boolean} trackSubscription - Whether subscription_upsell tracking is enabled
 * @param {Object} subscriptionDedup - Dedup tracker for subscription events
 */
const processCartDiff = (diff, trackUpdate, trackRemove, trackSubscription, subscriptionDedup) => {
  if (!diff) {
    return;
  }

  // Filter out free gift items from all diff arrays
  // syncFreeGift() in cart-drawer.vue makes /cart/change.js
  // calls to manage gift items; those should not produce events
  const filtered = {
    removed: diff.removed.filter(isNotFreeGift),
    updated: diff.updated.filter(isNotFreeGift),
    subscriptionChanged: (diff.subscriptionChanged || [])
      .filter(isNotFreeGift),
  };

  if (trackRemove && filtered.removed.length > 0) {
    handleRemoveFromCart(filtered.removed);
  }

  if (trackUpdate && filtered.updated.length > 0) {
    const quantityChanges = filtered.updated.filter(
      (item) => item.newQuantity > 0,
    );
    quantityChanges.forEach((item) => {
      handleUpdateCart(item);
    });
  }

  if (trackSubscription && filtered.subscriptionChanged?.length) {
    filtered.subscriptionChanged.forEach((changedItem) => {
      if (changedItem.newSellingPlan) {
        handleSubscriptionUpsell(changedItem, subscriptionDedup);
      }
    });
  }
};

/**
 * Initialize cart operation tracking via network interception.
 * Intercepts fetch and XMLHttpRequest calls to /cart/change.js
 * to detect quantity changes and item removals. This replaces the
 * cart:updated custom event listener, which is never dispatched
 * during normal cart quantity/removal operations.
 *
 * The Vue cart drawer uses axios (XMLHttpRequest) via the legacy
 * cart-helper to POST to /cart/change.js for all quantity changes
 * and removals, so XMLHttpRequest interception is required.
 * Fetch interception is included for any future code paths.
 *
 * @param {Object} config - GTM config object
 */
export const initCartOperations = (config) => {
  const trackUpdateCart = isEventEnabled(config, 'update_cart');
  const trackRemoveFromCart = isEventEnabled(config, 'remove_from_cart');
  const trackSubscription = isEventEnabled(config, 'subscription_upsell');

  if (!trackUpdateCart && !trackRemoveFromCart && !trackSubscription) {
    return;
  }

  const subscriptionDedup = { lastVariantId: null, lastTimestamp: 0 };

  const cartManager = createCartStateManager();

  // Take initial snapshot
  cartManager.takeSnapshot();

  // Refresh snapshot after add-to-cart events so the next diff
  // does not treat the newly added item as a change
  const refreshAfterAdd = () => {
    setTimeout(() => cartManager.takeSnapshot(), 500);
  };
  document.addEventListener('cart:ITEM:added', refreshAfterAdd);
  document.addEventListener('rebuy:cart.add', refreshAfterAdd);

  /**
   * Debounced cart diff after /cart/change.js responses settle.
   * Coalesces rapid sequential calls (e.g., user change +
   * subsequent syncFreeGift calls) into a single diff operation.
   */
  let diffTimer = null;

  const diffAfterCartChange = () => {
    // Debounce: coalesce rapid /cart/change.js calls
    // (e.g., user change + subsequent syncFreeGift calls)
    // into a single diff operation
    if (diffTimer) {
      clearTimeout(diffTimer);
    }
    diffTimer = setTimeout(async () => {
      diffTimer = null;
      try {
        const diff = await cartManager.diffCart();
        processCartDiff(
          diff, trackUpdateCart, trackRemoveFromCart,
          trackSubscription, subscriptionDedup,
        );
      } catch (e) {
        console.warn(
          'GTM Data Layer: cart operations - diff failed', e,
        );
      }
    }, 600);
  };

  // -- Intercept fetch for cart change operations --
  const originalFetch = window.fetch;

  window.fetch = function (...args) {
    const [resource] = args;
    const url = typeof resource === 'string'
      ? resource
      : resource?.url || '';

    const isCartOperation = url.includes('/cart/change.js')
      || url.includes('/cart/update.js')
      || url.includes('/cart/clear.js');

    if (!isCartOperation) {
      return originalFetch.apply(this, args);
    }

    return originalFetch.apply(this, args).then((response) => {
      diffAfterCartChange();
      return response;
    });
  };

  // -- Intercept XMLHttpRequest for cart change operations (axios) --
  const OriginalXHROpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (
      typeof url === 'string'
      && (url.includes('/cart/change.js') || url.includes('/cart/update.js') || url.includes('/cart/clear.js'))
    ) {
      this.addEventListener('load', () => {
        diffAfterCartChange();
      }, { once: true });
    }
    return OriginalXHROpen.call(this, method, url, ...rest);
  };
};
