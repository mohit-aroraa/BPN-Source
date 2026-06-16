# Vue.js Data Safety Utilities

## Overview

The Vue.js Data Safety Utilities provide specialized tools for handling potentially undefined or null data in Vue components. These utilities help prevent common runtime errors like "Cannot read properties of null/undefined" that can break the user experience in Vue applications.

## Key Features

- **Safe Property Access**: Access nested properties without worrying about null/undefined
- **Computed Property Protection**: Wrap computed properties to prevent errors
- **Method Invocation Safety**: Safely call methods that might not exist
- **Default Values**: Provide fallbacks for missing data
- **Error Handling**: Graceful error recovery with meaningful warnings

## Implementation

The utilities are located in:

```
src/js/new/vue/utils/vue-safety.js
```

## Core Utilities

### safeGet

Safely access deeply nested properties with dot notation:

```js
import { safeGet } from '../../vue/utils/vue-safety';

// Instead of this (which might crash):
const price = product.variants[0].price.amount;

// Use this (which returns defaultValue if any part is undefined):
const price = safeGet(product, 'variants.0.price.amount', 0);
```

### exists

Check if a value exists (is not null or undefined):

```js
import { exists } from '../../vue/utils/vue-safety';

if (exists(product.compareAtPrice)) {
  // Safe to use product.compareAtPrice
}
```

### safeComputed

Create safer computed properties that don't throw errors:

```js
import { safeComputed } from '../../vue/utils/vue-safety';
import { computed } from 'vue';

// Instead of this (might throw errors):
const salePrice = computed(() => {
  return product.variants[0].compareAtPrice.amount;
});

// Use this (returns defaultValue if error occurs):
const salePrice = computed(safeComputed(() => {
  return product.variants[0].compareAtPrice.amount;
}, 0));
```

### safeProp

Safely access a direct property with a default value:

```js
import { safeProp } from '../../vue/utils/vue-safety';

// Instead of this:
const title = product && product.title ? product.title : 'Unnamed Product';

// Use this:
const title = safeProp(product, 'title', 'Unnamed Product');
```

### safeInvoke

Safely call a method that might not exist:

```js
import { safeInvoke } from '../../vue/utils/vue-safety';

// Instead of this (might crash):
if (product.hasTag && product.hasTag('sale')) {
  // Show sale badge
}

// Use this:
if (safeInvoke(product, 'hasTag', ['sale'], false)) {
  // Show sale badge
}
```

## Integration with Vue Components

### In Vue Templates

```vue
<template>
  <!-- Use with v-if for conditional rendering -->
  <div v-if="exists(product)">
    <!-- Safe to use product properties -->
  </div>
  
  <!-- With data binding -->
  <img :src="safeGet(product, 'image.url', defaultImageUrl)" :alt="safeProp(product, 'title', '')">
</template>

<script setup>
import { safeGet, exists, safeProp } from '../../vue/utils/vue-safety';

// Define default values
const defaultImageUrl = '/assets/placeholder.jpg';
</script>
```

### For Computed Properties

```vue
<script setup>
import { computed } from 'vue';
import { safeGet, safeComputed } from '../../vue/utils/vue-safety';

// Safe computed property
const displayPrice = computed(safeComputed(() => {
  if (safeGet(product, 'compare_at_price') > safeGet(product, 'price')) {
    return {
      price: formatMoney(safeGet(product, 'price', 0)),
      compareAtPrice: formatMoney(safeGet(product, 'compare_at_price', 0)),
      onSale: true
    };
  }
  
  return {
    price: formatMoney(safeGet(product, 'price', 0)),
    compareAtPrice: null,
    onSale: false
  };
}));
</script>
```

## Real-World Example: Line Item Component

Here's how the utilities are used in the cart line item component:

```js
// Before (prone to errors):
const comparePrice = computed(() => {
  if (hasSubscription) {
    return getFormattedPrice(props.item.selling_plan_allocation.compare_at_price);
  }

  return getFormattedPrice(props.item.price);
});

// After (safe access):
const comparePrice = computed(() => {
  if (hasSubscription.value) {
    return getFormattedPrice(safeGet(props, 'item.selling_plan_allocation.compare_at_price', 0));
  }

  return getFormattedPrice(safeGet(props, 'item.price', 0));
});
```

## Best Practices

1. **Use in Computed Properties**: Vue computed properties are particularly vulnerable to undefined/null errors
2. **Provide Sensible Defaults**: Always specify default values that make sense for your data
3. **Combine with Conditional Rendering**: Use with v-if directives to only render when data exists
4. **Add to Components with External Data**: Especially useful for components that rely on API responses
5. **Consider Performance**: For frequently accessed properties, cache the safe value rather than repeatedly checking

## Common Vue Error Patterns to Avoid

1. **Direct Nested Access**: `product.variants[0].price.amount`
2. **Optional Chaining Limitations**: `product?.variants?.[0]?.price?.amount` (still throws if used in templates)
3. **Implicit Null Checks**: `v-if="product"` (doesn't guarantee nested properties exist)
4. **Missing Error Handling**: Not catching errors in computed properties

## Testing

When writing tests for components using these utilities:

1. Test with null and undefined values for props and data
2. Verify default values are correctly applied
3. Ensure computed properties don't throw errors with incomplete data
4. Check that conditional rendering works correctly

## Further Reading

- [Vue.js Error Handling](https://vuejs.org/guide/essentials/error-handling.html)
- [JavaScript Optional Chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [Vue Computed Properties](https://vuejs.org/guide/essentials/computed.html) 