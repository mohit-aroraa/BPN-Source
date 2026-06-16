/**
 * Vue Components for Product Drawer
 *
 * Export vue components for use in the product drawer
 */
import ProductDrawer from './product-drawer.vue';
import ProductImages from './product-images.vue';
import VariantSelector from './variant-selector.vue';
import PurchaseOptions from './purchase-options.vue';

export {
  ProductDrawer,
  ProductImages,
  VariantSelector,
  PurchaseOptions,
};

// Make components available globally for mounting
if (typeof window !== 'undefined') {
  window.ProductDrawerComponent = ProductDrawer;
}
