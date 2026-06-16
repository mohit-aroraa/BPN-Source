# Data Safety Utilities

## Overview

The Data Safety Utilities provide a robust approach to handling potentially undefined or null data in JavaScript. These utilities help prevent runtime errors such as "Cannot read property 'x' of undefined" that can break the user experience and cause application crashes.

## Key Utilities

The `data-safety.js` module provides several key functions for safely accessing and manipulating data:

1. **`safeGet(obj, path, defaultValue)`**  
   Safely access nested properties of an object using dot notation.

2. **`exists(value)`**  
   Check if a value is not null or undefined.

3. **`safeNumber(value, defaultValue)`**  
   Safely convert a value to a number with fallback.

4. **`safeFirst(array, defaultValue)`**  
   Safely retrieve the first element of an array.

5. **`safeJsonParse(jsonString, defaultValue)`**  
   Safely parse JSON strings with error handling.

## Implementation

The utilities are located in:

```
src/js/new/utils/data-safety.js
```

## Usage Examples

### Safe Property Access

```js
import { safeGet } from '../../utils/data-safety.js';

// Without safety: 
// This could crash if product is undefined or products.variants is undefined
const variant = product.variants.nodes[0];

// With safety:
// This will return null if any part of the path is undefined
const variant = safeGet(product, 'variants.nodes.0', null);

// Accessing deeply nested properties
const price = safeGet(variant, 'price.amount');
const comparePrice = safeGet(variant, 'compareAtPrice.amount');
```

### Existence Checks

```js
import { exists } from '../../utils/data-safety.js';

// Without safety:
if (value !== null && value !== undefined) {
  // Do something with value
}

// With safety:
if (exists(value)) {
  // Do something with value
}

// In conditional expressions
const displayPrice = exists(compareAtPrice) 
  ? formatMoney(compareAtPrice, currency) 
  : formatMoney(price, currency);
```

### Safe Array Access

```js
import { safeFirst } from '../../utils/data-safety.js';

// Without safety:
// This could crash if products is undefined or empty
const firstProduct = products[0];

// With safety:
// Will return defaultValue if products is undefined or empty
const firstProduct = safeFirst(products, null);

// Common use case with GraphQL data
const firstImage = safeFirst(safeGet(product, 'images.nodes'), null);
```

### Error-Free Number Conversion

```js
import { safeNumber } from '../../utils/data-safety.js';

// Without safety:
// Could return NaN, which might cause issues later
const count = Number(userInput);

// With safety:
// Will return 0 (or custom default) if conversion fails
const count = safeNumber(userInput, 0);

// For price calculations
const price = safeNumber(safeGet(variant, 'price.amount'), 0);
```

### Safe JSON Parsing

```js
import { safeJsonParse } from '../../utils/data-safety.js';

// Without safety:
let data;
try {
  data = JSON.parse(jsonString);
} catch (e) {
  console.error(e);
  data = {};
}

// With safety:
const data = safeJsonParse(jsonString, {});
```

## Integration with Other Modules

These utilities are used throughout the codebase to ensure robustness, particularly in:

1. **Collection Filters**: For safely handling product data from GraphQL
2. **Hamburger Menu**: For safe DOM element access
3. **GraphQL Client**: For safely processing API responses

## Best Practices

1. **Always Use For External Data**
   - API responses
   - User input 
   - Any data with uncertain structure

2. **Provide Meaningful Defaults**
   - Empty arrays (`[]`) for list data
   - Empty objects (`{}`) for object data
   - `null` for reference types
   - Zeros, empty strings, or false for primitive types

3. **Combine With Try/Catch**
   - Wrap operations that might throw errors
   - Provide meaningful error messages and fallbacks

4. **Use Where Optional Chaining Falls Short**
   - For deeply nested paths
   - When you need a default value
   - When accessing numerical array indices

## Performance Considerations

- The utilities add minimal overhead compared to the cost of runtime errors
- For hot paths, consider using direct optional chaining when appropriate
- For complex operations, the benefits of crash prevention outweigh performance concerns

## Testing

When writing tests for code that uses these utilities:

1. Test with complete data
2. Test with partial/incomplete data
3. Test with completely missing data
4. Verify default values are applied correctly

## Extending The Utilities

To add new safety utilities:

1. Add the function to `data-safety.js`
2. Document with JSDoc comments
3. Add examples to the README
4. Consider adding tests

## Example Real-World Integration

```js
// Product card creation with safe data access
export function createProductCard(product) {
  // Get variant and image using safe access helpers
  const variant = safeFirst(safeGet(product, 'variants.nodes'));
  const image = safeFirst(safeGet(product, 'images.nodes'));
  const handle = safeGet(product, 'handle', '');
  const title = safeGet(product, 'title', 'Product');

  // Only continue if we have a valid variant with price data
  if (!variant || !safeGet(variant, 'price.amount')) {
    console.warn('Invalid product data for product card creation:', product);
    return null;
  }

  // Format prices safely
  const price = formatMoney(
    safeGet(variant, 'price.amount'), 
    safeGet(variant, 'price.currencyCode', 'USD')
  );
  
  // Safely check for compareAtPrice
  const compareAtPriceAmount = safeGet(variant, 'compareAtPrice.amount');
  const compareAtPrice = exists(compareAtPriceAmount)
    ? formatMoney(
        compareAtPriceAmount, 
        safeGet(variant, 'compareAtPrice.currencyCode', 'USD')
      )
    : null;

  // Rest of the function...
}
``` 