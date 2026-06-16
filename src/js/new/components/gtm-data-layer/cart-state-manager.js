/**
 * GTM Data Layer - Cart State Manager
 *
 * Maintains a snapshot of cart state for diffing operations.
 * Used by cart operation events (update_cart, remove_from_cart,
 * subscription_upsell) to determine what changed between cart states.
 *
 * @module cart-state-manager
 */
import { fetchCartState } from './utils.js';

/**
 * Normalize a Shopify cart line item into a lightweight snapshot entry.
 * @param {Object} item - Raw Shopify cart line item from /cart.js
 * @returns {Object} Normalized snapshot entry
 */
const normalizeItem = (item) => ({
  key: item.key,
  variantId: item.variant_id,
  sku: item.sku,
  productTitle: item.product_title,
  variantTitle: item.variant_title,
  vendor: item.vendor,
  productType: item.product_type,
  quantity: item.quantity,
  price: item.final_price || item.price,
  sellingPlanAllocation: item.selling_plan_allocation || null,
  properties: item.properties || null,
});

/**
 * Classify a single old item against the new cart items.
 * Pushes to the appropriate result bucket (removed, updated, subscriptionChanged).
 * @param {Object} oldItem - Normalized snapshot item
 * @param {Array} newItems - Raw items from /cart.js
 * @param {Object} result - Accumulator with removed, updated, subscriptionChanged arrays
 */
const classifyOldItem = (oldItem, newItems, result) => {
  // Primary match: use Shopify's unique line item key
  let newItem = newItems.find((item) => item.key === oldItem.key);

  // Falls back to variant_id for robustness
  if (!newItem) {
    newItem = newItems.find(
      (item) => item.variant_id === oldItem.variantId
        && !result._matchedKeys?.has(item.key),
    );
    if (newItem) {
      result._matchedKeys = result._matchedKeys || new Set();
      result._matchedKeys.add(newItem.key);
    }
  }

  if (!newItem) {
    result.removed.push(oldItem);
    return;
  }

  if (newItem.quantity !== oldItem.quantity) {
    result.updated.push({
      ...oldItem,
      previousQuantity: oldItem.quantity,
      newQuantity: newItem.quantity,
      newPrice: newItem.final_price || newItem.price,
    });
    return;
  }

  const oldPlanId = oldItem.sellingPlanAllocation
    ?.selling_plan?.id || null;
  const newPlanId = newItem.selling_plan_allocation
    ?.selling_plan?.id || null;

  if (oldPlanId !== newPlanId) {
    result.subscriptionChanged.push({
      ...oldItem,
      oldSellingPlan: oldPlanId,
      newSellingPlan: newPlanId,
      newItem,
    });
  }
};

/**
 * Find items in the new cart that were not in the old snapshot.
 * @param {Array} newItems - Raw items from /cart.js
 * @param {Array} oldItems - Normalized snapshot items
 * @returns {Array} Newly added raw cart items
 */
const findAddedItems = (newItems, oldItems) => {
  return newItems.filter(
    (newItem) => !oldItems.some(
      (old) => old.key === newItem.key,
    ),
  );
};

/**
 * Create a cart state manager instance.
 * Provides snapshot, diff, and state retrieval for cart operations.
 * @returns {Object} Cart state manager with takeSnapshot, getSnapshot, diffCart
 */
export const createCartStateManager = () => {
  let previousCart = null;
  let isProcessing = false;

  /**
   * Fetch and store the current cart state as a snapshot.
   * @returns {Promise<Object|null>} The stored snapshot or null on failure
   */
  const takeSnapshot = async () => {
    try {
      const cart = await fetchCartState();
      if (cart) {
        previousCart = {
          items: cart.items.map(normalizeItem),
          totalPrice: cart.total_price,
          itemCount: cart.item_count,
        };
      }
    } catch (e) {
      console.warn('GTM Data Layer: cart snapshot failed', e);
    }
    return previousCart;
  };

  /**
   * Get the current stored snapshot without fetching.
   * @returns {Object|null} The stored cart snapshot
   */
  const getSnapshot = () => previousCart;

  /**
   * Compare the stored snapshot against the current cart state.
   * Fetches /cart.js, diffs against the previous snapshot,
   * then updates the snapshot to the new state.
   *
   * @returns {Promise<Object|null>} Diff result with added, removed,
   *   updated, and subscriptionChanged arrays, or null if unavailable
   */
  const diffCart = async () => {
    if (isProcessing) {
      return null;
    }
    isProcessing = true;

    try {
      const oldSnapshot = previousCart;
      const newCart = await fetchCartState();

      if (!oldSnapshot || !newCart) {
        return null;
      }

      const result = {
        added: [],
        removed: [],
        updated: [],
        subscriptionChanged: [],
        _matchedKeys: new Set(),
      };

      // Pass 1: find exact key matches to prevent fallback collisions
      for (const oldItem of oldSnapshot.items) {
        const exactMatch = newCart.items.find((item) => item.key === oldItem.key);
        if (exactMatch) {
          result._matchedKeys.add(exactMatch.key);
        }
      }

      for (const oldItem of oldSnapshot.items) {
        classifyOldItem(oldItem, newCart.items, result);
      }

      delete result._matchedKeys;

      result.added = findAddedItems(newCart.items, oldSnapshot.items);

      // Update snapshot to reflect new state
      await takeSnapshot();

      return result;
    } catch (e) {
      console.warn('GTM Data Layer: cart diff failed', e);
      return null;
    } finally {
      isProcessing = false;
    }
  };

  return { takeSnapshot, getSnapshot, diffCart };
};
