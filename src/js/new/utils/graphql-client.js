/**
 * GraphQL Client for Shopify Storefront API
 *
 * This class handles product filtering using the Shopify GraphQL API, focusing specifically
 * on metafield-based filters (_filter_*) rather than traditional filters.
 */
import { safeGet } from './data-safety.js';

export class GraphQLClient {
  constructor() {
    try {
      // const shopifyStorefrontToken = '575c78378d52ed540959fab685814b1a';
      const shopifyStorefrontToken = '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';

      if (!shopifyStorefrontToken) {
        console.error('Shopify Storefront API token not found. Make sure it is set in theme.liquid with a meta tag.');
      }

      // Get proper shop domain without including protocol - use safe access
      const shopDomain = safeGet(window, 'Shopify.shop') || window.location.hostname;

      this.storefront = {
        domain: `https://${shopDomain}/api/2025-07/graphql.json`,
        token: shopifyStorefrontToken,
      };
    } catch (error) {
      console.error('Error initializing GraphQL client:', error);

      // Set defaults to prevent errors
      this.storefront = {
        domain: `https://${window.location.hostname}/api/2025-07/graphql.json`,
        token: '',
      };
    }
  }

  /**
   * Execute a GraphQL query against the Shopify Storefront API
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Variables for the query
   * @return {Promise} - Promise resolving to the query result
   */
  async query(query, variables = {}) {
    try {
      if (!query) {
        throw new Error('No query provided');
      }

      const response = await fetch(this.storefront.domain, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.storefront.token,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}\n${errorText}`);
      }

      // Use safe JSON parsing
      const responseData = await response.json();

      // Check for GraphQL errors
      const errors = safeGet(responseData, 'errors', []);
      if (errors.length) {
        throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`);
      }

      return safeGet(responseData, 'data', {});
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  /**
   * Get collection data with filtered products
   * @param {string} handle - Collection handle
   * @param {Object} filterParams - Filter parameters from form data
   * @param {string} sortKey - Sort key for products (BEST_SELLING, TITLE, PRICE, CREATED, MANUAL)
   * @param {boolean} reverse - Whether to reverse the sort order
   * @param {number} first - Number of products to fetch (default: 24)
   * @return {Promise} - Promise resolving to collection data
   */
  async getCollection(handle, filterParams = {}, sortKey = 'BEST_SELLING', reverse = false, first = 24) {
    try {
      if (!handle) {
        throw new Error('No collection handle provided');
      }

      // Format the filters for GraphQL
      const filters = this.formatFilters(filterParams);

      // Build the query
      const query = `
        query getCollectionWithFilters(
          $handle: String!,
          $filters: [ProductFilter!],
          $sortKey: ProductCollectionSortKeys,
          $reverse: Boolean,
          $first: Int
        ) {
          collection(handle: $handle) {
            id
            title
            handle
            description
            products(
              first: $first,
              sortKey: $sortKey,
              reverse: $reverse,
              filters: $filters
            ) {
              nodes {
                id
                title
                handle
                description
                productType
                metafield(namespace: "custom", key: "_filter_type") {
                  value
                }
                images(first: 1) {
                  nodes {
                    url
                    altText
                    width
                    height
                  }
                }
                variants(first: 1) {
                  nodes {
                    id
                    title
                    availableForSale
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      `;

      // Execute the query
      return this.query(query, {
        handle,
        filters,
        sortKey,
        reverse,
        first,
      });
    } catch (error) {
      console.error('Error fetching collection data:', error);
      throw error;
    }
  }

  /**
   * Format filter parameters for GraphQL
   * @param {Object} filterParams - Filter parameters from URL or form
   * @return {Array} - Array of filter objects for GraphQL
   */
  formatFilters(filterParams) {
    const filters = [];

    try {
      if (!filterParams || Object.keys(filterParams).length === 0) {
        return filters;
      }

      Object.keys(filterParams).forEach(key => {
        const value = filterParams[key];
        if (!value) { return; }

        // Handle custom metafield filters
        if (key.startsWith('filter.p.m.custom._filter_')) {
          const metafieldKey = key.replace('filter.p.m.custom.', '');
          const values = Array.isArray(value) ? value : [value];

          values.forEach(val => {
            filters.push({
              productMetafield: {
                namespace: 'custom',
                key: metafieldKey,
                value: val,
              },
            });
          });
        }

        // Handle legacy product type filter (optional)
        else if (key === 'filter.p.product_type') {
          const values = Array.isArray(value) ? value : [value];

          values.forEach(val => {
            filters.push({
              productMetafield: {
                namespace: 'custom',
                key: '_filter_type',
                value: val,
              },
            });
          });
        }

        // Handle tag filters (optional)
        else if (key === 'filter.p.tag') {
          const values = Array.isArray(value) ? value : [value];

          values.forEach(val => {
            filters.push({
              productTag: val,
            });
          });
        }
      });
    } catch (error) {
      console.error('Error formatting filters:', error);
    }

    return filters;
  }
}

// Create and export a singleton instance
export const graphqlClient = new GraphQLClient();
