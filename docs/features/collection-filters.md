# Collection Filters

## Overview

The Collection Filters feature provides instant filtering for collection pages using Shopify's GraphQL API. It allows users to filter products based on metafields, sort results, and see updates without page reloads.

## Key Features

- **Instant Filtering**: Filter products in real-time without page reloads
- **Metafield-Based Filters**: Uses Shopify's custom metafields for powerful filtering
- **URL Parameter Support**: Filter state is maintained in the URL for sharing and bookmarking
- **Sorting Options**: Multiple sort options (price, title, newest, etc.)
- **Active Filter Display**: Shows currently applied filters with ability to remove

## Architecture

The collection filters are implemented using a modular architecture with the following components:

### Directory Structure

```
src/js/new/components/collection-filters/
├── index.js                # Main entry point
├── filter-controller.js    # Main controller class
├── product-display.js      # Functions for product cards and display
├── product-rendering.js    # DOM manipulation for product grid
├── url-params.js           # URL parameter handling
```

### Module Descriptions

1. **Index Module** (`index.js`)
   - Initializes the filter controller
   - Provides public API for the feature

2. **Filter Controller** (`filter-controller.js`) 
   - Coordinates between URL parameters, GraphQL queries, and DOM updates
   - Sets up event listeners for form inputs and filter changes
   - Handles filter application logic

3. **Product Display** (`product-display.js`)
   - Contains functions for creating product cards
   - Handles price formatting and product data display

4. **Product Rendering** (`product-rendering.js`)
   - Manages the product grid DOM updates
   - Shows/hides products based on filter results
   - Handles loading states

5. **URL Parameters** (`url-params.js`)
   - Processes URL parameters for filter state
   - Maintains filter state in URL for sharing

## GraphQL Integration

The collection filters use Shopify's Storefront API with GraphQL to fetch filtered products. The main query includes:

- Collection data
- Filtered products based on selected criteria
- Product details (images, prices, availability)
- Metafield data for filtering

## Data Safety

The module uses defensive programming techniques to ensure stability:

- Comprehensive null checking with utility functions from `data-safety.js` 
- Graceful error handling with appropriate fallbacks
- Detailed logging for debugging purposes


## CSS Classes

Several CSS classes are used to manage states:

- `.is-loading`: Applied during filter operations
- `.bpn-collection__no-results`: Shown when no products match filters

## Usage

### Initialization

```js
import { initCollectionFilters } from './components/collection-filters/index.js';

// Initialize filters
initCollectionFilters();
```

## Event Handling

The module dispatches a custom event when filters are updated:

```js
// Listen for filter updates
window.addEventListener('collection:filtersUpdated', (event) => {
  const { collection } = event.detail;
  // Handle the updated collection data
});
```

## Best Practices

1. **Metafield Naming**: Use consistent naming for filter metafields (e.g., `_filter_category`, `_filter_type`)
2. **Input Names**: Form inputs should use the proper Shopify filter parameter format
3. **Performance**: Minimize DOM updates by only showing/hiding elements when possible
4. **Error Handling**: Always provide graceful fallbacks for missing data 
